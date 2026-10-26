import { BookmakerId, LoadedTicket, BetLeg, TicketStatus } from '../types/betting';
import { MATCH_FIXTURE_POOL, BOOKMAKERS } from './mockFixtures';

/**
 * Hash string to integer for deterministic mock data generation
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const ignoreList = [
  "STAKE",
  "STAKING",
  "BOOM",
  "TODAY",
  "SPORTYBET",
  "BET9JA",
  "BETWAY",
  "1XBET",
  "BETKING",
  "EACH",
  "CODES",
  "SECTION",
  "247BET",
  "BETTING",
  "BANKER",
  "BANKERS",
  "TICKET",
  "TICKETS",
  "WEEKEND",
  "BETTOR",
  "ODDS"
];

/**
 * Validates strictly 5 to 8 character alphanumeric game booking code containing both letters and numbers.
 * Excludes patterns starting with pure number blocks followed by letters (e.g. "15GAME").
 * Strictly filters out non-code English words from ignoreList.
 */
export function isValidBookingCode(code: string): boolean {
  if (!code) return false;
  const clean = code.trim().toUpperCase();
  
  // Filter out common betting words like STAKE, SECTION, etc.
  if (ignoreList.includes(clean)) return false;

  if (clean.length < 5 || clean.length > 8) return false;
  if (!/^[A-Z0-9]{5,8}$/.test(clean)) return false;
  
  // Must contain at least one letter [A-Z] AND at least one digit [0-9]
  const hasLetter = /[A-Z]/.test(clean);
  const hasDigit = /\d/.test(clean);
  if (!hasLetter || !hasDigit) return false;

  // EXCLUDE patterns that start with pure numbers followed by letters (e.g., "15GAME", "247BET")
  if (/^\d{1,2}[A-Z]+$/.test(clean)) return false;

  return true;
}

/**
 * Extracts clean unique valid booking codes string list matching user's exact specification
 */
export function extractBookingCodes(text: string): string[] {
  if (!text || typeof text !== 'string') return [];

  // 1. Find all 5 to 8 character alphanumeric words
  const candidates = text.match(/\b[A-Za-z0-9]{5,8}\b/g) || [];

  // 2. Strict filtering:
  const validCodes = candidates.filter(str => {
    const upper = str.toUpperCase();

    // Must contain at least one letter and at least one digit
    const hasLetter = /[A-Z]/.test(upper);
    const hasDigit = /\d/.test(upper);
    if (!hasLetter || !hasDigit) return false;

    // EXCLUDE patterns that start with pure numbers followed by letters (e.g., "15GAME", "247BET")
    if (/^\d{1,2}[A-Z]+$/.test(upper)) return false;

    // Additional blacklist protection
    if (ignoreList.includes(upper)) return false;

    return true;
  }).map(c => c.toUpperCase());

  // 3. Deduplicate
  return [...new Set(validCodes)];
}

/**
 * Smart Regex-based Code Extractor from raw social text (Telegram, WhatsApp, Twitter, etc.)
 * Strictly targets 5 to 8 character alphanumeric codes containing both letters and numbers:
 * /\b(?=.*[A-Z])(?=.*\d)[A-Z0-9]{5,8}\b/g
 * Automatically filters out all headers (e.g. "SECTION"), words, standalone odds (e.g. 4.50, 12.50), and punctuation.
 */
export function extractCodesFromText(rawText: string, bookmakerId?: BookmakerId): { code: string; punterNote?: string }[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split('\n');
  const results: { code: string; punterNote?: string }[] = [];
  const seenCodes = new Set<string>();

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Sanitize punctuation artifacts (commas, dots, colons, brackets, etc.) into spaces
    const sanitizedLine = trimmedLine.toUpperCase().replace(/[.,:;()\[\]{}'"`!/?*#@]/g, ' ');
    const tokens = sanitizedLine.split(/\s+/).filter(Boolean);

    for (const rawToken of tokens) {
      const candidates = [rawToken];
      if (rawToken.includes('-')) {
        candidates.push(rawToken.replace(/-/g, ''));
      }

      for (const token of candidates) {
        if (isValidBookingCode(token) && !seenCodes.has(token)) {
          seenCodes.add(token);

          // Attempt to extract punter comment / handle from the same line
          let punterNote: string | undefined;
          const handleMatch = trimmedLine.match(/(@[A-Za-z0-9_]+)/);
          const commentMatch = trimmedLine.match(/\(([^)]+)\)/);
          
          if (handleMatch) {
            punterNote = handleMatch[1];
          } else if (commentMatch && !commentMatch[1].toUpperCase().includes(token)) {
            punterNote = commentMatch[1];
          }

          results.push({
            code: token,
            punterNote,
          });
        }
      }
    }
  }

  // Filter out non-code English words from ignoreList and return clean unique codes
  return results.filter(item => !ignoreList.includes(item.code.toUpperCase()));
}

