import { BookmakerConfig, CurrencyConfig } from '../types/betting';

export const BOOKMAKERS: BookmakerConfig[] = [
  {
    id: 'sportybet',
    name: 'SportyBet',
    shortCode: 'SB',
    badgeColor: 'bg-red-950 text-red-400 border-red-800',
    codePlaceholder: 'e.g. BC48AL9, SB-88912',
    defaultCurrency: 'NGN',
    supportedFormatsDescription: 'Alphanumeric 6-8 chars (e.g. BC89A2, SB92K)',
  },
  {
    id: 'bet9ja',
    name: 'Bet9ja',
    shortCode: 'B9',
    badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    codePlaceholder: 'e.g. B9-77189, B94A2B',
    defaultCurrency: 'NGN',
    supportedFormatsDescription: '6-8 chars prefixed with B9 or 7-digits',
  },
  {
    id: 'betway',
    name: 'Betway',
    shortCode: 'BW',
    badgeColor: 'bg-slate-900 text-cyan-400 border-cyan-800',
    codePlaceholder: 'e.g. BW-10294, BW983A',
    defaultCurrency: 'NGN',
    supportedFormatsDescription: 'Codes prefixed with BW or 6-digit reference',
  },
  {
    id: '1xbet',
    name: '1xBet',
    shortCode: '1X',
    badgeColor: 'bg-blue-950 text-blue-400 border-blue-800',
    codePlaceholder: 'e.g. 1X-994102, 78FGAQ',
    defaultCurrency: 'NGN',
    supportedFormatsDescription: '7 alphanumeric digits or numeric booking ID',
  },
  {
    id: 'stake',
    name: 'Stake.com',
    shortCode: 'ST',
    badgeColor: 'bg-indigo-950 text-indigo-400 border-indigo-800',
    codePlaceholder: 'e.g. STAKE-482, ST-9912',
    defaultCurrency: 'NGN',
    supportedFormatsDescription: 'Stake slip codes or sport URL hashes',
  },
  {
    id: 'betking',
    name: 'BetKing',
    shortCode: 'BK',
    badgeColor: 'bg-amber-950 text-amber-400 border-amber-800',
    codePlaceholder: 'e.g. BK-20914, Y7K2P',
    defaultCurrency: 'NGN',
    supportedFormatsDescription: '5-7 alphanumeric chars or KingCode',
  },
];

export const CURRENCIES: Record<string, CurrencyConfig> = {
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
};

export interface MatchPoolItem {
  home: string;
  away: string;
  tournament: string;
  markets: {
    market: string;
    selection: string;
    odds: number;
  }[];
}

