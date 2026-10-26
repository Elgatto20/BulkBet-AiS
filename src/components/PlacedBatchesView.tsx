import React from 'react';
import { BatchExecutionSummary, CurrencyCode } from '../types/betting';
import { BOOKMAKERS } from '../services/mockFixtures';
import { formatMoney } from '../services/bookmakerEngine';
import { 
  Trophy, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  Trash2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PlacedBatchesViewProps {
  batches: BatchExecutionSummary[];
  currency: CurrencyCode;
  onSimulateSettlement: (batchId: string) => void;
  onClearHistory: () => void;
  onGoToLoader: () => void;
}

export const PlacedBatchesView: React.FC<PlacedBatchesViewProps> = ({
  batches,
  currency,
  onSimulateSettlement,
  onClearHistory,
  onGoToLoader,
}) => {
  const getBookmaker = (id: string) => BOOKMAKERS.find((b) => b.id === id) || BOOKMAKERS[0];

  const totalAllTimeStaked = batches.reduce((sum, b) => sum + b.totalStaked, 0);
  const totalSettledPnl = batches.reduce((sum, b) => sum + (b.settledPnl || 0), 0);

  if (batches.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center max-w-xl mx-auto my-8">
        <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mx-auto mb-4">
          <Layers className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">No Batches Placed Yet</h3>
        <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
          Paste booking codes from punters or load a sample preset bundle to execute your first batch wager.
        </p>
        <button
          type="button"
          onClick={onGoToLoader}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Open Bulk Code Loader</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Overview Stats Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">Total Batches Run</span>
            <span className="text-lg font-mono font-bold text-white tabular-nums">
              {batches.length} Batches
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">Total Volume Staked</span>
            <span className="text-lg font-mono font-bold text-slate-200 tabular-nums">
              {formatMoney(totalAllTimeStaked, currency)}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">Settled Realized P&L</span>
            <span className={`text-lg font-mono font-bold tabular-nums ${totalSettledPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalSettledPnl >= 0 ? `+${formatMoney(totalSettledPnl, currency)}` : formatMoney(totalSettledPnl, currency)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5 ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Placed History
        </button>
      </div>

      {/* Batches List */}
      <div className="space-y-4">
        {batches.map((batch) => {
          const bm = getBookmaker(batch.bookmakerId);
          const isPending = batch.status === 'pending';
          const wonTicketsCount = batch.tickets.filter((t) => t.result === 'won').length;
          const lostTicketsCount = batch.tickets.filter((t) => t.result === 'lost').length;

          return (
            <div
              key={batch.batchId}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
            >
              
              {/* Batch Banner Header */}
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded font-bold border ${bm.badgeColor}`}>
                    {bm.name}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white">
                        {batch.batchId}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        ({batch.placedAt})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Settle Action / Status */}
                <div className="flex items-center gap-3">
                  {isPending ? (
                    <button
                      type="button"
                      onClick={() => onSimulateSettlement(batch.batchId)}
                      className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Simulate match fixtures to settle slips"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Simulate Match Outcomes
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {wonTicketsCount} Won
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> {lostTicketsCount} Lost
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className={`font-bold ${batch.settledPnl && batch.settledPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        P&L: {batch.settledPnl && batch.settledPnl >= 0 ? `+${formatMoney(batch.settledPnl, currency)}` : formatMoney(batch.settledPnl || 0, currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tickets Table */}
              <div className="divide-y divide-slate-800/60 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/40 text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                    <tr>
                      <th className="py-2.5 px-4">Booking Code</th>
                      <th className="py-2.5 px-4">Slip Ref</th>
                      <th className="py-2.5 px-4">Punter Note</th>
                      <th className="py-2.5 px-4">Legs</th>
                      <th className="py-2.5 px-4">Total Odds</th>
                      <th className="py-2.5 px-4">Stake</th>
                      <th className="py-2.5 px-4">Potential Win</th>
                      <th className="py-2.5 px-4 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 font-mono">
                    {batch.tickets.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-white tracking-wider">
                          {t.code}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                          {t.placedReference || '—'}
                        </td>
                        <td className="py-2.5 px-4 font-sans text-slate-300">
                          {t.punterTag || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-300">
                          {t.legs.length} matches
                        </td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold tabular-nums">
                          {t.totalOdds.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-slate-200 tabular-nums">
                          {formatMoney(t.stake, currency)}
                        </td>
                        <td className="py-2.5 px-4 text-amber-300 tabular-nums">
                          {formatMoney(t.potentialPayout, currency)}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {t.result === 'won' ? (
                            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                              WON +{formatMoney(t.payoutReceived || t.potentialPayout, currency)}
                            </span>
                          ) : t.result === 'lost' ? (
                            <span className="text-[11px] font-bold text-red-400 bg-red-950/60 border border-red-800 px-2 py-0.5 rounded">
                              LOST
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                              <Clock className="w-3 h-3 text-slate-500" /> In Play
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Batch Footer */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>{batch.tickets.length} Slips placed in this batch</span>
                <div>
                  <span>Total Staked: <strong className="text-white">{formatMoney(batch.totalStaked, currency)}</strong></span>
                  <span className="mx-2">·</span>
                  <span>Max Combined Win: <strong className="text-amber-400">{formatMoney(batch.totalPotentialPayout, currency)}</strong></span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
