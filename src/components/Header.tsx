import React from 'react';
import { Layers, Sparkles, History, Wallet, Trophy } from 'lucide-react';
import { formatMoney } from '../services/bookmakerEngine';

interface HeaderProps {
  activeTab: 'loader' | 'history' | 'settlement';
  setActiveTab: (tab: 'loader' | 'history' | 'settlement') => void;
  walletBalance: number;
  currency: string;
  onOpenDeposit: () => void;
  onQuickPreset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  walletBalance,
  currency,
  onOpenDeposit,
  onQuickPreset,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand wordmark (single line, distinctive display) */}
        <button 
          type="button"
          onClick={() => setActiveTab('loader')}
          className="flex items-center gap-3 shrink-0 cursor-pointer text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/30 flex items-center justify-center bg-white shadow-sm shadow-emerald-950/40">
            <img
              src="/assets/aistudio/1792964699429_49465dcb.jpg"
              alt="BulkBet App Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white whitespace-nowrap">
              BulkBet
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single line, functional segmented tabs) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Placed Batches
          </button>

          <button
            onClick={() => setActiveTab('settlement')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'settlement'
                ? 'bg-slate-800 text-white shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Results Simulator
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Wallet / Bankroll Trigger) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onQuickPreset}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:border-slate-600 hover:text-white transition-all whitespace-nowrap"
            title="Load sample codes directly"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Try Preset Drop
          </button>

          <button
            onClick={onOpenDeposit}
            className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all whitespace-nowrap"
            title="Manage Bankroll Balance"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono tabular-nums font-semibold">
              {formatMoney(walletBalance, currency)}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
