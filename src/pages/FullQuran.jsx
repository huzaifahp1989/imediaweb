
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Added for search functionality
import { motion } from "framer-motion";
import { BookOpen, Volume2, Play, Pause, ChevronDown, ChevronUp, Loader2, Search, Repeat, StopCircle } from "lucide-react"; // Added Search, Repeat, Stop
import { toast } from "sonner";
import PropTypes from 'prop-types';

const reciters = [
  { id: "alafasy", name: "Mishary Rashid Alafasy", url: "https://server8.mp3quran.net/afs/", flag: "🇰🇼" }, // Flag for Kuwait
  { id: "sudais", name: "Abdur-Rahman As-Sudais", url: "https://server11.mp3quran.net/sds/", flag: "🇸🇦" }, // Flag for Saudi Arabia
  { id: "basit", name: "Abdul Basit", url: "https://server7.mp3quran.net/basit/", flag: "🇪🇬" }, // Flag for Egypt
  { id: "husary", name: "Mahmoud Khalil Al-Husary", url: "https://server13.mp3quran.net/husr/", flag: "🇪🇬" } // Flag for Egypt
];

const surahs = [
  { number: 1, name: "Al-Fatihah", englishName: "The Opening", verses: 7, revelation: "Meccan" },
  { number: 2, name: "Al-Baqarah", englishName: "The Cow", verses: 286, revelation: "Medinan" },
  { number: 3, name: "Ali 'Imran", englishName: "Family of Imran", verses: 200, revelation: "Medinan" },
  { number: 4, name: "An-Nisa", englishName: "The Women", verses: 176, revelation: "Medinan" },
  { number: 5, name: "Al-Ma'idah", englishName: "The Table Spread", verses: 120, revelation: "Medinan" },
  { number: 6, name: "Al-An'am", englishName: "The Cattle", verses: 165, revelation: "Meccan" },
  { number: 7, name: "Al-A'raf", englishName: "The Heights", verses: 206, revelation: "Meccan" },
  { number: 8, name: "Al-Anfal", englishName: "The Spoils of War", verses: 75, revelation: "Medinan" },
  { number: 9, name: "At-Tawbah", englishName: "The Repentance", verses: 129, revelation: "Medinan" },
  { number: 10, name: "Yunus", englishName: "Jonah", verses: 109, revelation: "Meccan" },
  { number: 36, name: "Ya-Sin", englishName: "Ya-Sin", verses: 83, revelation: "Meccan" },
  { number: 55, name: "Ar-Rahman", englishName: "The Beneficent", verses: 78, revelation: "Medinan" },
  { number: 67, name: "Al-Mulk", englishName: "The Sovereignty", verses: 30, revelation: "Meccan" },
  { number: 112, name: "Al-Ikhlas", englishName: "The Sincerity", verses: 4, revelation: "Meccan" },
  { number: 113, name: "Al-Falaq", englishName: "The Daybreak", verses: 5, revelation: "Meccan" },
  { number: 114, name: "An-Nas", englishName: "Mankind", verses: 6, revelation: "Meccan" }
];

// Dummy translations array as suggested by the outline's `selectedTranslation` state
const translations = [
  { id: "en.sahih", name: "Sahih International" },
  { id: "en.yusufali", name: "Yusuf Ali" },
  { id: "es.raulgonzales", name: "Raul Gonzales (Spanish)" }
];