/**
 * Deterministically generates realistic betting slip legs based on booking code hash
 */
export function resolveBookingSlip(
  code: string,
  bookmakerId: BookmakerId,
  punterTag?: string
): LoadedTicket {
  const hash = hashString(code);
  const cleanCode = code.toUpperCase().trim();

  // Test edge cases:
  // If code contains "FAIL" or "INVALID", mark as invalid
  if (cleanCode.includes('FAIL') || cleanCode.includes('INVALID') || cleanCode === '00000') {
    return {
      id: `ticket-${code}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: cleanCode,
      bookmakerId,
      punterTag,
      status: 'invalid_code',
      validationError: 'Code not found on bookmaker platform or has expired.',
      legs: [],
      totalOdds: 0,
      accumulatorBonusPercent: 0,
      stake: 1000,
      selected: false,
      potentialPayout: 0,
      potentialProfit: 0,
    };
  }

  // Determine number of legs (between 3 and 8 legs, based on hash)
  const numLegs = 3 + (hash % 6);
  const legs: BetLeg[] = [];
  let cumulativeOdds = 1.0;

  const usedFixtureIndexes = new Set<number>();

  for (let i = 0; i < numLegs; i++) {
    const fixtureIndex = (hash + i * 3) % MATCH_FIXTURE_POOL.length;
    // ensure unique fixture per slip if possible
    let finalIndex = fixtureIndex;
    let attempts = 0;
    while (usedFixtureIndexes.has(finalIndex) && attempts < MATCH_FIXTURE_POOL.length) {
      finalIndex = (finalIndex + 1) % MATCH_FIXTURE_POOL.length;
      attempts++;
    }
    usedFixtureIndexes.add(finalIndex);

    const fixture = MATCH_FIXTURE_POOL[finalIndex];
    const marketIndex = (hash + i) % fixture.markets.length;
    const market = fixture.markets[marketIndex];

    // Slight variance on odds
    const odds = Math.round(market.odds * 100) / 100;
    cumulativeOdds *= odds;

    // Kickoff time: today/tomorrow staggered
    const hoursAhead = 2 + ((hash + i * 4) % 48);
    const kickoff = new Date(Date.now() + hoursAhead * 3600 * 1000).toLocaleDateString('en-GB', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    legs.push({
      id: `leg-${code}-${i}`,
      match: `${fixture.home} vs ${fixture.away}`,
      homeTeam: fixture.home,
      awayTeam: fixture.away,
      tournament: fixture.tournament,
      startTime: kickoff,
      market: market.market,
      selection: market.selection,
      odds,
      status: 'active',
    });
  }

  // Calculate bookmaker accumulator bonus (e.g. 5% for 4 legs up to 25% for 8 legs)
  const bonusPercent = numLegs >= 5 ? Math.min(30, (numLegs - 2) * 5) : 0;
  const roundedOdds = Math.round(cumulativeOdds * 100) / 100;
  const defaultStake = 1000;
  const bonusMultiplier = 1 + bonusPercent / 100;
  const potentialPayout = Math.round(defaultStake * roundedOdds * bonusMultiplier * 100) / 100;
  const potentialProfit = Math.round((potentialPayout - defaultStake) * 100) / 100;

  return {
    id: `ticket-${code}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    code: cleanCode,
    bookmakerId,
    punterTag: punterTag || (hash % 3 === 0 ? `@Tipster_${cleanCode.slice(0, 3)}` : undefined),
    status: 'valid',
    legs,
    totalOdds: roundedOdds,
    accumulatorBonusPercent: bonusPercent,
    stake: defaultStake,
    selected: true,
    potentialPayout,
    potentialProfit,
  };
}

/**
 * Re-calculate potential payout & profit for a ticket given updated stake
 */
export function recalculateTicketPayout(ticket: LoadedTicket, newStake: number): LoadedTicket {
  const safeStake = Math.max(0, isNaN(newStake) ? 0 : newStake);
  const bonusMultiplier = 1 + (ticket.accumulatorBonusPercent || 0) / 100;
  const potentialPayout = Math.round(safeStake * ticket.totalOdds * bonusMultiplier * 100) / 100;
  const potentialProfit = Math.round((potentialPayout - safeStake) * 100) / 100;

  return {
    ...ticket,
    stake: safeStake,
    potentialPayout,
    potentialProfit,
  };
}

/**
 * Format currency with Nigerian Naira symbol ₦ always
 */
export function formatMoney(amount: number, _currencyCode: string = 'NGN'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `₦${safeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
