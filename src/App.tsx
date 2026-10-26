/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookmakerId, 
  CurrencyCode, 
  LoadedTicket, 
  WagerInstanceMode, 
  BatchExecutionSummary 
} from './types/betting';
import { 
  resolveBookingSlip, 
  recalculateTicketPayout, 
  formatMoney 
} from './services/bookmakerEngine';
import { PRESET_BUNDLES } from './services/presetBundles';
import { Header } from './components/Header';
import { WalletBar } from './components/WalletBar';
import { BulkInputSection } from './components/BulkInputSection';
import { ModeSelector } from './components/ModeSelector';
import { TicketList } from './components/TicketList';
import { TicketDetailsModal } from './components/TicketDetailsModal';
import { BatchProcessingModal } from './components/BatchProcessingModal';
import { PlacedBatchesView } from './components/PlacedBatchesView';
import { BankrollManagerModal } from './components/BankrollManagerModal';
import { 
  Zap, 
  Layers, 
  Sparkles, 
  History, 
  Trophy, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Sliders,
  GitMerge
} from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'loader' | 'history' | 'settlement'>('loader');

  // Bookmaker & Raw input
  const [selectedBookmakerId, setSelectedBookmakerId] = useState<BookmakerId>('sportybet');
  const [rawInput, setRawInput] = useState<string>(PRESET_BUNDLES[0].rawText);

  // Tickets State
  const [loadedTickets, setLoadedTickets] = useState<LoadedTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState<boolean>(false);

  // Wager Instance Mode: 1 (Individual), 2 (Uniform Default), 3 (Hybrid)
  const [wagerMode, setWagerMode] = useState<WagerInstanceMode>('instance_1_individual');
  const [defaultStake, setDefaultStake] = useState<number>(1000);

  // Bankroll & Currency (Nigerian Naira as sole currency)
  const [walletBalance, setWalletBalance] = useState<number>(50000);
  const currency: CurrencyCode = 'NGN';
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);

  // Inspect Modal
  const [inspectedTicket, setInspectedTicket] = useState<LoadedTicket | null>(null);

  // Batch Processing Modal
  const [isProcessingBatchModalOpen, setIsProcessingBatchModalOpen] = useState<boolean>(false);
  const [ticketsForExecution, setTicketsForExecution] = useState<LoadedTicket[]>([]);

  // Placed Batches History
  const [placedBatches, setPlacedBatches] = useState<BatchExecutionSummary[]>([]);

  // Auto-load initial sample tickets on mount so the user immediately sees a populated, working interface!
  useEffect(() => {
    const initialPreset = PRESET_BUNDLES[0];
    const initialTickets = initialPreset.codes.map((code, idx) => {
      const punterTags = ['@PremierPicks', '@BankerDaily', '@GoalHunter', '@AccaKing'];
      return resolveBookingSlip(code, initialPreset.bookmakerId, punterTags[idx % punterTags.length]);
    });
    setLoadedTickets(initialTickets);
  }, []);

  // Stats
  const validTickets = useMemo(() => loadedTickets.filter(t => t.status === 'valid'), [loadedTickets]);
  const selectedTickets = useMemo(() => validTickets.filter(t => t.selected), [validTickets]);
  const totalBatchStake = useMemo(() => selectedTickets.reduce((sum, t) => sum + (t.stake || 0), 0), [selectedTickets]);
  const totalPotentialReturn = useMemo(() => selectedTickets.reduce((sum, t) => sum + (t.potentialPayout || 0), 0), [selectedTickets]);
  const overrideCount = useMemo(() => validTickets.filter(t => t.isCustomOverride).length, [validTickets]);

  // Handler: Parse and load tickets from bulk input
  const handleLoadTickets = (
    codesWithNotes: { code: string; punterNote?: string }[],
    bookmakerId: BookmakerId
  ) => {
    setIsLoadingTickets(true);
    
    // Simulate bookmaker network resolution
    setTimeout(() => {
      const newTickets = codesWithNotes.map((item) => {
        const ticket = resolveBookingSlip(item.code, bookmakerId, item.punterNote);
        // Apply current mode stake rules
        if (wagerMode === 'instance_2_default') {
          return recalculateTicketPayout(ticket, defaultStake);
        } else if (wagerMode === 'instance_3_hybrid') {
          // In hybrid, apply baseline default stake initially
          return recalculateTicketPayout(ticket, defaultStake);
        }
        return ticket;
      });

      setLoadedTickets(newTickets);
      setIsLoadingTickets(false);
    }, 400);
  };

  // Handler: Mode change
  const handleSelectMode = (newMode: WagerInstanceMode) => {
    setWagerMode(newMode);

    if (newMode === 'instance_2_default') {
      // Instance 2: Uniformly set all tickets to default stake
      setLoadedTickets(prev => prev.map(t => ({
        ...recalculateTicketPayout(t, defaultStake),
        isCustomOverride: false,
      })));
    } else if (newMode === 'instance_3_hybrid') {
      // Instance 3: Set baseline default stake, preserve any explicit overrides
      setLoadedTickets(prev => prev.map(t => {
        if (!t.isCustomOverride) {
          return recalculateTicketPayout(t, defaultStake);
        }
        return t;
      }));
    }
  };

  // Handler: Apply default stake to all tickets
  const handleApplyDefaultToAll = (newStake: number) => {
    setLoadedTickets(prev => prev.map(t => ({
      ...recalculateTicketPayout(t, newStake),
      isCustomOverride: false,
    })));
  };

  // Handler: Instance 3 Smart Odds-Based Tier Rules
  const handleApplyHybridOddsRules = () => {
    setLoadedTickets(prev => prev.map(t => {
      let scaledStake = defaultStake;
      // Banker tickets (Odds < 4.0): 2.5x Stake
      if (t.totalOdds < 4.0) {
        scaledStake = Math.round(defaultStake * 2.5);
      } 
      // Longshot Accas (Odds > 15.0): 0.5x Stake
      else if (t.totalOdds > 15.0) {
        scaledStake = Math.max(1, Math.round(defaultStake * 0.5));
      }

      return {
        ...recalculateTicketPayout(t, scaledStake),
        isCustomOverride: true,
      };
    }));
  };

  // Handler: Reset Overrides in Instance 3
  const handleResetOverrides = () => {
    setLoadedTickets(prev => prev.map(t => ({
      ...recalculateTicketPayout(t, defaultStake),
      isCustomOverride: false,
    })));
  };

  // Handler: Toggle single ticket select
  const handleToggleSelect = (id: string) => {
    setLoadedTickets(prev => prev.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };

  // Handler: Select all tickets
  const handleSelectAll = (select: boolean) => {
    setLoadedTickets(prev => prev.map(t => ({ ...t, selected: select })));
  };

  // Handler: Update individual ticket stake (Instance 1 and Instance 3 overrides)
  const handleUpdateTicketStake = (id: string, newStake: number) => {
    setLoadedTickets(prev => prev.map(t => {
      if (t.id === id) {
        const updated = recalculateTicketPayout(t, newStake);
        if (wagerMode === 'instance_3_hybrid') {
          updated.isCustomOverride = true;
        }
        return updated;
      }
      return t;
    }));
  };

  // Handler: Remove ticket
  const handleRemoveTicket = (id: string) => {
    setLoadedTickets(prev => prev.filter(t => t.id !== id));
  };

  // Handler: Execute Batch Placement
  const handleExecuteBatch = () => {
    if (selectedTickets.length === 0 || totalBatchStake > walletBalance) return;
    setTicketsForExecution([...selectedTickets]);
    setIsProcessingBatchModalOpen(true);
  };

  // Handler: Batch Completed
  const handleBatchCompleted = (summary: BatchExecutionSummary) => {
    // Deduct stake from wallet balance
    setWalletBalance(prev => Math.max(0, prev - summary.totalStaked));
    // Add to history
    setPlacedBatches(prev => [summary, ...prev]);
  };

  // Handler: Settle bets in a batch (Simulation)
  const handleSimulateSettlement = (batchId: string) => {
    let totalBatchWinnings = 0;

    setPlacedBatches(prev => prev.map(batch => {
      if (batch.batchId !== batchId || batch.status === 'settled') return batch;

      const settledTickets = batch.tickets.map(t => {
        // Realistic simulation:
        // High odds (>10) have ~25% win rate; lower odds (<4) have ~70% win rate
        const winProbability = t.totalOdds < 4.0 ? 0.70 : t.totalOdds < 12.0 ? 0.40 : 0.22;
        const isWon = Math.random() < winProbability;
        
        if (isWon) {
          totalBatchWinnings += t.potentialPayout;
        }

        return {
          ...t,
          result: isWon ? ('won' as const) : ('lost' as const),
          payoutReceived: isWon ? t.potentialPayout : 0,
        };
      });

      const netPnl = totalBatchWinnings - batch.totalStaked;

      return {
        ...batch,
        status: 'settled',
        tickets: settledTickets,
        settledPnl: netPnl,
      };
    }));

    // Credit winnings to wallet balance
    if (totalBatchWinnings > 0) {
      setWalletBalance(prev => prev + totalBatchWinnings);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* 1. Header (Anti-Slop Top Bar Contract: 3 Zones) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletBalance={walletBalance}
        currency={currency}
        onOpenDeposit={() => setIsDepositModalOpen(true)}
        onQuickPreset={() => {
          const randomPreset = PRESET_BUNDLES[Math.floor(Math.random() * PRESET_BUNDLES.length)];
          setSelectedBookmakerId(randomPreset.bookmakerId);
          setRawInput(randomPreset.rawText);
          const parsed = randomPreset.codes.map(c => ({ code: c }));
          handleLoadTickets(parsed, randomPreset.bookmakerId);
          setActiveTab('loader');
        }}
      />

      {/* 2. Wallet & Batch Outlay Tracker Strip */}
      <WalletBar
        walletBalance={walletBalance}
        currency={currency}
        selectedTicketsCount={selectedTickets.length}
        totalStake={totalBatchStake}
        totalPotentialPayout={totalPotentialReturn}
        onOpenDeposit={() => setIsDepositModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'loader' && (
          <div>
            {/* Context Title & Overview */}
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md overflow-hidden bg-white shrink-0 border border-emerald-500/30 flex items-center justify-center">
                    <img
                      src="/assets/aistudio/1792964699429_49465dcb.jpg"
                      alt="BulkBet Logo"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>BulkBet Wager Batcher</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                  Paste multiple slips from Telegram punters or friends to validate and execute bets in bulk across 3 distinct wager allocation modes.
                </p>
              </div>

              {/* 3 Modes Quick Indicators */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Sliders className="w-3.5 h-3.5" /> Mode 1: Custom Stake
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <Layers className="w-3.5 h-3.5" /> Mode 2: Flat Stake
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <GitMerge className="w-3.5 h-3.5" /> Mode 3: Smart Hybrid
                </span>
              </div>
            </div>

            {/* Bulk Input Section */}
            <BulkInputSection
              selectedBookmakerId={selectedBookmakerId}
              setSelectedBookmakerId={setSelectedBookmakerId}
              rawInput={rawInput}
              setRawInput={setRawInput}
              onLoadTickets={handleLoadTickets}
              isLoading={isLoadingTickets}
            />

            {/* The 3 Instances Mode Selector & Controller */}
            {loadedTickets.length > 0 && (
              <ModeSelector
                currentMode={wagerMode}
                onSelectMode={handleSelectMode}
                defaultStake={defaultStake}
                setDefaultStake={setDefaultStake}
                currency={currency}
                validTicketsCount={validTickets.length}
                overrideCount={overrideCount}
                onApplyDefaultToAll={handleApplyDefaultToAll}
                onApplyHybridOddsRules={handleApplyHybridOddsRules}
                onResetOverrides={handleResetOverrides}
                walletBalance={walletBalance}
              />
            )}

            {/* Loaded Tickets Table & Action Matrix */}
            <TicketList
              tickets={loadedTickets}
              mode={wagerMode}
              currency={currency}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onUpdateTicketStake={handleUpdateTicketStake}
              onRemoveTicket={handleRemoveTicket}
              onInspectTicket={(ticket) => setInspectedTicket(ticket)}
              onExecuteBatch={handleExecuteBatch}
              isProcessingBatch={isProcessingBatchModalOpen}
              walletBalance={walletBalance}
            />
          </div>
        )}

        {(activeTab === 'history' || activeTab === 'settlement') && (
          <div>
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <History className="w-6 h-6 text-emerald-400" />
                  <span>Placed Batches & Settlement Simulator</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Review verified slip references, export batch receipts, and simulate match outcomes to settle bets and update your bankroll.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('loader')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Back to Bulk Loader</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <PlacedBatchesView
              batches={placedBatches}
              currency={currency}
              onSimulateSettlement={handleSimulateSettlement}
              onClearHistory={() => setPlacedBatches([])}
              onGoToLoader={() => setActiveTab('loader')}
            />
          </div>
        )}

      </main>

      {/* Ticket Details Inspector Modal */}
      <TicketDetailsModal
        ticket={inspectedTicket}
        currency={currency}
        onClose={() => setInspectedTicket(null)}
        onUpdateStake={(newStake) => {
          if (inspectedTicket) {
            handleUpdateTicketStake(inspectedTicket.id, newStake);
            setInspectedTicket(prev => prev ? recalculateTicketPayout(prev, newStake) : null);
          }
        }}
      />

      {/* Live Batch Execution Processing Modal */}
      {isProcessingBatchModalOpen && (
        <BatchProcessingModal
          ticketsToProcess={ticketsForExecution}
          currency={currency}
          bookmakerId={selectedBookmakerId}
          onComplete={handleBatchCompleted}
          onClose={() => {
            setIsProcessingBatchModalOpen(false);
            setActiveTab('history');
          }}
        />
      )}

      {/* Bankroll & Deposit Manager Modal */}
      <BankrollManagerModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        currentBalance={walletBalance}
        currency={currency}
        onAddFunds={(amount) => setWalletBalance(prev => prev + amount)}
        onResetBalance={(newBal) => setWalletBalance(newBal)}
      />

      {/* Footer (Subtle and Clean) */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm overflow-hidden bg-white shrink-0 flex items-center justify-center">
              <img
                src="/assets/aistudio/1792964699429_49465dcb.jpg"
                alt="BulkBet Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-slate-400">BulkBet</span>
            <span>·</span>
            <span>Bulk Booking Code Loader & Wager Engine</span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Modes 1, 2 & 3 Support · SportyBet, Bet9ja, Betway, 1xBet, Stake, BetKing
          </div>
        </div>
      </footer>

    </div>
  );
}
