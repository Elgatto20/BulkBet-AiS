/**
 * Core type definitions for Bulk Booking Code Loader & Wager Batcher
 */

export type BookmakerId = 'sportybet' | 'bet9ja' | 'betway' | '1xbet' | 'stake' | 'betking';

export interface BookmakerConfig {
  id: BookmakerId;
  name: string;
  shortCode: string;
  badgeColor: string;
  codePlaceholder: string;
  defaultCurrency: CurrencyCode;
  supportedFormatsDescription: string;
}

export type CurrencyCode = 'NGN';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export interface BetLeg {
  id: string;
  match: string;
  homeTeam: string;
  awayTeam: string;
  tournament: string;
  startTime: string; // ISO string or readable format
  market: string;    // e.g. "1X2 (Full Time)", "Over/Under 2.5", "Both Teams to Score", "Double Chance"
  selection: string; // e.g. "Arsenal to Win", "Over 2.5", "Yes", "1X"
  odds: number;
  status: 'active' | 'suspended' | 'odds_changed' | 'won' | 'lost' | 'void';
  originalOdds?: number;
}

export type TicketStatus = 
  | 'unloaded' 
  | 'validating' 
  | 'valid' 
  | 'invalid_code' 
  | 'expired_event' 
  | 'odds_changed' 
  | 'placing' 
  | 'placed' 
  | 'failed';

export type TicketResult = 'pending' | 'won' | 'lost' | 'void';

export interface LoadedTicket {
  id: string;
  code: string;
  bookmakerId: BookmakerId;
  punterTag?: string; // e.g., "@BetMaster", "Telegram VIP", "David Banker"
  rawTextContext?: string;
  status: TicketStatus;
  validationError?: string;
  legs: BetLeg[];
  totalOdds: number;
  accumulatorBonusPercent: number; // e.g. 5% accumulator bonus
  stake: number;
  isCustomOverride?: boolean; // Used in Instance 3
  selected: boolean;          // Whether this ticket is enabled for batch placement
  potentialPayout: number;
  potentialProfit: number;
  placedReference?: string;   // e.g. "SB-2026-981023"
  placedAt?: string;
  result?: TicketResult;
  payoutReceived?: number;
}

export type WagerInstanceMode = 
  | 'instance_1_individual' // Bettor sets custom stake on each ticket individually
  | 'instance_2_default'    // Bettor sets 1 uniform default stake for all tickets
  | 'instance_3_hybrid';    // Baseline default stake + individual ticket overrides & rules

export interface HybridRule {
  id: string;
  name: string;
  minOdds?: number;
  maxOdds?: number;
  multiplier?: number; // e.g. 2x default stake
  fixedStake?: number; // e.g. $25
  active: boolean;
}

export interface BatchExecutionSummary {
  batchId: string;
  placedAt: string;
  bookmakerId: BookmakerId;
  instanceMode: WagerInstanceMode;
  totalTickets: number;
  successfulTickets: number;
  failedTickets: number;
  totalStaked: number;
  totalPotentialPayout: number;
  currency: CurrencyCode;
  tickets: LoadedTicket[];
  status: 'pending' | 'settled' | 'partial';
  settledPnl?: number;
}

export interface SampleBundle {
  id: string;
  title: string;
  description: string;
  bookmakerId: BookmakerId;
  codes: string[];
  rawText: string;
}