export const MATCH_FIXTURE_POOL: MatchPoolItem[] = [
  {
    home: 'Arsenal',
    away: 'Chelsea',
    tournament: 'Premier League',
    markets: [
      { market: '1X2 (Full Time)', selection: 'Arsenal to Win', odds: 1.78 },
      { market: 'Over/Under 2.5', selection: 'Over 2.5 Goals', odds: 1.72 },
      { market: 'Both Teams to Score', selection: 'Yes (GG)', odds: 1.68 },
      { market: 'Double Chance', selection: 'Arsenal or Draw (1X)', odds: 1.22 },
    ],
  },
  {
    home: 'Manchester City',
    away: 'Liverpool',
    tournament: 'Premier League',
    markets: [
      { market: '1X2 (Full Time)', selection: 'Man City to Win', odds: 2.05 },
      { market: 'Both Teams to Score', selection: 'Yes (GG)', odds: 1.52 },
      { market: 'Over/Under 3.5', selection: 'Over 3.5 Goals', odds: 2.30 },
      { market: '1X2 (Full Time)', selection: 'Draw', odds: 3.65 },
    ],
  },
  {
    home: 'Real Madrid',
    away: 'Barcelona',
    tournament: 'La Liga (El Clásico)',
    markets: [
      { market: '1X2 (Full Time)', selection: 'Real Madrid to Win', odds: 2.10 },
      { market: 'Over/Under 2.5', selection: 'Over 2.5 Goals', odds: 1.55 },
      { market: 'Both Teams to Score', selection: 'Yes (GG)', odds: 1.48 },
      { market: 'Double Chance', selection: 'Barcelona or Draw (X2)', odds: 1.65 },
    ],
  },
  {
    home: 'Bayern Munich',
    away: 'Borussia Dortmund',
    tournament: 'Bundesliga',
    markets: [
      { market: '1X2 (Full Time)', selection: 'Bayern Munich to Win', odds: 1.45 },
      { market: 'Over/Under 3.5', selection: 'Over 3.5 Goals', odds: 1.88 },
      { market: '1X2 & Over 2.5', selection: 'Bayern & Over 2.5', odds: 1.75 },
      { market: 'Both Teams to Score', selection: 'Yes (GG)', odds: 1.50 },
    ],
  },
  {
    home: 'Inter Milan',
    away: 'Juventus',
    tournament: 'Serie A',
    markets: [
      { market: '1X2 (Full Time)', selection: 'Inter Milan to Win', odds: 1.85 },
      { market: 'Under/Over 2.5', selection: 'Under 2.5 Goals', odds: 1.82 },
      { market: 'Double Chance', selection: 'Inter or Draw (1X)', odds: 1.20 },
      { market: 'Clean Sheet', selection: 'Inter Clean Sheet', odds: 2.35 },
    ],
  },
  {
    home: 'Paris Saint-Germain',
    away: 'Marseille',
    tournament: 'Ligue 1',
    markets: [
      { market: '1X2 (Full Time)', selection: 'PSG to Win', odds: 1.42 },
      { market: 'Handicap (-1)', selection: 'PSG -1 Goal', odds: 2.15 },
      { market: 'Over/Under 2.5', selection: 'Over 2.5 Goals', odds: 1.60 },
      { market: 'Both Teams to Score', selection: 'Yes (GG)', odds: 1.70 },
    ],
  },
  {
    home: 'Bayer Leverkusen',
    away: 'RB Leipzig',
    tournament: 'Bundesliga',
    markets: [
      { market: '1X2 (Full Time)', selection: 'Leverkusen to Win', odds: 1.95 },
      { market: 'Both Teams to Score', selection: 'Yes (GG)', odds: 1.55 },
      { market: 'Over/Under 2.5', selection: 'Over 2.5 Goals', odds: 1.65 },
    ],
  },
  {
    home: 'Aston Villa',
    away: 'Tottenham Hotspur',
    tournament: 'Premier League',
    markets: [
      { market: '1X2 (Full Time)', selection: 'Aston Villa to Win', odds: 2.20 },
      { market: 'Over/Under 2.5', selection: 'Over 2.5 Goals', odds: 1.58 },
      { market: 'Both Teams to Score', selection: 'Yes (GG)', odds: 1.50 },
    ],
  },
  {
    home: 'Atletico Madrid',
    away: 'Sevilla',
    tournament: 'La Liga',
    markets: [
      { market: '1X2 (Full Time)', selection: 'Atletico to Win', odds: 1.55 },
      { market: 'Under/Over 2.5', selection: 'Under 2.5 Goals', odds: 1.80 },
      { market: 'Double Chance', selection: 'Atletico or Draw', odds: 1.15 },
    ],
  },
  {
    home: 'AC Milan',
    away: 'Napoli',
    tournament: 'Serie A',
    markets: [
      { market: '1X2 (Full Time)', selection: 'Napoli to Win', odds: 2.45 },
      { market: 'Double Chance', selection: 'Milan or Draw (1X)', odds: 1.40 },
      { market: 'Both Teams to Score', selection: 'Yes (GG)', odds: 1.72 },
    ],
  },
  {
    home: 'Sporting CP',
    away: 'Benfica',
    tournament: 'Primeira Liga',
    markets: [
      { market: '1X2 (Full Time)', selection: 'Sporting CP to Win', odds: 1.90 },
      { market: 'Over/Under 2.5', selection: 'Over 2.5 Goals', odds: 1.70 },
      { market: 'Both Teams to Score', selection: 'Yes (GG)', odds: 1.62 },
    ],
  },
  {
    home: 'Ajax',
    away: 'Feyenoord',
    tournament: 'Eredivisie',
    markets: [
      { market: '1X2 (Full Time)', selection: 'Feyenoord to Win', odds: 2.30 },
      { market: 'Over/Under 3.5', selection: 'Over 3.5 Goals', odds: 2.25 },
      { market: 'Both Teams to Score', selection: 'Yes (GG)', odds: 1.45 },
    ],
  },
];
