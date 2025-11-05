
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Added for search functionality
import { motion } from "framer-motion";
import { BookOpen, Volume2, Play, Pause, ChevronDown, ChevronUp, Loader2, Search } from "lucide-react"; // Added Search icon
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


const VerseCard = ({ verse, expanded, onToggle }) => {
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
            className="text-right text-2xl md:text-3xl leading-loose mb-4 font-arabic"
            dir="rtl"
            style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
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
  onToggle: PropTypes.func.isRequired
};

export default function FullQuran() {
  const [selectedSurah, setSelectedSurah] = useState(surahs[0]); // Initialize with first surah object
  const [selectedReciter, setSelectedReciter] = useState(reciters[0]); // Initialize with first reciter object
  const [selectedTranslation, setSelectedTranslation] = useState(translations[0]); // Initialize with first translation object
  const [searchQuery, setSearchQuery] = useState("");
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // Renamed from 'playing' for clarity
  const [expandedVerse, setExpandedVerse] = useState(null);

  // New state to manage the currently playing Audio object
  const [currentAudio, setCurrentAudio] = useState(null);

  // Function to stop any currently playing audio
  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0; // Reset audio to beginning
      setCurrentAudio(null); // Clear the reference
      setIsPlaying(false);
    }
  };

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, [currentAudio]); // Dependency ensures cleanup for the specific audio instance

  // Load surah verses when selectedSurah or selectedTranslation changes
  useEffect(() => {
    if (selectedSurah) { // Ensure selectedSurah is not null before loading
      loadSurah(selectedSurah.number, selectedTranslation.id);
    }
  }, [selectedSurah, selectedTranslation]);

  const loadSurah = async (surahNum, translationId) => {
    setLoading(true);
    stopCurrentAudio(); // Stop audio when a new surah is loading or translation changes
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-simple,${translationId}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        const arabicAyahs = data.data[0].ayahs;
        const englishAyahs = data.data[1] ? data.data[1].ayahs : []; // Check if translation data exists

        const formattedVerses = arabicAyahs.map((ayah, index) => ({
          numberInSurah: ayah.numberInSurah,
          arabic: ayah.text,
          translation: englishAyahs[index] ? englishAyahs[index].text : "Translation not available for this verse.", // Handle missing translation
          tafsir: `This is a sample Tafsir for verse ${ayah.numberInSurah} of Surah ${selectedSurah.englishName}. In a real application, this would be loaded from a dedicated Tafsir API or dataset.`
        }));

        setVerses(formattedVerses);
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

  const handlePlayAudio = (audioUrl) => {
    stopCurrentAudio(); // Stop any currently playing audio

    const audio = new Audio(audioUrl);
    setCurrentAudio(audio); // Store the audio object in state

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((error) => {
      console.error("Error playing audio:", error);
      toast.error("Unable to play audio. The reciter might not have audio for this surah, or there's a network issue.");
      setIsPlaying(false);
      setCurrentAudio(null);
    });

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };
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

            <Button
              onClick={isPlaying ? pauseAudio : playFullSurahAudio}
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
                  Play Full Surah
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
            {verses.map((verse) => (
              <VerseCard
                key={verse.numberInSurah}
                verse={verse}
                expanded={expandedVerse === verse.numberInSurah}
                onToggle={(verseNum) =>
                  setExpandedVerse(expandedVerse === verseNum ? null : verseNum)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
