import React from 'react';
import { DollarSign, ShieldAlert, ArrowUpRight, Percent, RefreshCw } from 'lucide-react';
import { CurrencyCode } from '../types/betting';
import { CURRENCIES } from '../services/mockFixtures';
import { formatMoney } from '../services/bookmakerEngine';

interface WalletBarProps {
  walletBalance: number;
  currency: CurrencyCode;
  selectedTicketsCount: number;
  totalStake: number;
  totalPotentialPayout: number;
  onOpenDeposit: () => void;
}

export const WalletBar: React.FC<WalletBarProps> = ({
  walletBalance,
  currency,
  selectedTicketsCount,
  totalStake,
  totalPotentialPayout,
  onOpenDeposit,
}) => {
  const isOverBankroll = totalStake > walletBalance;
  const stakeRatio = walletBalance > 0 ? (totalStake / walletBalance) * 100 : 0;

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Summary Metrics */}
        <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
          {/* Active Balance */}
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Bankroll Balance</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-white">
                {formatMoney(walletBalance, currency)}
              </span>
              <button
                onClick={onOpenDeposit}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium hover:underline inline-flex items-center"
              >
                Top Up
              </button>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          {/* Selected Tickets & Total Stake */}
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Batch Outlay ({selectedTicketsCount} Slips)</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-base sm:text-lg font-bold font-mono tabular-nums ${isOverBankroll ? 'text-red-400' : 'text-emerald-400'}`}>
                {formatMoney(totalStake, currency)}
              </span>
              {isOverBankroll && (
                <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Insufficient Balance
                </span>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          {/* Potential Return */}
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Max Potential Return</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-amber-300">
                {formatMoney(totalPotentialPayout, currency)}
              </span>
              {totalStake > 0 && totalPotentialPayout > 0 && (
                <span className="text-[11px] font-mono text-slate-400">
                  ({Math.round((totalPotentialPayout / totalStake) * 10) / 10}x)
                </span>
              )}
            </div>
          </div>

          {/* Exposure meter */}
          {walletBalance > 0 && totalStake > 0 && (
            <div className="hidden lg:block">
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">
                Exposure: {Math.round(stakeRatio)}%
              </span>
              <div className="w-24 h-2 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    stakeRatio > 100
                      ? 'bg-red-500'
                      : stakeRatio > 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, stakeRatio)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Static Currency Indicator */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-semibold tracking-wider flex items-center gap-1.5">
            <span>₦ NGN</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 text-[10px]">Nigerian Naira</span>
          </span>
        </div>

      </div>
    </div>
  );
};
