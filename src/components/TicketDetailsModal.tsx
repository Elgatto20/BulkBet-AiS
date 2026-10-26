import React from 'react';
import { LoadedTicket, CurrencyCode } from '../types/betting';
import { BOOKMAKERS } from '../services/mockFixtures';
import { formatMoney } from '../services/bookmakerEngine';
import { X, Calendar, Trophy, Percent, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TicketDetailsModalProps {
  ticket: LoadedTicket | null;
  currency: CurrencyCode;
  onClose: () => void;
  onUpdateStake: (newStake: number) => void;
}

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  ticket,
  currency,
  onClose,
  onUpdateStake,
}) => {
  if (!ticket) return null;

  const bm = BOOKMAKERS.find((b) => b.id === ticket.bookmakerId) || BOOKMAKERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono uppercase px-2.5 py-1 rounded font-bold border ${bm.badgeColor}`}>
              {bm.name}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-mono tracking-wider text-white">
                  {ticket.code}
                </h3>
                {ticket.punterTag && (
                  <span className="text-xs text-slate-400 font-medium">
                    ({ticket.punterTag})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {ticket.legs.length} Selections Accumulator Slip
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matches / Legs List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
            Match Selections ({ticket.legs.length} Legs)
          </div>

          {ticket.legs.map((leg, idx) => (
            <div
              key={leg.id}
              className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500">#{idx + 1}</span>
                  <span className="text-slate-300 font-medium">{leg.tournament}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{leg.startTime}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {leg.match}
                  </div>
                  <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                    <span className="text-slate-400">{leg.market}:</span>
                    <strong className="text-white">{leg.selection}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Odds</span>
                  <span className="text-base font-mono font-bold text-emerald-400 tabular-nums">
                    {leg.odds.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer: Slip Odds, Stake & Potential Payout */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Cumulative Odds</span>
              <span className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
                {ticket.totalOdds.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Acca Bonus</span>
              <span className="text-lg font-mono font-bold text-cyan-400 tabular-nums">
                +{ticket.accumulatorBonusPercent}%
              </span>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Potential Win</span>
              <span className="text-lg font-mono font-bold text-amber-300 tabular-nums">
                {formatMoney(ticket.potentialPayout, currency)}
              </span>
            </div>

          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <label htmlFor="modal-stake-input" className="text-xs text-slate-400 font-medium">
                Tune Ticket Stake:
              </label>
              <div className="flex items-center">
                <input
                  id="modal-stake-input"
                  type="number"
                  min="50"
                  step="100"
                  value={ticket.stake}
                  onChange={(e) => onUpdateStake(parseFloat(e.target.value) || 0)}
                  className="w-28 bg-slate-900 border border-slate-700 rounded-l px-2.5 py-1 text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="bg-slate-800 border-y border-r border-slate-700 px-2 py-1 text-xs font-mono text-slate-400 rounded-r">
                  ₦
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Done Inspecting
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
