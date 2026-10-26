import React from 'react';
import { WagerInstanceMode, CurrencyCode, HybridRule } from '../types/betting';
import { Sliders, Layers, GitMerge, DollarSign, Sparkles, RotateCcw, Info } from 'lucide-react';
import { formatMoney } from '../services/bookmakerEngine';

interface ModeSelectorProps {
  currentMode: WagerInstanceMode;
  onSelectMode: (mode: WagerInstanceMode) => void;
  defaultStake: number;
  setDefaultStake: (stake: number) => void;
  currency: CurrencyCode;
  validTicketsCount: number;
  overrideCount: number;
  onApplyDefaultToAll: (stake: number) => void;
  onApplyHybridOddsRules: () => void;
  onResetOverrides: () => void;
  walletBalance: number;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  defaultStake,
  setDefaultStake,
  currency,
  validTicketsCount,
  overrideCount,
  onApplyDefaultToAll,
  onApplyHybridOddsRules,
  onResetOverrides,
  walletBalance,
}) => {
  const quickStakes = [500, 1000, 2000, 5000, 10000];

  const handleDefaultStakeChange = (val: number) => {
    const safe = Math.max(100, Math.round(val));
    setDefaultStake(safe);
    if (currentMode === 'instance_2_default' || currentMode === 'instance_3_hybrid') {
      onApplyDefaultToAll(safe);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 mb-6">
      
      {/* Header & Mode Explanation */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
            3. CHOOSE WAGER ALLOCATION MODE
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Select how the batch engine should allocate stakes across the loaded slips:
          </p>
        </div>
      </div>

      {/* 3 Main Modes Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800 mb-4">
        
        {/* Mode 1 */}
        <button
          type="button"
          onClick={() => onSelectMode('instance_1_individual')}
          className={`text-left p-3 rounded-md transition-all relative ${
            currentMode === 'instance_1_individual'
              ? 'bg-slate-900 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sliders className={`w-4 h-4 ${currentMode === 'instance_1_individual' ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              MODE 1
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-100">
            Custom Stake Mode
          </div>
          <div className="text-[11px] text-slate-400 mt-1 leading-snug">
            Decide custom stake amount on each individual ticket before execution.
          </div>
        </button>

        {/* Mode 2 */}
        <button
          type="button"
          onClick={() => onSelectMode('instance_2_default')}
          className={`text-left p-3 rounded-md transition-all relative ${
            currentMode === 'instance_2_default'
              ? 'bg-slate-900 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Layers className={`w-4 h-4 ${currentMode === 'instance_2_default' ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              MODE 2
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-100">
            Flat Stake Mode
          </div>
          <div className="text-[11px] text-slate-400 mt-1 leading-snug">
            Set 1 flat fee applied uniformly to all codes and place together.
          </div>
        </button>

        {/* Mode 3 */}
        <button
          type="button"
          onClick={() => onSelectMode('instance_3_hybrid')}
          className={`text-left p-3 rounded-md transition-all relative ${
            currentMode === 'instance_3_hybrid'
              ? 'bg-slate-900 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <GitMerge className={`w-4 h-4 ${currentMode === 'instance_3_hybrid' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              MODE 3
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-100">
            Smart Hybrid Mode
          </div>
          <div className="text-[11px] text-slate-400 mt-1 leading-snug">
            Baseline default fee + selective ticket overrides & smart odds rules.
          </div>
        </button>

      </div>

      {/* Dynamic Controls based on selected Mode */}
      {currentMode === 'instance_1_individual' && (
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Individual Mode Active:</strong> You can tune the stake input on each ticket card below.
            </span>
          </div>

          {/* Quick Fill actions for convenience */}
          <div className="flex flex-wrap items-center gap-1.5 ml-auto">
            <span className="text-slate-500 text-[11px]">Quick set all to:</span>
            {quickStakes.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => onApplyDefaultToAll(amount)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-[11px] transition-colors"
              >
                {formatMoney(amount, currency)}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentMode === 'instance_2_default' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Master Default Stake Input */}
            <div className="flex items-center gap-3">
              <label htmlFor="default-stake-input" className="text-xs font-semibold text-slate-300 whitespace-nowrap">
                Default Stake Fee per Code:
              </label>
              
              <div className="flex items-center">
                <input
                  id="default-stake-input"
                  type="number"
                  min="0.5"
                  step="1"
                  value={defaultStake}
                  onChange={(e) => handleDefaultStakeChange(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-l px-2.5 py-1.5 text-sm font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <span className="bg-slate-800 border-y border-r border-slate-700 px-2 py-1.5 text-xs font-mono text-slate-400 rounded-r">
                  {currency}
                </span>
              </div>

              {/* Quick Stepper Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleDefaultStakeChange(Math.max(100, defaultStake - 500))}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                >
                  -500
                </button>
                <button
                  type="button"
                  onClick={() => handleDefaultStakeChange(defaultStake + 500)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                >
                  +500
                </button>
                <button
                  type="button"
                  onClick={() => handleDefaultStakeChange(defaultStake * 2)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                >
                  2x
                </button>
              </div>
            </div>

            {/* Outlay Math Preview */}
            <div className="text-xs font-mono text-slate-300 ml-auto bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
              <span className="text-slate-400">Outlay: </span>
              <span className="text-white font-bold">{validTicketsCount} slips</span>
              <span className="text-slate-400"> × </span>
              <span className="text-cyan-400 font-bold">{formatMoney(defaultStake, currency)}</span>
              <span className="text-slate-400"> = </span>
              <span className="text-emerald-400 font-bold">{formatMoney(validTicketsCount * defaultStake, currency)}</span>
            </div>

          </div>
        </div>
      )}

      {currentMode === 'instance_3_hybrid' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-3">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Baseline Fee */}
            <div className="flex items-center gap-3">
              <label htmlFor="hybrid-baseline-stake" className="text-xs font-semibold text-slate-300 whitespace-nowrap">
                Baseline Default Stake:
              </label>
              
              <div className="flex items-center">
                <input
                  id="hybrid-baseline-stake"
                  type="number"
                  min="0.5"
                  step="1"
                  value={defaultStake}
                  onChange={(e) => handleDefaultStakeChange(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-l px-2.5 py-1.5 text-sm font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <span className="bg-slate-800 border-y border-r border-slate-700 px-2 py-1.5 text-xs font-mono text-slate-400 rounded-r">
                  {currency}
                </span>
              </div>
            </div>

            {/* Smart Rules & Reset Buttons */}
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onApplyHybridOddsRules}
                className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
                title="Automatically scale stake based on odds (High stake on Bankers, low stake on Longshots)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Apply Smart Odds Scaling
              </button>

              {overrideCount > 0 && (
                <button
                  type="button"
                  onClick={onResetOverrides}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors flex items-center gap-1"
                  title="Reset all customized tickets back to baseline default"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset {overrideCount} Overrides
                </button>
              )}
            </div>
          </div>

          {/* Explanation bar */}
          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 border-t border-slate-800/80">
            <span>
              <strong>Rule 1 (Banker &lt;4.0 odds):</strong> 2.5x Stake ({formatMoney(defaultStake * 2.5, currency)})
            </span>
            <span>·</span>
            <span>
              <strong>Rule 2 (Standard 4.0–15.0):</strong> 1x Stake ({formatMoney(defaultStake, currency)})
            </span>
            <span>·</span>
            <span>
              <strong>Rule 3 (Mega Acca &gt;15.0):</strong> 0.5x Stake ({formatMoney(defaultStake * 0.5, currency)})
            </span>
            <span>·</span>
            <span className="text-amber-400 font-medium">
              You can also click any individual ticket below to customize it directly.
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
