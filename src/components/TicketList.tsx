import React from 'react';
import { LoadedTicket, WagerInstanceMode, CurrencyCode, BookmakerId } from '../types/betting';
import { BOOKMAKERS } from '../services/mockFixtures';
import { formatMoney } from '../services/bookmakerEngine';
import { 
  Check, 
  Trash2, 
  Eye, 
  Copy, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  ExternalLink,
  Zap
} from 'lucide-react';

interface TicketListProps {
  tickets: LoadedTicket[];
  mode: WagerInstanceMode;
  currency: CurrencyCode;
  onToggleSelect: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onUpdateTicketStake: (id: string, newStake: number) => void;
  onRemoveTicket: (id: string) => void;
  onInspectTicket: (ticket: LoadedTicket) => void;
  onExecuteBatch: () => void;
  isProcessingBatch: boolean;
  walletBalance: number;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  mode,
  currency,
  onToggleSelect,
  onSelectAll,
  onUpdateTicketStake,
  onRemoveTicket,
  onInspectTicket,
  onExecuteBatch,
  isProcessingBatch,
  walletBalance,
}) => {
  const selectedTickets = tickets.filter((t) => t.selected && t.status === 'valid');
  const totalSelectedStake = selectedTickets.reduce((acc, t) => acc + (t.stake || 0), 0);
  const totalPotentialPayout = selectedTickets.reduce((acc, t) => acc + (t.potentialPayout || 0), 0);
  const allSelected = tickets.length > 0 && tickets.every((t) => t.selected);
  const isOverBalance = totalSelectedStake > walletBalance;

  const getBookmaker = (id: BookmakerId) => BOOKMAKERS.find((b) => b.id === id) || BOOKMAKERS[0];

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
  };

  if (tickets.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
      
      {/* Table Header / Action Bar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Select All & Count */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <span>Select All ({tickets.length} Slips)</span>
          </label>

          <span className="text-slate-600">·</span>

          <span className="text-xs text-slate-400">
            <strong className="text-emerald-400">{selectedTickets.length}</strong> ready to wager
          </span>
        </div>

        {/* Right: Primary Batch Execution Button */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">
              Total Wager: <span className="font-mono font-bold text-white tabular-nums">{formatMoney(totalSelectedStake, currency)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onExecuteBatch}
            disabled={selectedTickets.length === 0 || isProcessingBatch || isOverBalance}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-md ${
              selectedTickets.length > 0 && !isProcessingBatch && !isOverBalance
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            {isProcessingBatch ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Executing BulkBet...
              </>
            ) : isOverBalance ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-400" />
                Insufficient Balance
              </>
            ) : (
              <>
                <div className="w-4 h-4 rounded-sm overflow-hidden shrink-0 bg-white flex items-center justify-center">
                  <img
                    src="/assets/aistudio/1792964699429_49465dcb.jpg"
                    alt="BulkBet Icon"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span>BulkBet ({selectedTickets.length} Tickets)</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Ticket List Items */}
      <div className="divide-y divide-slate-800/80">
        {tickets.map((ticket, index) => {
          const bm = getBookmaker(ticket.bookmakerId);
          const isValid = ticket.status === 'valid';

          return (
            <div
              key={ticket.id}
              className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                !ticket.selected ? 'opacity-50 bg-slate-950/30' : 'hover:bg-slate-800/30'
              }`}
            >
              
              {/* Left Column: Checkbox, Code, Bookmaker, Punter Info */}
              <div className="flex items-start sm:items-center gap-3 min-w-[240px]">
                <input
                  type="checkbox"
                  disabled={!isValid}
                  checked={ticket.selected && isValid}
                  onChange={() => onToggleSelect(ticket.id)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 mt-1 sm:mt-0 cursor-pointer"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-white tracking-wider">
                      {ticket.code}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => copyToClipboard(ticket.code)}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-3 h-3" />
                    </button>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${bm.badgeColor}`}>
                      {bm.name}
                    </span>

                    {ticket.isCustomOverride && mode === 'instance_3_hybrid' && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Custom Stake
                      </span>
                    )}
                  </div>

                  {/* Punter / Tipster note or Error */}
                  {ticket.validationError ? (
                    <div className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      <span>{ticket.validationError}</span>
                    </div>
                  ) : ticket.punterTag ? (
                    <div className="text-xs text-slate-400 mt-0.5">
                      Punter: <span className="text-slate-300 font-medium">{ticket.punterTag}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 mt-0.5">
                      Loaded slip #{index + 1}
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Column: Legs Preview & Cumulative Odds */}
              {isValid ? (
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  
                  {/* Legs count & Preview button */}
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Legs</span>
                    <button
                      type="button"
                      onClick={() => onInspectTicket(ticket)}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-0.5 group"
                    >
                      <span>{ticket.legs.length} Matches</span>
                      <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Cumulative Odds */}
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Total Odds</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-base font-mono font-bold text-emerald-400 tabular-nums">
                        {ticket.totalOdds.toFixed(2)}
                      </span>
                      {ticket.accumulatorBonusPercent > 0 && (
                        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-950/60 px-1 rounded border border-emerald-900">
                          +{ticket.accumulatorBonusPercent}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stake input / controller */}
                  <div className="min-w-[140px]">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                      <span>Wager Stake</span>
                      {mode === 'instance_2_default' && (
                        <span className="text-[10px] text-cyan-400">Uniform</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      {mode === 'instance_2_default' ? (
                        <div className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono font-bold text-slate-200">
                          {formatMoney(ticket.stake, currency)}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <input
                            type="number"
                            min="50"
                            step="100"
                            value={ticket.stake}
                            onChange={(e) => onUpdateTicketStake(ticket.id, parseFloat(e.target.value) || 0)}
                            className="w-24 bg-slate-950 border border-slate-700 rounded-l px-2 py-1 text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="bg-slate-800 border-y border-r border-slate-700 px-1.5 py-1 text-[11px] font-mono text-slate-400 rounded-r">
                            ₦
                          </span>
                        </div>
                      )}

                      {mode === 'instance_1_individual' && (
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateTicketStake(ticket.id, Math.max(50, ticket.stake - 200))}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono"
                          >
                            -200
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateTicketStake(ticket.id, ticket.stake + 500)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono"
                          >
                            +500
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Potential Return */}
                  <div className="min-w-[120px]">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Potential Return</span>
                    <div className="text-base font-mono font-bold text-amber-300 tabular-nums mt-0.5">
                      {formatMoney(ticket.potentialPayout, currency)}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Ticket unavailable for placement
                </div>
              )}

              {/* Right: Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {isValid && (
                  <button
                    type="button"
                    onClick={() => onInspectTicket(ticket)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Inspect match legs"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onRemoveTicket(ticket.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                  title="Remove ticket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Footer Outlay Strip */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="text-slate-400 flex items-center gap-4">
          <span>{tickets.length} total slips imported</span>
          <span>·</span>
          <span>Mode: <strong className="text-white">{mode === 'instance_1_individual' ? 'Custom Stake Mode' : mode === 'instance_2_default' ? 'Flat Stake Mode' : 'Smart Hybrid Mode'}</strong></span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400">Total Wager: </span>
            <span className="font-bold text-white tabular-nums">{formatMoney(totalSelectedStake, currency)}</span>
          </div>
          <div>
            <span className="text-slate-400">Combined Potential Win: </span>
            <span className="font-bold text-amber-400 tabular-nums">{formatMoney(totalPotentialPayout, currency)}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
