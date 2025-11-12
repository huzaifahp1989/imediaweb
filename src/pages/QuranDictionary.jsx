import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Globe, Loader2, Search, Star, StarOff, Upload, Download, Play, Pause } from "lucide-react";
import { fetchSurahListMeta, fetchAyahAudio, getAudioEdition, RECITER_AUDIO_EDITIONS } from "@/api/quranCloud.js";
import { getWordByWordForVerse, hasApiCredentials } from "@/api/quranFoundation.js";
import difficultWordsData from "@/data/difficultWords.json";

export default function QuranDictionary() {
  const [chapters, setChapters] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedAyah, setSelectedAyah] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [words, setWords] = useState([]);
  const [tokenReady, setTokenReady] = useState(hasApiCredentials());
  const [showDifficultOnly, setShowDifficultOnly] = useState(false);
  const [userDifficultMap, setUserDifficultMap] = useState({}); // { "surah:ayah": Set([indices]) }
  const [quickJump, setQuickJump] = useState("");
  const [uiMsg, setUiMsg] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [reciter, setReciter] = useState("alafasy");
  const reciterOptions = useMemo(() => [
    { id: "alafasy", label: "Alafasy" },
    { id: "sudais", label: "Sudais" },
    { id: "basit", label: "Abdul Basit" },
    { id: "husary", label: "Husary" },
  ], []);

  const importInputRef = useRef(null);

  const USER_STORAGE_KEY = "quranUserDifficultWords";
  const curatedMap = useMemo(() => {
    const map = new Map();
    const overrides = new Map();
    const entries = difficultWordsData?.entries || [];
    for (const e of entries) {
      map.set(String(e.key), new Set((e.indices || []).map(Number)));
      if (e.overrides) overrides.set(String(e.key), e.overrides);
    }
    return { indicesMap: map, overridesMap: overrides };
  }, []);

  useEffect(() => {
    // Load user difficult words from localStorage
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const obj = {};
        for (const k of Object.keys(parsed)) {
          obj[k] = new Set((parsed[k] || []).map(Number));
        }
        setUserDifficultMap(obj);
      }
    } catch {}
  }, []);

  const persistUserDifficult = (next) => {
    const plain = {};
    for (const k of Object.keys(next)) {
      plain[k] = Array.from(next[k]);
    }
    try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(plain)); } catch {}
  };

  useEffect(() => {
    let mounted = true;
    const loadChapters = async () => {
      try {
        const meta = await fetchSurahListMeta();
        if (!mounted) return;
        setChapters(meta);
        if (!meta?.length) return;
        // Keep selected ayah within bounds
        const chosen = meta.find((m) => m.number === selectedSurah) || meta[0];
        const maxAyah = chosen?.ayahs || 7;
        setSelectedAyah((prev) => Math.min(Math.max(1, prev || 1), maxAyah));
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load Surah list. Please check your internet connection.");
      }
    };
    loadChapters();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredChapters = useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    if (!q) return chapters;
    return chapters.filter((c) =>
      String(c.number).includes(q) ||
      c.englishName?.toLowerCase().includes(q) ||
      c.name?.toLowerCase().includes(q) ||
      c.englishNameTranslation?.toLowerCase().includes(q)
    );
  }, [chapters, search]);

  const currentChapter = useMemo(() => chapters.find((c) => c.number === selectedSurah), [chapters, selectedSurah]);

  const verseKey = useMemo(() => `${selectedSurah}:${selectedAyah}`, [selectedSurah, selectedAyah]);

  const displayRows = useMemo(() => {
    const curatedSet = curatedMap.indicesMap.get(verseKey) || new Set();
    let userSet = userDifficultMap[verseKey] || new Set();
    if (Array.isArray(userSet)) userSet = new Set(userSet.map(Number));
    const allRows = (words || []).map((w) => ({
      ...w,
      isCuratedDifficult: Boolean(w.isCuratedDifficult || curatedSet.has(Number(w.index))),
      isUserDifficult: Boolean(userSet.has(Number(w.index))),
    }));
    if (!showDifficultOnly) return allRows;
    return allRows.filter((w) => w.isCuratedDifficult || w.isUserDifficult);
  }, [words, verseKey, curatedMap, userDifficultMap, showDifficultOnly]);

  const ensureAyahAudio = async (surahNum, ayahNum) => {
    if (audioUrl && audioRef.current) return audioUrl;
    try {
      const url = await fetchAyahAudio({ surahNumber: surahNum, ayahNumber: ayahNum, audioEdition: getAudioEdition(reciter) });
      setAudioUrl(url || "");
      return url || "";
    } catch {
      setAudioUrl("");
      return "";
    }
  };

  const playAyah = async () => {
    const url = audioUrl || (await ensureAyahAudio(selectedSurah, selectedAyah));
    if (!url) {
      setUiMsg("Audio unavailable for this ayah or reciter. Falling back might help.");
      return;
    }
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
    } else if (audioRef.current.src !== url) {
      audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
    }
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {}
  };

  const pauseAyah = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const loadWords = async (surahNum, ayahNum) => {
    setLoading(true);
    setError("");
    try {
      const { arabicWords, englishWords, urduWords } = await getWordByWordForVerse(surahNum, ayahNum);
      const maxLen = Math.max(arabicWords.length, englishWords.length, urduWords.length);
      const rows = [];
      for (let i = 0; i < maxLen; i++) {
        const rowIndex = i + 1;
        const curatedSet = curatedMap.indicesMap.get(`${surahNum}:${ayahNum}`);
        const override = curatedMap.overridesMap.get(`${surahNum}:${ayahNum}`)?.[String(rowIndex)] || null;
        rows.push({
          index: rowIndex,
          arabic: arabicWords[i]?.text || "",
          transliteration: arabicWords[i]?.transliteration || "",
          en: override?.en || englishWords[i]?.translation || "",
          ur: override?.ur || urduWords[i]?.translation || "",
          isCuratedDifficult: !!curatedSet?.has(rowIndex),
        });
      }
      setWords(rows);
    } catch (e) {
      console.error("Dictionary fetch error:", e);
      setError(
        tokenReady
          ? "Failed to load word-by-word data. Please try again."
          : "Word-by-word API now requires credentials. Please add VITE_QURAN_API_TOKEN and VITE_QURAN_API_CLIENT_ID to enable full dictionary."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSurah && selectedAyah) {
      loadWords(selectedSurah, selectedAyah);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSurah, selectedAyah]);

  useEffect(() => {
    setAudioUrl("");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setUiMsg("");
  }, [verseKey]);

  useEffect(() => {
    setAudioUrl("");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, [reciter]);

  const toggleUserDifficult = (key, idx) => {
    setUserDifficultMap((prev) => {
      const next = { ...prev };
      const set = new Set(prev[key] || []);
      if (set.has(idx)) set.delete(idx); else set.add(idx);
      next[key] = set;
      persistUserDifficult(next);
      return next;
    });
  };

  // Keyboard navigation: ArrowLeft/ArrowRight to move between ayahs (across surah bounds)
  useEffect(() => {
    const handler = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const chap = chapters.find((c) => c.number === selectedSurah);
        const maxAyah = chap?.ayahs || 7;
        if (selectedAyah < maxAyah) {
          setSelectedAyah((a) => a + 1);
        } else {
          // move to next surah if available
          const idx = chapters.findIndex((c) => c.number === selectedSurah);
          if (idx >= 0 && idx + 1 < chapters.length) {
            setSelectedSurah(chapters[idx + 1].number);
            setSelectedAyah(1);
          }
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (selectedAyah > 1) {
          setSelectedAyah((a) => a - 1);
        } else {
          // move to previous surah if available
          const idx = chapters.findIndex((c) => c.number === selectedSurah);
          if (idx > 0) {
            const prev = chapters[idx - 1];
            setSelectedSurah(prev.number);
            setSelectedAyah(prev.ayahs || 7);
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [chapters, selectedSurah, selectedAyah]);

  const handleQuickJump = () => {
    const s = (quickJump || "").trim();
    const m = s.match(/^(\d{1,3})\s*[:\-]\s*(\d{1,3})$/);
    if (!m) {
      setUiMsg("Invalid format. Use e.g., 2:255");
      return;
    }
    const surahNum = Number(m[1]);
    const ayahNum = Number(m[2]);
    const chap = chapters.find((c) => c.number === surahNum);
    if (!chap) {
      setUiMsg("Unknown surah number");
      return;
    }
    if (ayahNum < 1 || ayahNum > (chap.ayahs || 7)) {
      setUiMsg(`Ayah out of range (1-${chap.ayahs || 7})`);
      return;
    }
    setSelectedSurah(surahNum);
    setSelectedAyah(ayahNum);
    setUiMsg("");
  };

  const exportUserMarks = () => {
    const plain = {};
    for (const k of Object.keys(userDifficultMap)) {
      plain[k] = Array.from(userDifficultMap[k] || []);
    }
    const blob = new Blob([JSON.stringify(plain, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'difficult-words-user.json';
    a.click();
    URL.revokeObjectURL(url);
    setUiMsg("Exported your marks as JSON");
  };

  const importUserMarksFromFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid JSON root');
        const next = { ...userDifficultMap };
        for (const key of Object.keys(data)) {
          const arr = Array.isArray(data[key]) ? data[key] : [];
          const set = new Set(next[key] || []);
          for (const n of arr) {
            const idx = Number(n);
            if (Number.isInteger(idx) && idx >= 1) set.add(idx);
          }
          next[key] = set;
        }
        setUserDifficultMap(next);
        persistUserDifficult(next);
        setUiMsg("Imported and merged marks successfully");
      } catch (e) {
        setUiMsg("Failed to import: invalid JSON structure");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl">Quran Dictionary (Word-by-Word)</CardTitle>
          </div>
          
          <p className="mt-2 text-sm text-gray-600">
            Explore every ayah from Al-Fatiha to An-Nas. For each verse, see Arabic words with English and Urdu meanings.
          </p>
          
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Search & Choose Surah</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by number or name (e.g., 1 or Al-Fatihah)"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="mt-2 max-h-40 overflow-auto border rounded p-2 bg-white">
                {filteredChapters.map((c) => (
                  <button
                    key={c.number}
                    className={`w-full text-left px-2 py-1 rounded hover:bg-blue-50 ${
                      selectedSurah === c.number ? "bg-blue-100" : ""
                    }`}
                    onClick={() => {
                      setSelectedSurah(c.number);
                      setSelectedAyah(1);
                    }}
                  >
                    <span className="font-semibold">{c.number}. {c.englishName}</span>
                    <span className="ml-2 text-gray-600">{c.englishNameTranslation}</span>
                    <span className="ml-2 text-gray-500">({c.ayahs} ayahs)</span>
                  </button>
                ))}
                {!filteredChapters.length && (
                  <div className="text-sm text-gray-500">No surahs found.</div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Quick jump (surah:ayah)</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., 2:255"
                      value={quickJump}
                      onChange={(e) => setQuickJump(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleQuickJump(); }}
                    />
                    <Button variant="secondary" onClick={handleQuickJump}>Go</Button>
                  </div>
                </div>
                <div className="flex items-end">
                  <div className="text-xs text-gray-600">
                    Legend:
                    <span className="inline-flex items-center ml-2"><span className="w-3 h-3 inline-block rounded-sm bg-amber-100 border border-amber-300 mr-1" /> Curated</span>
                    <span className="inline-flex items-center ml-3"><span className="w-3 h-3 inline-block rounded-sm bg-blue-100 border border-blue-300 mr-1" /> Marked by you</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Select Ayah</label>
              <div className="mb-2 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={isPlaying ? pauseAyah : playAyah} className="inline-flex items-center gap-2">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? 'Pause Ayah' : 'Play Ayah'}
                </Button>
                <Select value={reciter} onValueChange={(v) => setReciter(v)}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Reciter" />
                  </SelectTrigger>
                  <SelectContent>
                    {reciterOptions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Select value={String(selectedAyah)} onValueChange={(v) => setSelectedAyah(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Ayah number" />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-auto">
                  {Array.from({ length: currentChapter?.ayahs || 7 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 mt-2">
                Surah {selectedSurah} • Ayah {selectedAyah}
              </div>
              <div className="mt-2 flex items-center gap-3 flex-wrap">
                <Button onClick={() => loadWords(selectedSurah, selectedAyah)} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                    </>
                  ) : (
                    "Reload"
                  )}
                </Button>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="accent-blue-600 cursor-pointer"
                    checked={showDifficultOnly}
                    onChange={(e) => setShowDifficultOnly(e.target.checked)}
                  />
                  Show difficult only
                </label>
                <Button variant="outline" onClick={exportUserMarks} className="flex items-center gap-2">
                  <Download className="h-4 w-4" /> Export
                </Button>
                <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => importUserMarksFromFile(e.target.files?.[0])} />
                <Button variant="outline" onClick={() => importInputRef.current?.click()} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Import
                </Button>
              </div>
              {uiMsg && <div className="text-xs text-gray-600 mt-2">{uiMsg}</div>}
            </div>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded">
              {error}
            </div>
          )}

          <div className="overflow-auto rounded border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-700">#</th>
                  <th className="px-3 py-2 text-right text-gray-700">Arabic</th>
                  <th className="px-3 py-2 text-left text-gray-700">Transliteration</th>
                  <th className="px-3 py-2 text-left text-gray-700">English</th>
                  <th className="px-3 py-2 text-left text-gray-700">Urdu</th>
                  <th className="px-3 py-2 text-left text-gray-700">Mark</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-gray-600">
                      <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" /> Loading words...
                    </td>
                  </tr>
                ) : (
                  displayRows.length ? (
                    displayRows.map((w) => (
                      <tr key={w.index} className={`border-t ${w.isCuratedDifficult ? 'bg-amber-50' : (w.isUserDifficult ? 'bg-blue-50' : '')}`}>
                        <td className="px-3 py-2 text-gray-600">{w.index}</td>
                        <td className="px-3 py-2 text-right text-xl leading-7 cursor-pointer" title="Play ayah" onClick={isPlaying ? pauseAyah : playAyah}>{w.arabic}</td>
                        <td className="px-3 py-2 text-gray-700">{w.transliteration}</td>
                        <td className="px-3 py-2">{w.en}</td>
                        <td className="px-3 py-2">{w.ur}</td>
                        <td className="px-3 py-2">
                          <button
                            className="inline-flex items-center gap-1 text-blue-600 hover:opacity-80"
                            title={w.isCuratedDifficult ? "Curated difficult word" : (w.isUserDifficult ? "Unmark difficult" : "Mark as difficult")}
                            onClick={() => toggleUserDifficult(verseKey, w.index)}
                          >
                            {w.isCuratedDifficult || w.isUserDifficult ? (
                              <Star className="h-4 w-4 fill-blue-600 text-blue-600" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                            <span className="text-xs">{w.isCuratedDifficult ? "Curated" : (w.isUserDifficult ? "Marked" : "Mark")}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                        No data yet. Choose a surah and ayah to view word meanings.
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" />
            Data powered by Quran Foundation/Quran.com APIs. Translations may vary by source.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