// Commonly used Juz (Para) names to make selection intuitive
const JUZ_NAMES = [
  { number: 1, name: "Alif Lām Mīm" },
  { number: 2, name: "Sayaqūl" },
  { number: 3, name: "Tilka ar-Rusul" },
  { number: 4, name: "Lan Tanālu" },
  { number: 5, name: "Wal Muḥsanāt" },
  { number: 6, name: "Lā Yuḥibbullāhu al-jahr" },
  { number: 7, name: "Wa Iḏā Samiʿū" },
  { number: 8, name: "Wa Lau'annā" },
  { number: 9, name: "Qāl al-Mala'u" },
  { number: 10, name: "Wa Aʿlamū" },
  { number: 11, name: "Yataḏakkarūn" },
  { number: 12, name: "Wa Mā Ubarriʾu Nafsi" },
  { number: 13, name: "Wa Mā Uʾūtītum" },
  { number: 14, name: "Rubamā" },
  { number: 15, name: "Subḥānalladhī" },
  { number: 16, name: "Qāla Alam" },
  { number: 17, name: "Iqtaraba" },
  { number: 18, name: "Qad Aflaha" },
  { number: 19, name: "Wa Qālalladhīna" },
  { number: 20, name: "Aʿmān" },
  { number: 21, name: "Utlu Mā" },
  { number: 22, name: "Wa Māli" },
  { number: 23, name: "Wa Mā Lī" },
  { number: 24, name: "Faman Aẓlamu" },
  { number: 25, name: "Ilayhi Yuraddu" },
  { number: 26, name: "Ḥāʾ Mīm" },
  { number: 27, name: "Qāla Fama" },
  { number: 28, name: "Qad Samiʿallāhu" },
  { number: 29, name: "Tabārakalladhī" },
  { number: 30, name: "ʿAmma" }
];

// Urdu script Juz (Para) names for users who prefer Urdu labels
const JUZ_NAMES_URDU = [
  { number: 1, name: "الم" },
  { number: 2, name: "سَيَقُولُ" },
  { number: 3, name: "تِلْكَ الرُّسُلُ" },
  { number: 4, name: "لَنْ تَنَالُوا" },
  { number: 5, name: "وَٱلْمُحْصَنَاتُ" },
  { number: 6, name: "لَا يُحِبُّ ٱللَّهُ ٱلْجَهْرَ" },
  { number: 7, name: "وَإِذَا سَمِعُوا" },
  { number: 8, name: "وَلَوْ أَنَّنَا" },
  { number: 9, name: "قَالَ ٱلْمَلَأُ" },
  { number: 10, name: "وَٱعْلَمُوا" },
  { number: 11, name: "يَتَذَكَّرُونَ" },
  { number: 12, name: "وَمَا أُبَرِّئُ نَفْسِي" },
  { number: 13, name: "وَمَا أُوتِيتُمْ" },
  { number: 14, name: "رُبَمَا" },
  { number: 15, name: "سُبْحَانَ ٱلَّذِي" },
  { number: 16, name: "قَالَ أَلَمْ" },
  { number: 17, name: "ٱقْتَرَبَ" },
  { number: 18, name: "قَدْ أَفْلَحَ" },
  { number: 19, name: "وَقَالَ ٱلَّذِينَ" },
  { number: 20, name: "أَمَّنْ" },
  { number: 21, name: "ٱتْلُ مَا" },
  { number: 22, name: "وَمَالِي" },
  { number: 23, name: "وَمَا لِيَ" },
  { number: 24, name: "فَمَنْ أَظْلَمُ" },
  { number: 25, name: "إِلَيْهِ يُرَدُّ" },
  { number: 26, name: "حم" },
  { number: 27, name: "قَالَ فَمَا" },
  { number: 28, name: "قَدْ سَمِعَ ٱللَّهُ" },
  { number: 29, name: "تَبَارَكَ ٱلَّذِي" },
  { number: 30, name: "عَمَّ" }
];


