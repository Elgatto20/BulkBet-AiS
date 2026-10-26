import React, { useState } from 'react';
import { CurrencyCode } from '../types/betting';
import { CURRENCIES } from '../services/mockFixtures';
import { formatMoney } from '../services/bookmakerEngine';
import { X, Wallet, Plus, RotateCcw, Check } from 'lucide-react';

interface BankrollManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  currency: CurrencyCode;
  onAddFunds: (amount: number) => void;
  onResetBalance: (newBalance: number) => void;
}

export const BankrollManagerModal: React.FC<BankrollManagerModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  currency,
  onAddFunds,
  onResetBalance,
}) => {
  const [customAmount, setCustomAmount] = useState<number>(10000);

  if (!isOpen) return null;

  const quickAdd = [5000, 10000, 25000, 50000, 100000];

  const handleCustomAdd = () => {
    if (customAmount > 0) {
      onAddFunds(customAmount);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Bankroll Management</h3>
              <p className="text-xs text-slate-400 mt-0.5">Deposit or adjust your betting funds in Naira (₦)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Current Balance card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
              Current Available Balance
            </span>
            <div className="text-3xl font-mono font-bold text-emerald-400 tabular-nums mt-1">
              {formatMoney(currentBalance, currency)}
            </div>
          </div>

          {/* Quick Top Ups */}
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-2">
              Quick Add Funds
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickAdd.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    onAddFunds(amount);
                    onClose();
                  }}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 hover:border-emerald-500/50 border border-slate-700 text-white rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+{formatMoney(amount, currency)}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  onResetBalance(50000);
                  onClose();
                }}
                className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1"
                title="Reset balance to initial ₦50,000"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ₦50k</span>
              </button>
            </div>
          </div>

          {/* Custom Deposit Input */}
          <div>
            <label htmlFor="custom-deposit-input" className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-2">
              Custom Deposit Amount
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center">
                <input
                  id="custom-deposit-input"
                  type="number"
                  min="500"
                  step="1000"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-l-lg px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="bg-slate-800 border-y border-r border-slate-700 px-3 py-2 text-xs font-mono text-slate-300 rounded-r-lg font-semibold">
                  ₦ NGN
                </span>
              </div>

              <button
                type="button"
                onClick={handleCustomAdd}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Deposit
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
