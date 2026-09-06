/**
 * Parley BYOK credentials · env only (Keychain later).
 */

export function hasUserGemini() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function hasUserDeepSeek() {
  return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
}

/** True when the user supplied at least one Solas provider key. */
export function hasUserProviderKey() {
  return hasUserGemini() || hasUserDeepSeek();
}

export function resolveProviderKeys() {
  return {
    gemini: process.env.GEMINI_API_KEY?.trim() || null,
    deepseek: process.env.DEEPSEEK_API_KEY?.trim() || null,
  };
}
