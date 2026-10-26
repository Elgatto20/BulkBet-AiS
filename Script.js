/**
 * Script.js - Booking Code Extraction Engine
 * 
 * Extracts ONLY true 5 to 8 character alphanumeric game booking codes containing
 * both letters and numbers, strictly ignoring non-code English words, headers,
 * odds, and patterns starting with pure numbers followed by letters (e.g. "15GAME").
 */

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
 * Extracts unique, valid game booking codes from punter messages, telegram drops, or raw text.
 * Prevents strings starting with pure number blocks followed by letters (like "15GAME", "247BET").
 * 
 * @param {string} text - The raw text message from punter or telegram
 * @returns {string[]} Deduplicated array of valid booking code strings
 */
export function extractBookingCodes(text) {
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
    // This regex checks if the string starts with 1 or 2 digits directly followed by letters
    if (/^\d{1,2}[A-Z]+$/.test(upper)) return false;

    // Additional blacklist protection
    if (ignoreList.includes(upper)) return false;

    return true;
  }).map(c => c.toUpperCase());

  // 3. Deduplicate
  return [...new Set(validCodes)];
}

/**
 * Validates single code string against strict rules
 */
export function isValidBookingCode(code) {
  if (!code || typeof code !== 'string') return false;
  const upper = code.trim().toUpperCase();

  if (upper.length < 5 || upper.length > 8) return false;
  if (!/^[A-Z0-9]{5,8}$/.test(upper)) return false;

  const hasLetter = /[A-Z]/.test(upper);
  const hasDigit = /\d/.test(upper);
  if (!hasLetter || !hasDigit) return false;

  if (/^\d{1,2}[A-Z]+$/.test(upper)) return false;
  if (ignoreList.includes(upper)) return false;

  return true;
}

// CommonJS support for direct Node execution and automated testing environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractBookingCodes,
    isValidBookingCode,
    ignoreList,
  };
}
