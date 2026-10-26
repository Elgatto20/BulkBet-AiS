import React, { useState, useEffect } from 'react';
import { LoadedTicket, CurrencyCode, BookmakerId, BatchExecutionSummary } from '../types/betting';
import { BOOKMAKERS } from '../services/mockFixtures';
import { formatMoney } from '../services/bookmakerEngine';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Receipt, 
  ArrowRight,
  Layers,
  X
} from 'lucide-react';

interface BatchProcessingModalProps {
  ticketsToProcess: LoadedTicket[];
  currency: CurrencyCode;
  bookmakerId: BookmakerId;
  onComplete: (summary: BatchExecutionSummary) => void;
  onClose: () => void;
}

export const BatchProcessingModal: React.FC<BatchProcessingModalProps> = ({
  ticketsToProcess,
  currency,
  bookmakerId,
  onComplete,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [processedTickets, setProcessedTickets] = useState<LoadedTicket[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [progressPercent, setProgressPercent] = useState(5);

  const bm = BOOKMAKERS.find((b) => b.id === bookmakerId) || BOOKMAKERS[0];
  const totalStake = ticketsToProcess.reduce((sum, t) => sum + (t.stake || 0), 0);
  const totalPotentialReturn = ticketsToProcess.reduce((sum, t) => sum + (t.potentialPayout || 0), 0);

  const steps = [
    `Connecting to ${bm.name} Gateway API...`,
    'Verifying booking codes & active market integrity...',
    'Locking in live accumulator odds and bonuses...',
    'Authorizing stake deductions & executing wagers...',
    'Generating official bookmaker slip references...',
  ];

  useEffect(() => {
    let currentStep = 0;
    let ticketIndex = 0;
    const finalTickets: LoadedTicket[] = [];

    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setCurrentStepIndex(currentStep);
        setProgressPercent(Math.min(85, Math.round((currentStep / steps.length) * 85)));
      } else if (ticketIndex < ticketsToProcess.length) {
        const ticket = ticketsToProcess[ticketIndex];
        const refId = `${bm.shortCode}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        
        const updatedTicket: LoadedTicket = {
          ...ticket,
          status: 'placed',
          placedReference: refId,
          placedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          result: 'pending',
        };

        finalTickets.push(updatedTicket);
        setProcessedTickets([...finalTickets]);
        ticketIndex++;
        setProgressPercent(85 + Math.round((ticketIndex / ticketsToProcess.length) * 15));
      } else {
        clearInterval(interval);
        setIsFinished(true);
        setProgressPercent(100);

        const summary: BatchExecutionSummary = {
          batchId: `BATCH-${Date.now().toString(36).toUpperCase()}`,
          placedAt: new Date().toLocaleString('en-GB'),
          bookmakerId,
          instanceMode: 'instance_1_individual',
          totalTickets: ticketsToProcess.length,
          successfulTickets: finalTickets.filter(t => t.status === 'placed').length,
          failedTickets: finalTickets.filter(t => t.status === 'failed').length,
          totalStaked: totalStake,
          totalPotentialPayout: totalPotentialReturn,
          currency,
          tickets: finalTickets,
          status: 'pending',
        };

        onComplete(summary);
      }
    }, 450);

    return () => clearInterval(interval);
  }, []);

  const exportReceiptCSV = () => {
    const headers = ['Slip Code', 'Bookmaker', 'Punter', 'Legs', 'Total Odds', `Stake (${currency})`, `Potential Payout (${currency})`, 'Reference'];
    const rows = (processedTickets.length > 0 ? processedTickets : ticketsToProcess).map((t) => [
      t.code,
      bm.name,
      t.punterTag || 'None',
      t.legs.length,
      t.totalOdds.toFixed(2),
      t.stake.toFixed(2),
      t.potentialPayout.toFixed(2),
      t.placedReference || 'Pending',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OmniSlip_Receipt_${bm.shortCode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-500/30 flex items-center justify-center bg-white shadow-sm shadow-emerald-950/40">
              <img
                src="/assets/aistudio/1792964699429_49465dcb.jpg"
                alt="BulkBet Icon"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>BulkBet Gateway Engine</span>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${bm.badgeColor}`}>
                  {bm.name}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFinished ? 'All wagers placed successfully' : 'Processing entries against bookmaker gateway'}
              </p>
            </div>
          </div>

          {isFinished && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress & Current Step */}
        <div className="p-5 bg-slate-950/40 border-b border-slate-800">
          
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300">
              {isFinished ? 'Execution Completed' : steps[currentStepIndex]}
            </span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

        </div>

        {/* Real-time Ticket Status Queue */}
        <div className="p-5 max-h-64 overflow-y-auto space-y-2">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
            Ticket Placement Queue ({processedTickets.length} / {ticketsToProcess.length})
          </div>

          {ticketsToProcess.map((ticket, index) => {
            const isProcessed = processedTickets.some(p => p.id === ticket.id);
            const processedItem = processedTickets.find(p => p.id === ticket.id);

            return (
              <div
                key={ticket.id}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                  isProcessed
                    ? 'bg-emerald-950/20 border-emerald-900/60 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isProcessed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600 shrink-0 animate-pulse" />
                  )}

                  <div>
                    <span className="font-mono font-bold text-white tracking-wider">
                      {ticket.code}
                    </span>
                    <span className="text-slate-500 ml-2">
                      ({ticket.legs.length} legs · {ticket.totalOdds.toFixed(2)} odds)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-300 font-medium">
                    {formatMoney(ticket.stake, currency)}
                  </span>

                  {isProcessed && processedItem?.placedReference ? (
                    <span className="font-mono text-[11px] text-emerald-400 font-semibold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-900">
                      {processedItem.placedReference}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">
                      Queued
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Summary & Actions */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-3">
          
          <div className="flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400">Total Wager: </span>
              <strong className="text-white">{formatMoney(totalStake, currency)}</strong>
            </div>
            <div>
              <span className="text-slate-400">Combined Return: </span>
              <strong className="text-amber-400">{formatMoney(totalPotentialReturn, currency)}</strong>
            </div>
          </div>

          {isFinished && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={exportReceiptCSV}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export Slip CSV
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <span>View Placed Batches</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
