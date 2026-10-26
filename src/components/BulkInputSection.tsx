import React, { useState, useMemo } from 'react';
import { BookmakerId } from '../types/betting';
import { BOOKMAKERS } from '../services/mockFixtures';
import { extractCodesFromText } from '../services/bookmakerEngine';
import { Upload, CheckCircle2, ArrowRight, Trash2, HelpCircle } from 'lucide-react';

interface BulkInputSectionProps {
  selectedBookmakerId: BookmakerId;
  setSelectedBookmakerId: (id: BookmakerId) => void;
  rawInput: string;
  setRawInput: (val: string) => void;
  onLoadTickets: (codesWithNotes: { code: string; punterNote?: string }[], bookmakerId: BookmakerId) => void;
  isLoading: boolean;
}

export const BulkInputSection: React.FC<BulkInputSectionProps> = ({
  selectedBookmakerId,
  setSelectedBookmakerId,
  rawInput,
  setRawInput,
  onLoadTickets,
  isLoading,
}) => {
  const [showHelper, setShowHelper] = useState(false);

  // Live code detection
  const detectedCodes = useMemo(() => {
    return extractCodesFromText(rawInput, selectedBookmakerId);
  }, [rawInput, selectedBookmakerId]);

  const activeBookmaker = BOOKMAKERS.find((b) => b.id === selectedBookmakerId) || BOOKMAKERS[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawInput(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleProcess = () => {
    if (detectedCodes.length === 0) return;
    onLoadTickets(detectedCodes, selectedBookmakerId);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 mb-6">
      
      {/* 1. Target Betting Platform Selector */}
      <div className="mb-5">
        <div className="mb-2">
          <label className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            1. Select target Betting Platform
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {BOOKMAKERS.map((bm) => {
            const isSelected = bm.id === selectedBookmakerId;
            return (
              <button
                key={bm.id}
                type="button"
                onClick={() => setSelectedBookmakerId(bm.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  isSelected
                    ? `${bm.badgeColor} ring-1 ring-emerald-500/50 shadow-sm`
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="truncate">{bm.name}</span>
                <span className="text-[10px] font-mono opacity-80 ml-1.5">{bm.shortCode}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Raw Text / Booking Codes Input */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <label htmlFor="bulk-code-textarea" className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              2. Paste Booking Codes
            </label>
            <button
              onClick={() => setShowHelper(!showHelper)}
              className="text-slate-400 hover:text-slate-300 transition-colors"
              title="How does bulk loading work?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          {rawInput && (
            <button
              type="button"
              onClick={() => setRawInput('')}
              className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded text-[11px] transition-colors flex items-center gap-1"
              title="Clear input"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {showHelper && (
          <div className="mb-3 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300">
            <p className="font-semibold text-white mb-1">💡 Smart Extraction Tip:</p>
            <p>
              You don’t have to format anything. Simply copy entire Telegram drops, Twitter threads, or WhatsApp chats.
              Our engine uses intelligent regex to extract booking codes (e.g. <span className="font-mono text-emerald-400">BC89A2</span>, <span className="font-mono text-emerald-400">B9-77189</span>, <span className="font-mono text-emerald-400">1X-88201</span>) and associates punter tags (e.g. @Tipster) automatically.
            </p>
          </div>
        )}

        <div className="relative">
          <textarea
            id="bulk-code-textarea"
            rows={5}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={`Paste raw messages or booking codes here...\nExample:\nBC88XA1 @PremierPicks (3.20 odds)\nSB44902 (EPL Banker)\nB772AL (Over 2.5 Goals)\nBC9910F\n\nOr paste a full Telegram drop and let the engine extract all slips!`}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed resize-y"
          />

          {/* Detected codes count badge inside textarea corner */}
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            {detectedCodes.length > 0 ? (
              <span className="text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {detectedCodes.length} {detectedCodes.length === 1 ? 'code' : 'codes'} detected
              </span>
            ) : rawInput.trim() ? (
              <span className="text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                0 valid codes found
              </span>
            ) : null}
          </div>
        </div>

        {/* UI Status Log: Explicit confirmation of exact codes count & extraction */}
        {rawInput.trim() && (
          <div className="mt-2.5 px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-semibold text-white">Extraction Status:</span>
              {detectedCodes.length > 0 ? (
                <span>
                  Found exactly <strong className="text-emerald-400 font-mono font-bold">{detectedCodes.length}</strong> unique valid game booking {detectedCodes.length === 1 ? 'code' : 'codes'} (headers, words, and odds ignored).
                </span>
              ) : (
                <span className="text-amber-400">
                  0 valid codes detected. Only 5–8 character alphanumeric codes containing both letters & numbers are accepted.
                </span>
              )}
            </div>

            {detectedCodes.length > 0 && (
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 overflow-x-auto max-w-md">
                <span className="text-slate-500">Codes:</span>
                <span className="text-emerald-400 font-semibold truncate">
                  {detectedCodes.slice(0, 8).map(c => c.code).join(', ')}
                  {detectedCodes.length > 8 ? ` +${detectedCodes.length - 8} more` : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Bottom Bar: File upload & Process CTA */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="cursor-pointer text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1.5 py-1 px-2 rounded hover:bg-slate-800 transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Upload .txt or .csv list</span>
            <input
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleProcess}
            disabled={detectedCodes.length === 0 || isLoading}
            className={`px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              detectedCodes.length > 0 && !isLoading
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading Slips from {activeBookmaker.name}...
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
                <span>Load & Process {detectedCodes.length > 0 ? `${detectedCodes.length} Codes` : 'Slips'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
