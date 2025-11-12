// Lightweight helper for Quran Foundation/Quran.com API v4 (word-by-word)
// Production API now requires OAuth2 headers. We read them from Vite env:
// - VITE_QURAN_API_TOKEN
// - VITE_QURAN_API_CLIENT_ID
// - Optional: VITE_QURAN_API_BASE (override base URL)

const LEGACY_BASE = "https://api.quran.com/api/v4"; // legacy public base (may be deprecated)

function getConfig() {
  const token = import.meta?.env?.VITE_QURAN_API_TOKEN;
  const clientId = import.meta?.env?.VITE_QURAN_API_CLIENT_ID;
  const overrideBase = import.meta?.env?.VITE_QURAN_API_BASE;
  // Default to prelive content API if credentials are present
  const defaultAuthedBase = "https://apis-prelive.quran.foundation/content/api/v4";
  const authed = Boolean(token && clientId);
  return {
    authed,
    base: overrideBase || (authed ? defaultAuthedBase : LEGACY_BASE),
    headers: authed
      ? {
          "Accept": "application/json",
          "x-auth-token": token,
          "x-client-id": clientId,
        }
      : { "Accept": "application/json" },
  };
}

/**
 * Fetch a specific verse with word objects for a given language.
 * verseKey format: `${surah}:${ayah}` (e.g., "1:1")
 * language: 'en' for English, 'ur' for Urdu
 */
export async function getVerseWithWords(verseKey, language = "en") {
  const { base, headers } = getConfig();
  const params = new URLSearchParams({
    language,
    words: "true",
    // Ask for rich word fields; API will ignore unknown fields gracefully.
    word_fields: [
      "verse_key",
      "location",
      "text_uthmani",
      "text_indopak",
      "text_imlaei",
      "code_v2",
      "transliteration",
      "translation",
      "char_type_name",
    ].join(","),
  });
  const url = `${base}/verses/by_key/${encodeURIComponent(verseKey)}?${params.toString()}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch verse words (${res.status}): ${text || res.statusText}`);
  }
  const data = await res.json();
  // Legacy base returns { verse: {...} }, newer may be similar. Normalize.
  const verse = data?.verse || data?.verses?.[0] || data;
  if (!verse) throw new Error("Unexpected API response for verse words");
  return verse;
}

/**
 * Convenience method to fetch word arrays for both English and Urdu.
 * Returns { arabicWords, englishWords, urduWords } where each array is filtered to char_type_name === 'word'
 */
export async function getWordByWordForVerse(surahNumber, ayahNumber) {
  const key = `${surahNumber}:${ayahNumber}`;
  const [en, ur] = await Promise.all([
    getVerseWithWords(key, "en"),
    getVerseWithWords(key, "ur").catch(() => null), // Urdu may not always be available
  ]);
  const onlyWords = (arr) => (arr || []).filter((w) => (w?.char_type_name || w?.char_type) === "word");
  const wordsEn = onlyWords(en?.words || []);
  const wordsUr = onlyWords(ur?.words || []);
  // Prefer rich Arabic text if present; fall back to generic text/code
  const arabic = wordsEn.map((w) => ({
    text:
      w?.text_uthmani ||
      w?.text_indopak ||
      w?.text_imlaei ||
      w?.text ||
      w?.code_v2 ||
      "",
    transliteration: w?.transliteration?.text || w?.transliteration || "",
  }));
  const english = wordsEn.map((w) => ({
    translation: w?.translation?.text || w?.translation || "",
  }));
  const urdu = (wordsUr.length ? wordsUr : wordsEn).map((w) => ({
    translation: w?.translation?.text || w?.translation || "",
  }));
  return { arabicWords: arabic, englishWords: english, urduWords: urdu };
}

export function hasApiCredentials() {
  const { authed } = getConfig();
  return authed;
}

