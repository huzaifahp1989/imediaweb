// Lightweight wrapper around AlQuran.Cloud API
// Docs: https://alquran.cloud/api

const API_BASE = "https://api.alquran.cloud/v1";

// Preferred Arabic script editions
export const ARABIC_EDITIONS = ["quran-uthmani", "quran-simple"]; // try uthmani then fallback to simple

// A few common translation IDs (extendable)
export const TRANSLATIONS = [
  { id: "en.sahih", name: "Sahih International" },
  { id: "en.yusufali", name: "Yusuf Ali" },
  { id: "ur.junagarhi", name: "Junagarhi (Urdu)" },
  { id: "ur.maududi", name: "Maududi (Urdu)" },
];

// Map our reciter IDs to AlQuran.Cloud audio editions
export const RECITER_AUDIO_EDITIONS = {
  alafasy: "ar.alafasy",
  sudais: "ar.abdurrahmanalsudais",
  basit: "ar.abdulbasitmurattal",
  husary: "ar.husary",
};

export function getAudioEdition(reciterId) {
  return RECITER_AUDIO_EDITIONS[reciterId] || RECITER_AUDIO_EDITIONS.alafasy;
}

export async function fetchSurah({ surahNumber, translationId, audioEdition }) {
  // Try uthmani, then fallback to simple
  const url = `${API_BASE}/surah/${surahNumber}/editions/${ARABIC_EDITIONS[0]},${translationId},${audioEdition}`;
  const res = await fetch(url);
  let data = await res.json();
  if (data.status !== "OK" || !data?.data?.[0]?.ayahs?.length) {
    const url2 = `${API_BASE}/surah/${surahNumber}/editions/${ARABIC_EDITIONS[1]},${translationId},${audioEdition}`;
    const res2 = await fetch(url2);
    data = await res2.json();
  }
  if (data.status !== "OK") throw new Error("Failed to fetch surah");
  const arabicAyahs = data.data[0]?.ayahs || [];
  const translationAyahs = data.data[1]?.ayahs || [];
  const audioAyahs = data.data[2]?.ayahs || [];
  const translationMap = new Map();
  for (const t of translationAyahs) {
    const key = `${t?.numberInSurah}`;
    translationMap.set(key, t?.text || "");
  }
  const formatted = arabicAyahs.map((a, index) => ({
    numberInSurah: a.numberInSurah,
    arabic: a.text,
    translation: translationMap.get(String(a.numberInSurah)) || translationAyahs[index]?.text || "",
    audio: audioAyahs[index]?.audio || null,
    surahNumber,
  }));
  return formatted;
}

export async function fetchJuz({ juzNumber, translationId, audioEdition }) {
  const buildUrl = (scriptEdition) => {
    const editions = [scriptEdition, translationId];
    if (audioEdition) {
      editions.push(audioEdition);
    }
    return `${API_BASE}/juz/${juzNumber}/editions/${editions.join(',')}`;
  };
  let res = await fetch(buildUrl(ARABIC_EDITIONS[0]));
  let data = await res.json();
  if (data.status !== "OK" || !data?.data?.[0]?.ayahs?.length) {
    res = await fetch(buildUrl(ARABIC_EDITIONS[1]));
    data = await res.json();
  }
  if (data.status !== "OK") throw new Error("Failed to fetch juz");
  const arabicAyahs = data.data[0]?.ayahs || [];
  const translationAyahs = data.data[1]?.ayahs || [];
  const audioAyahs = data.data[2]?.ayahs || [];
  const translationMap = new Map();
  for (const t of translationAyahs) {
    const key = `${t?.surah?.number}-${t?.numberInSurah}`;
    if (key) translationMap.set(key, t?.text ?? "");
  }
  const audioMap = new Map();
  for (const a of audioAyahs) {
    const key = `${a?.surah?.number}-${a?.numberInSurah}`;
    if (key) audioMap.set(key, a?.audio ?? null);
  }
  const formatted = arabicAyahs.map((ayah) => {
    const key = `${ayah?.surah?.number}-${ayah?.numberInSurah}`;
    return {
      surahNumber: ayah.surah.number,
      surahName: ayah.surah.englishName || ayah.surah.name,
      numberInSurah: ayah.numberInSurah,
      arabic: ayah.text,
      translation: translationMap.get(key) || "",
      audio: audioMap.get(key) || null,
    };
  });
  return formatted;
}

// Sajda ayat list: returns array of {surah: number, ayah: number}
export async function fetchSajdaList() {
  const res = await fetch(`${API_BASE}/sajda`);
  const data = await res.json();
  if (data.status !== "OK") return [];
  const list = data?.data?.ayahs || data?.data || [];
  return list.map((x) => ({
    surah: x?.surah?.number || x?.surah?.number || 0,
    ayah: x?.numberInSurah || x?.ayah || 0,
  })).filter((x) => x.surah && x.ayah);
}

export async function fetchSurahListMeta() {
  const res = await fetch(`${API_BASE}/surah`);
  const data = await res.json();
  if (data.status !== "OK") return [];
  return (data?.data || []).map((s) => ({
    number: s.number,
    name: s.name,
    englishName: s.englishName,
    englishNameTranslation: s.englishNameTranslation,
    ayahs: s.numberOfAyahs,
    revelationType: s.revelationType,
  }));
}

// Basic search over ayah text in-memory (client-side)
export function searchAyahs(verses, query) {
  if (!query) return verses;
  const q = query.toLowerCase();
  return verses.filter((v) =>
    v.arabic?.toLowerCase().includes(q) || v.translation?.toLowerCase().includes(q)
  );
}