const VerseCard = ({ verse, expanded, onToggle, onPlay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow mb-4"
    >
      <div className="flex items-start gap-4">
        <Badge className="bg-green-600 text-white text-sm px-3 py-1 flex-shrink-0">
          {verse.numberInSurah}
        </Badge>
        <div className="flex-1">
          <p
            dir="rtl"
            style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
            onClick={() => onPlay && onPlay(verse)}
            title="Click to play ayah audio"
            role="button"
            className="text-right text-2xl md:text-3xl leading-loose mb-4 font-arabic cursor-pointer hover:text-green-700 text-green-900"
          >
            {verse.arabic}
          </p>
          <p className="text-gray-700 leading-relaxed text-base">
            {verse.translation}
          </p>

          {verse.tafsir && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle(verse.numberInSurah)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Hide Tafsir
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show Tafsir
                  </>
                )}
              </Button>

              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <p className="text-sm font-semibold text-blue-900 mb-2">📚 Tafsir (Explanation):</p>
                  <p className="text-sm text-blue-800 leading-relaxed">{verse.tafsir}</p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

VerseCard.propTypes = {
  verse: PropTypes.object.isRequired,
  expanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onPlay: PropTypes.func,
};

export default function FullQuran() {
  const [selectedSurah, setSelectedSurah] = useState(surahs[0]); // Initialize with first surah object
  const [selectedReciter, setSelectedReciter] = useState(reciters[0]); // Initialize with first reciter object
  const [selectedTranslation, setSelectedTranslation] = useState(translations[0]); // Initialize with first translation object
  const [searchQuery, setSearchQuery] = useState("");
  const [surahVerses, setSurahVerses] = useState([]);
  const [juzVerses, setJuzVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // Renamed from 'playing' for clarity
  const [expandedVerse, setExpandedVerse] = useState(null);
  const [isJuzMode, setIsJuzMode] = useState(false);
  const [selectedJuz, setSelectedJuz] = useState(null);
  const [juzNameStyle, setJuzNameStyle] = useState("translit"); // translit | urdu
  const [repeat, setRepeat] = useState(false);
  const [playingVerseNumber, setPlayingVerseNumber] = useState(null);
  const [isJuzSequence, setIsJuzSequence] = useState(false);
  const [juzPlayIndex, setJuzPlayIndex] = useState(null);

  // Verse refs for scrolling when selecting an ayah
  const verseRefs = useRef({});

  // New state to manage the currently playing Audio object
  const [currentAudio, setCurrentAudio] = useState(null);
  const isStartingRef = useRef(false);

  // Function to stop any currently playing audio
  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0; // Reset audio to beginning
      setCurrentAudio(null); // Clear the reference
      setIsPlaying(false);
    }
    setIsJuzSequence(false);
    setJuzPlayIndex(null);
  };

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, [currentAudio]); // Dependency ensures cleanup for the specific audio instance

  // Load surah verses when selectedSurah or selectedTranslation changes
  useEffect(() => {
    if (!isJuzMode && selectedSurah) { // Ensure selectedSurah is not null before loading
      loadSurah(selectedSurah.number, selectedTranslation.id);
    }
  }, [selectedSurah, selectedTranslation, isJuzMode]);

  // Load selected Juz when changed
  useEffect(() => {
    if (isJuzMode && selectedJuz) {
      loadJuz(selectedJuz, selectedTranslation.id);
    }
  }, [isJuzMode, selectedJuz, selectedTranslation]);

  // Map reciter to audio edition for verse-level audio (default to Alafasy)
  const audioEditions = {
    alafasy: "ar.alafasy",
    sudais: "ar.abdurrahmanalsudais",
    basit: "ar.abdulbasitmurattal",
    husary: "ar.husary",
  };
  const getAudioEditionForReciter = () => {
    return audioEditions[selectedReciter?.id] || "ar.alafasy";
  };

  const loadSurah = async (surahNum, translationId) => {
    setLoading(true);
    stopCurrentAudio(); // Stop audio when a new surah is loading or translation changes
    try {
      const audioEdition = getAudioEditionForReciter();
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-simple,${translationId},${audioEdition}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        const arabicAyahs = data.data[0].ayahs;
        const englishAyahs = data.data[1] ? data.data[1].ayahs : []; // Check if translation data exists
        const audioAyahs = data.data[2] ? data.data[2].ayahs : [];

        const formattedVerses = arabicAyahs.map((ayah, index) => ({
          numberInSurah: ayah.numberInSurah,
          arabic: ayah.text,
          translation: englishAyahs[index] ? englishAyahs[index].text : "Translation not available for this verse.", // Handle missing translation
          tafsir: `This is a sample Tafsir for verse ${ayah.numberInSurah} of Surah ${selectedSurah.englishName}. In a real application, this would be loaded from a dedicated Tafsir API or dataset.`,
          audio: audioAyahs[index]?.audio || null,
        }));

        setSurahVerses(formattedVerses);
      } else {
        toast.error("Failed to load surah details from API.");
      }
    } catch (error) {
      console.error("Error loading surah:", error);
      toast.error("Failed to load surah. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const loadJuz = async (juzNum, translationId) => {
    setLoading(true);
    stopCurrentAudio();
    const audioEdition = getAudioEditionForReciter();
    const buildUrl = (scriptEdition) =>
      `https://api.alquran.cloud/v1/juz/${juzNum}/editions/${scriptEdition},${translationId},${audioEdition}`;
    try {
      // Prefer uthmani script for better glyphs, fall back to simple if needed
      let res = await fetch(buildUrl("quran-uthmani"));
      let data = await res.json();
      if (data.status !== "OK" || !data?.data?.[0]?.ayahs?.length) {
        res = await fetch(buildUrl("quran-simple"));
        data = await res.json();
      }

      if (data.status === "OK") {
        const arabicAyahs = data.data[0]?.ayahs || [];
        const englishAyahs = data.data[1]?.ayahs || [];
        const audioAyahs = data.data[2]?.ayahs || [];

        const formatted = arabicAyahs.map((ayah, idx) => ({
          surahNumber: ayah.surah.number,
          surahName: ayah.surah.englishName || ayah.surah.name,
          numberInSurah: ayah.numberInSurah,
          arabic: ayah.text,
          translation: englishAyahs[idx]?.text || "Translation not available.",
          tafsir: `This is a sample Tafsir for verse ${ayah.numberInSurah} of Surah ${ayah.surah.englishName || ayah.surah.name}.`,
          audio: audioAyahs[idx]?.audio || null,
        }));
        setJuzVerses(formatted);
        if (!formatted.length) {
          toast.info("No verses loaded for this Juz. Try a different translation or check your network.");
        }
      } else {
        toast.error("Failed to load Juz.");
      }
    } catch (error) {
      console.error("Error loading juz:", error);
      toast.error("Failed to load Juz. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = async (audioUrl, verseNumber = null, onEnded = null) => {
    if (!audioUrl) {
      toast.error("No audio available for this selection.");
      return;
    }
    if (isStartingRef.current) {
      // Prevent rapid double-start triggering AbortError
      return;
    }
    isStartingRef.current = true;
    try {
      stopCurrentAudio(); // Stop any currently playing audio
      const audio = new Audio(audioUrl);
      audio.loop = repeat;
      setCurrentAudio(audio); // Store the audio object in state

      await audio.play();
      setIsPlaying(true);
      setPlayingVerseNumber(verseNumber);

      audio.onended = () => {
        if (typeof onEnded === "function") {
          onEnded();
          return;
        }
        if (!repeat) {
          setIsPlaying(false);
          setCurrentAudio(null);
          setPlayingVerseNumber(null);
        }
      };
    } catch (error) {
      if (error?.name === "AbortError") {
        // Benign interruption (e.g., user pressed stop while starting). Don't show error toast.
        console.debug("Audio play aborted (pause/stop triggered). Ignoring.");
      } else {
        console.error("Error playing audio:", error);
        toast.error("Unable to play audio. The reciter might not have audio for this ayah/surah, or there's a network issue.");
      }
      setIsPlaying(false);
      setPlayingVerseNumber(null);
    } finally {
      isStartingRef.current = false;
    }
  };

  const playFullSurahAudio = () => {
    if (!selectedReciter || !selectedSurah) {
      toast.error("Please select a Surah and Reciter first.");
      return;
    }
    const surahNumber = selectedSurah.number.toString().padStart(3, "0");
    const audioUrl = `${selectedReciter.url}${surahNumber}.mp3`;
    handlePlayAudio(audioUrl);
  };

  const pauseAudio = () => {
    stopCurrentAudio();
  };

  const toggleRepeat = () => {
    const next = !repeat;
    setRepeat(next);
    if (currentAudio) currentAudio.loop = next;
  };

  const onPlayVerse = (verse) => {
    if (verse?.audio) {
      handlePlayAudio(verse.audio, verse.numberInSurah);
    } else {
      toast.info("Ayah audio not available for this reciter. Playing full surah instead.");
      playFullSurahAudio();
    }
  };

  const onSelectAyah = (num) => {
    const v = (isJuzMode ? juzVerses.find(v => v.numberInSurah === num) : surahVerses.find(v => v.numberInSurah === num));
    if (v) {
      // Scroll into view
      const ref = verseRefs.current[num];
      if (ref && ref.scrollIntoView) ref.scrollIntoView({ behavior: "smooth", block: "center" });
      // Play audio
      onPlayVerse(v);
    }
  };

  const jumpToStartOfJuz = () => {
    const el = verseRefs.current?.juzStart;
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const playJuzFromStart = () => {
    if (!isJuzMode || !selectedJuz) {
      toast.error("Please select a Juz first.");
      return;
    }
    if (!juzVerses || juzVerses.length === 0) {
      toast.error("No ayat loaded for this Juz yet. Please wait or reselect the Juz.");
      return;
    }
    setIsJuzSequence(true);
    setJuzPlayIndex(0);

    const playAtIndex = (idx) => {
      const verse = juzVerses[idx];
      if (!verse || !verse.audio) {
        // Skip to next if audio missing
        const next = idx + 1;
        if (next < juzVerses.length) {
          setJuzPlayIndex(next);
          playAtIndex(next);
        } else {
          setIsJuzSequence(false);
          setPlayingVerseNumber(null);
          setCurrentAudio(null);
          setIsPlaying(false);
        }
        return;
      }
      setPlayingVerseNumber(verse.numberInSurah);
      handlePlayAudio(verse.audio, verse.numberInSurah, () => {
        if (repeat) {
          // If repeat is on, loop this ayah (audio.loop handles it)
          return;
        }
        const next = idx + 1;
        if (next < juzVerses.length) {
          setJuzPlayIndex(next);
          playAtIndex(next);
        } else {
          setIsJuzSequence(false);
          setPlayingVerseNumber(null);
          setCurrentAudio(null);
          setIsPlaying(false);
        }
      });
    };

    playAtIndex(0);
  };

  const handleReciterChange = (reciter) => {
    stopCurrentAudio(); // Stop current audio if playing
    setSelectedReciter(reciter);
  };

  const handleSurahSelect = (surah) => {
    stopCurrentAudio(); // Stop current audio if playing
    setSelectedSurah(surah);
  };

  const handleTranslationChange = (translationId) => {
    const newTranslation = translations.find(t => t.id === translationId);
    if (newTranslation) {
      setSelectedTranslation(newTranslation);
      // loadSurah will be triggered by the useEffect on selectedTranslation change
    }
  };

  const filteredSurahs = surahs.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.number.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap');
        /* Custom scrollbar for surah selection grid */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            The Noble Qur&apos;an
          </h1>
          <p className="text-lg text-gray-600">
            Read, listen, and understand Allah&apos;s words
          </p>
        </motion.div>

        <Card className="mb-8 border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
            <CardTitle>Select Reciter, Surah & Translation</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Choose Reciter
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {reciters.map((reciter) => (
                  <Button
                    key={reciter.id}
                    onClick={() => handleReciterChange(reciter)}
                    variant={selectedReciter.id === reciter.id ? "default" : "outline"}
                    className={`h-auto py-3 px-4 ${
                      selectedReciter.id === reciter.id
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="text-center w-full">
                      <div className="text-2xl mb-1">{reciter.flag}</div>
                      <p className="text-xs font-semibold truncate">{reciter.name}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Choose Translation
              </label>
              <Select
                value={selectedTranslation.id}
                onValueChange={handleTranslationChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a translation" />
                </SelectTrigger>
                <SelectContent>
                  {translations.map((translation) => (
                    <SelectItem key={translation.id} value={translation.id}>
                      {translation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search & Choose Surah
              </label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search Surah by name or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 w-full"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredSurahs.map((surah) => (
                  <Button
                    key={surah.number}
                    onClick={() => handleSurahSelect(surah)}
                    variant={selectedSurah?.number === surah.number ? "default" : "outline"}
                    className={`h-auto py-3 px-4 ${
                      selectedSurah?.number === surah.number
                        ? "bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="text-center w-full">
                      <p className="text-sm font-semibold">{surah.name}</p>
                      <p className="text-xs text-gray-500">({surah.englishName})</p>
                    </div>
                  </Button>
                ))}
              </div>
              {filteredSurahs.length === 0 && searchQuery && (
                <p className="text-center text-gray-500 mt-4">No surahs found for "{searchQuery}"</p>
              )}
            </div>

            {/* Ayah & Juz selection controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div>
                {!isJuzMode ? (
                  <>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Ayah (verse)</label>
                    <Select onValueChange={(val) => onSelectAyah(Number(val))} disabled={!selectedSurah}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose Ayah number" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedSurah && Array.from({ length: selectedSurah.verses }, (_, i) => i + 1).map(n => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Ayah in Juz</label>
                    <Select onValueChange={(val) => {
                      const idx = Number(val) - 1;
                      const verse = juzVerses[idx];
                      if (verse) {
                        const ref = verseRefs.current[verse.numberInSurah];
                        if (ref && ref.scrollIntoView) ref.scrollIntoView({ behavior: "smooth", block: "center" });
                        onPlayVerse(verse);
                      }
                    }} disabled={!selectedJuz}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose Ayah index in Juz" />
                      </SelectTrigger>
                      <SelectContent>
                        {juzVerses && juzVerses.map((_, i) => (
                          <SelectItem key={i} value={String(i + 1)}>{i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Juz (Para)</label>
                <Select value={selectedJuz ? String(selectedJuz) : undefined} onValueChange={(val) => { setSelectedJuz(Number(val)); setIsJuzMode(true); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose Juz (e.g., Alif Lām Mīm)" />
                  </SelectTrigger>
                  <SelectContent>
                    {(juzNameStyle === "urdu" ? JUZ_NAMES_URDU : JUZ_NAMES).map(j => (
                      <SelectItem key={j.number} value={String(j.number)}>Juz {j.number} — {j.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-600">Name style:</span>
                  <Button size="sm" variant={juzNameStyle === "translit" ? "default" : "outline"} onClick={() => setJuzNameStyle("translit")}>
                    Transliteration
                  </Button>
                  <Button size="sm" variant={juzNameStyle === "urdu" ? "default" : "outline"} onClick={() => setJuzNameStyle("urdu")}>
                    اردو
                  </Button>
                </div>
                {isJuzMode && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className="bg-green-600">Viewing: Juz {selectedJuz} — {(juzNameStyle === "urdu" ? JUZ_NAMES_URDU : JUZ_NAMES).find(x => x.number === selectedJuz)?.name || ""}</Badge>
                    <Button variant="outline" onClick={() => { setIsJuzMode(false); setSelectedJuz(null); setJuzVerses([]); }}>
                      Exit Juz View
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Audio Controls</label>
                <div className="flex gap-2">
                  <Button onClick={pauseAudio} variant="outline" className="flex-1">
                    <StopCircle className="w-4 h-4 mr-1" /> Stop
                  </Button>
                  <Button onClick={toggleRepeat} variant={repeat ? "default" : "outline"} className="flex-1">
                    <Repeat className="w-4 h-4 mr-1" /> {repeat ? "Repeat: On" : "Repeat: Off"}
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={isPlaying ? pauseAudio : (isJuzMode ? playJuzFromStart : playFullSurahAudio)}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              size="lg"
              disabled={loading} // Disable play button when loading verses
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading Surah...
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause Audio
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  {isJuzMode ? "Play Full Juz" : "Play Full Surah"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {selectedSurah && (
          <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedSurah.name}
                  </h2>
                  <p className="text-lg text-gray-700 mb-1">
                    {selectedSurah.englishName}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <Badge className="bg-blue-600">
                      {selectedSurah.verses} Verses
                    </Badge>
                    <Badge className="bg-purple-600">
                      {selectedSurah.revelation}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  <Volume2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedSurah && selectedSurah.number !== 9 && selectedSurah.number !== 1 && (
          <div className="text-center py-6 mb-6 border-b-2 border-green-200 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
            <p
              className="text-4xl md:text-5xl mb-3 font-arabic"
              dir="rtl"
              style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <p className="text-sm text-gray-600 font-medium">
              In the name of Allah, the Most Gracious, the Most Merciful
            </p>
          </div>
        )}

        {loading && !isPlaying ? ( // Show loading spinner only when verses are loading and audio is not playing
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
            <p className="text-gray-600">Loading Surah Verses...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {isJuzMode && selectedJuz && (
              <Card className="mb-4 border border-green-200 bg-green-50">
                <CardContent className="py-4 px-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Juz {selectedJuz} — {(juzNameStyle === "urdu" ? JUZ_NAMES_URDU : JUZ_NAMES).find(x => x.number === selectedJuz)?.name || ""}</h3>
                      <p className="text-sm text-gray-600">Displaying combined ayat across their surahs</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Repeat className="w-6 h-6 text-green-600" />
                      <StopCircle className="w-6 h-6 text-red-600" />
                      <Button variant="outline" onClick={jumpToStartOfJuz}>
                        <BookOpen className="w-4 h-4 mr-1" /> Go to start
                      </Button>
                      <Button className="bg-green-600" onClick={playJuzFromStart}>
                        <Play className="w-4 h-4 mr-1" /> Play from start
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {(isJuzMode ? juzVerses : surahVerses).map((verse, idx) => (
              <div key={`${verse.surahNumber || selectedSurah?.number}-${verse.numberInSurah}`} ref={(el) => { verseRefs.current[verse.numberInSurah] = el; if (isJuzMode && idx === 0) verseRefs.current.juzStart = el; }}>
                {/* Show surah badge when in Juz mode */}
                {isJuzMode && (
                  <div className="mb-1 text-sm text-gray-600">Surah {verse.surahName} — Ayah {verse.numberInSurah}</div>
                )}
                <VerseCard
                  verse={verse}
                  expanded={expandedVerse === verse.numberInSurah}
                  onToggle={(verseNum) =>
                    setExpandedVerse(expandedVerse === verseNum ? null : verseNum)
                  }
                  onPlay={onPlayVerse}
                />
                <div className="flex gap-2 mb-6">
                  <Button onClick={() => onPlayVerse(verse)} className="bg-green-600">
                    <Play className="w-4 h-4 mr-1" /> Play Ayah
                  </Button>
                  <Button onClick={pauseAudio} variant="outline">
                    <StopCircle className="w-4 h-4 mr-1" /> Stop
                  </Button>
                  <Button onClick={toggleRepeat} variant={repeat ? "default" : "outline"}>
                    <Repeat className="w-4 h-4 mr-1" /> {repeat ? "Repeat On" : "Repeat Off"}
                  </Button>
                  {playingVerseNumber === verse.numberInSurah && isPlaying && (
                    <Badge className="bg-green-600">Playing</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
