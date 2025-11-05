
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Mic,
  MicOff,
  Volume2,
  Pause,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Star,
  Trophy,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Reciters list with CORRECT IDs verified from cdn.islamic.network
const reciters = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy" },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit (Murattal)" },
  { id: "ar.shaatree", name: "Abu Bakr al-Shatri" },
  { id: "ar.saoodshuraym", name: "Sa'ud ash-Shuraym" }, // Fixed ID
  { id: "ar.husary", name: "Mahmoud Khalil Al-Hussary" },
];

// Quran data
const quranData = {
  surahs: [
    {
      number: 1,
      name: "Al-Fatihah",
      englishName: "The Opening",
      ayahs: [
        {
          number: 1,
          text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "Bismillah ir-Rahman ir-Raheem",
          translation: "In the name of Allah, the Most Gracious, the Most Merciful",
        },
        {
          number: 2,
          text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
          transliteration: "Alhamdu lillahi rabbil 'alameen",
          translation: "All praise is due to Allah, Lord of all the worlds",
        },
        {
          number: 3,
          text: "الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "Ar-Rahman ir-Raheem",
          translation: "The Most Gracious, the Most Merciful",
        },
        {
          number: 4,
          text: "مَالِكِ يَوْمِ الدِّينِ",
          transliteration: "Maliki yawmid-deen",
          translation: "Master of the Day of Judgment",
        },
        {
          number: 5,
          text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
          transliteration: "Iyyaka na'budu wa iyyaka nasta'een",
          translation: "You alone we worship, and You alone we ask for help",
        },
        {
          number: 6,
          text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
          transliteration: "Ihdinas-siratal mustaqeem",
          translation: "Guide us to the straight path",
        },
        {
          number: 7,
          text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Siratal-latheena an'amta 'alayhim ghayril-maghdubi 'alayhim walad-dalleen",
          translation: "The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray",
        }
      ]
    },
    {
      number: 36,
      name: "Yasin",
      englishName: "Yasin",
      ayahs: [
        {
          number: 1,
          text: "يس",
          transliteration: "Ya-Seen",
          translation: "Ya-Seen",
        },
        {
          number: 2,
          text: "وَالْقُرْآنِ الْحَكِيمِ",
          transliteration: "Wal-Qur'anil-Hakeem",
          translation: "By the wise Qur'an",
        },
        {
          number: 3,
          text: "إِنَّكَ لَمِنَ الْمُرْسَلِينَ",
          transliteration: "Innaka laminal-mursaleen",
          translation: "Indeed you, [O Muhammad], are from among the messengers",
        }
      ]
    },
    {
      number: 55,
      name: "Ar-Rahman",
      englishName: "The Most Merciful",
      ayahs: [
        {
          number: 1,
          text: "الرَّحْمَٰنُ",
          transliteration: "Ar-Rahman",
          translation: "The Most Merciful",
        },
        {
          number: 2,
          text: "عَلَّمَ الْقُرْآنَ",
          transliteration: "'Allamal-Qur'an",
          translation: "Taught the Qur'an",
        },
        {
          number: 3,
          text: "خَلَقَ الْإِنسَانَ",
          transliteration: "Khalaqal-insan",
          translation: "Created man",
        },
        {
          number: 4,
          text: "عَلَّمَهُ الْبَيَانَ",
          transliteration: "'Allamahul-bayan",
          translation: "And taught him eloquence",
        }
      ]
    },
    {
      number: 56,
      name: "Al-Waqi'ah",
      englishName: "The Inevitable",
      ayahs: [
        {
          number: 1,
          text: "إِذَا وَقَعَتِ الْوَاقِعَةُ",
          transliteration: "Idha waqa'atil-waqi'ah",
          translation: "When the Occurrence occurs",
        },
        {
          number: 2,
          text: "لَيْسَ لِوَقْعَتِهَا كَاذِبَةٌ",
          transliteration: "Laysa liwaqa'tiha kadhibah",
          translation: "There is, at its occurrence, no denial",
        },
        {
          number: 3,
          text: "خَافِضَةٌ رَّافِعَةٌ",
          transliteration: "Khafidatur-rafi'ah",
          translation: "It will bring down [some] and raise up [others]",
        }
      ]
    },
    {
      number: 67,
      name: "Al-Mulk",
      englishName: "The Sovereignty",
      ayahs: [
        {
          number: 1,
          text: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
          transliteration: "Tabarakal-ladhi biyadihil-mulku wa huwa 'ala kulli shay'in qadeer",
          translation: "Blessed is He in whose hand is dominion, and He is over all things competent",
        },
        {
          number: 2,
          text: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ",
          transliteration: "Alladhi khalaqal-mawta wal-hayata liyabluwakum ayyukum ahsanu 'amala, wa huwal-'Azeezul-Ghafoor",
          translation: "[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving",
        },
        {
          number: 3,
          text: "الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ",
          transliteration: "Alladhi khalaqa sab'a samawatin tibaq, ma tara fee khalqir-Rahmani min tafawut, farji'il-basara hal tara min futur",
          translation: "[And] who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency. So return [your] vision [to the sky]; do you see any breaks?",
        }
      ]
    },
    {
      number: 112,
      name: "Al-Ikhlas",
      englishName: "The Sincerity",
      ayahs: [
        {
          number: 1,
          text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
          transliteration: "Qul huwa Allahu ahad",
          translation: "Say: He is Allah, the One",
        },
        {
          number: 2,
          text: "اللَّهُ الصَّمَدُ",
          transliteration: "Allahu as-samad",
          translation: "Allah, the Eternal Refuge",
        },
        {
          number: 3,
          text: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
          transliteration: "Lam yalid wa lam yoolad",
          translation: "He neither begets nor is born",
        },
        {
          number: 4,
          text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
          transliteration: "Wa lam yakun lahu kufuwan ahad",
          translation: "Nor is there to Him any equivalent",
        }
      ]
    },
    {
      number: 113,
      name: "Al-Falaq",
      englishName: "The Daybreak",
      ayahs: [
        {
          number: 1,
          text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
          transliteration: "Qul a'udhu bi rabbil-falaq",
          translation: "Say: I seek refuge in the Lord of daybreak",
        },
        {
          number: 2,
          text: "مِن شَرِّ مَا خَلَقَ",
          transliteration: "Min sharri ma khalaq",
          translation: "From the evil of that which He created",
        },
        {
          number: 3,
          text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
          transliteration: "Wa min sharri ghasiqin idha waqab",
          translation: "And from the evil of darkness when it settles",
        },
        {
          number: 4,
          text: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
          transliteration: "Wa min sharrin-naffathati fil-'uqad",
          translation: "And from the evil of the blowers in knots",
        },
        {
          number: 5,
          text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
          transliteration: "Wa min sharri hasidin idha hasad",
          translation: "And from the evil of an envier when he envies",
        }
      ]
    },
    {
      number: 114,
      name: "An-Nas",
      englishName: "Mankind",
      ayahs: [
        {
          number: 1,
          text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
          transliteration: "Qul a'udhu bi rabbin-nas",
          translation: "Say: I seek refuge in the Lord of mankind",
        },
        {
          number: 2,
          text: "مَلِكِ النَّاسِ",
          transliteration: "Malikin-nas",
          translation: "The Sovereign of mankind",
        },
        {
          number: 3,
          text: "إِلَٰهِ النَّاسِ",
          transliteration: "Ilahin-nas",
          translation: "The God of mankind",
        },
        {
          number: 4,
          text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
          transliteration: "Min sharril-waswasil-khannas",
          translation: "From the evil of the retreating whisperer",
        },
        {
          number: 5,
          text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
          transliteration: "Allathee yuwaswisu fee sudoorin-nas",
          translation: "Who whispers [evil] into the breasts of mankind",
        },
        {
          number: 6,
          text: "مِنَ الْجِنَّةِ وَالنَّاسِ",
          transliteration: "Minal-jinnati wannas",
          translation: "From among the jinn and mankind",
        }
      ]
    }
  ]
};

export default function Quran() {
  const [selectedSurah, setSelectedSurah] = useState(quranData.surahs[0]);
  const [selectedReciter, setSelectedReciter] = useState(reciters[0]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [highlightedWords, setHighlightedWords] = useState([]);
  const [audioError, setAudioError] = useState(null);

  const audioRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setupSpeechRecognition();
  }, []);

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      } else {
        setUser(null); // Ensure user is null if not authenticated
      }
    } catch (error) {
      console.log("User not authenticated");
      setUser(null); // Ensure user is null if error occurs
    }
  };

  const setupSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ar-SA';

      recognitionRef.current.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        checkRecitation(spokenText);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setFeedback({
          type: 'error',
          message: 'Could not hear you clearly. Please try again.'
        });
        setIsChecking(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  };

  const checkRecitation = async (spokenText) => {
    const currentAyah = selectedSurah.ayahs[currentAyahIndex];
    setIsChecking(true);
    setAttempts(attempts + 1);
    setHighlightedWords([]);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Quran teacher. Student should recite: "${currentAyah.text}"
Speech heard: "${spokenText}"

If 60%+ words match, set is_correct_ayah=true and give 70-100 score. Otherwise false and 0-30.
Mark wrong Arabic words in mistake_words for highlighting.

Return JSON:
{
  "is_correct_ayah": true/false,
  "accuracy_score": 0-100,
  "tajweed_quality": "excellent"/"good"/"needs_improvement"/"poor",
  "mistake_words": ["word1"],
  "feedback_message": "message",
  "tips": "tips"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            accuracy_score: { type: "number" },
            is_correct_ayah: { type: "boolean" },
            tajweed_quality: { type: "string", enum: ["excellent", "good", "needs_improvement", "poor"] },
            mistake_words: { type: "array", items: { type: "string" } },
            feedback_message: { type: "string" },
            tips: { type: "string" }
          }
        }
      });

      const analysis = result;
      const accuracyScore = analysis.accuracy_score || 0;
      const isCorrectAyah = analysis.is_correct_ayah;

      if (analysis.mistake_words && analysis.mistake_words.length > 0) {
        setHighlightedWords(analysis.mistake_words);
      }

      if (!isCorrectAyah) {
        setFeedback({
          type: 'error',
          message: 'It seems you recited a different ayah. Listen and try again.',
          similarity: Math.round(accuracyScore),
          tips: `Recite: "${currentAyah.transliteration}"`
        });
        setIsChecking(false);
        return;
      }

      if (accuracyScore >= 70) {
        setFeedback({
          type: 'success',
          message: analysis.feedback_message || 'Masha\'Allah! Excellent! ✨',
          similarity: Math.round(accuracyScore),
          tajweed: analysis.tajweed_quality,
          tips: analysis.tips
        });
        setScore(score + 10);

        if (user) {
          await saveProgress(true);
        }

        setTimeout(() => {
          if (currentAyahIndex < selectedSurah.ayahs.length - 1) {
            setCurrentAyahIndex(currentAyahIndex + 1);
            setFeedback(null);
            setTranscript("");
            setHighlightedWords([]);
          }
        }, 3000);
      } else if (accuracyScore >= 50) {
        setFeedback({
          type: 'warning',
          message: analysis.feedback_message || 'Good effort! Practice Tajweed more. 📖',
          similarity: Math.round(accuracyScore),
          tajweed: analysis.tajweed_quality,
          tips: analysis.tips
        });
      } else {
        setFeedback({
          type: 'error',
          message: analysis.feedback_message || 'Let\'s try again. Listen carefully. 🎧',
          similarity: Math.round(accuracyScore),
          tajweed: analysis.tajweed_quality,
          tips: analysis.tips
        });
      }
    } catch (error) {
      console.error('Error checking recitation:', error);
      setFeedback({
        type: 'error',
        message: 'Could not check your recitation. Please try again.'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const saveProgress = async (success) => {
    try {
      await base44.entities.GameScore.create({
        user_id: user.id,
        game_type: "quran_recitation",
        score: 10,
        completed: success
      });

      const newPoints = Math.min((user.points || 0) + 10, 400);
      await base44.auth.updateMe({ points: newPoints });
      setUser({ ...user, points: newPoints });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setFeedback(null);
      setHighlightedWords([]);
      setIsRecording(true);
      recognitionRef.current.start();
    } else {
      setFeedback({
        type: 'error',
        message: 'Speech recognition not supported. Use Chrome or Edge.'
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const playAudio = async () => {
    if (!audioRef.current) return;

    // If already playing, pause it
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // Format: surah number (3 digits) + ayah number (3 digits)
    const surahNumPadded = selectedSurah.number.toString().padStart(3, '0');
    const ayahNumPadded = selectedSurah.ayahs[currentAyahIndex].number.toString().padStart(3, '0');
    
    // Play INDIVIDUAL AYAH (not whole surah)
    const ayahAudioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${selectedReciter.id}/${surahNumPadded}${ayahNumPadded}.mp3`;
    
    console.log("Loading ayah audio from:", ayahAudioUrl);
    setAudioError(null);
    
    audioRef.current.src = ayahAudioUrl;
    audioRef.current.load();

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing ayah audio:", error);
      
      // Try fallback: whole surah audio
      const fallbackUrl = `https://cdn.islamic.network/quran/audio/128/${selectedReciter.id}/${selectedSurah.number}.mp3`;
      console.log("Trying fallback (whole surah):", fallbackUrl);
      
      audioRef.current.src = fallbackUrl;
      audioRef.current.load();
      
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setFeedback({
          type: 'warning',
          message: 'Playing full surah audio (ayah-by-ayah not available for this reciter)'
        });
      } catch (err) {
        console.error("Fallback also failed:", err);
        setAudioError("Could not play audio. Please try another reciter.");
        setFeedback({
          type: 'error',
          message: "Could not play audio. Please try another reciter."
        });
      }
    }
  };

  const handleSurahChange = (surahNumber) => {
    const surah = quranData.surahs.find(s => s.number === parseInt(surahNumber));
    setSelectedSurah(surah);
    setCurrentAyahIndex(0);
    setFeedback(null);
    setTranscript("");
    setHighlightedWords([]);
    setAttempts(0);
    setAudioError(null);
    
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleReciterChange = (reciterId) => {
    const reciter = reciters.find(r => r.id === reciterId);
    setSelectedReciter(reciter);
    setAudioError(null);
    
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const renderArabicWithHighlights = (text) => {
    if (highlightedWords.length === 0) {
      return <span>{text}</span>;
    }

    const words = text.split(' ');
    return (
      <span>
        {words.map((word, index) => {
          // A simple check if the word contains any of the mistake words.
          // This might need more sophisticated Arabic text processing for better accuracy.
          const shouldHighlight = highlightedWords.some(errorWord =>
            word.includes(errorWord) || errorWord.includes(word)
          );

          return (
            <span
              key={index}
              className={shouldHighlight ? 'text-red-600 font-bold bg-red-50 px-1 rounded' : ''}
            >
              {word}{index < words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </span>
    );
  };

  const currentAyah = selectedSurah.ayahs[currentAyahIndex];
  const progress = ((currentAyahIndex + 1) / selectedSurah.ayahs.length) * 100;

  return (
    <div className="min-h-screen py-4 sm:py-8 md:py-12 px-3 sm:px-4 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📖</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Learn Quran Recitation
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Practice your recitation with AI-powered Tajweed feedback
          </p>
        </motion.div>

        {/* Info Alert */}
        <Alert className="mb-4 sm:mb-6 bg-blue-50 border-blue-200">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-xs sm:text-sm text-blue-800">
            🎤 Click microphone and recite. Tajweed mistakes will be highlighted in red!
          </AlertDescription>
        </Alert>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card className="border-2 border-green-200">
            <CardContent className="p-2 sm:p-4 text-center">
              <Star className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-amber-500" />
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{score}</p>
              <p className="text-[10px] sm:text-sm text-gray-600">Points</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-blue-200">
            <CardContent className="p-2 sm:p-4 text-center">
              <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-500" />
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{currentAyahIndex + 1}/{selectedSurah.ayahs.length}</p>
              <p className="text-[10px] sm:text-sm text-gray-600">Ayahs</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-200">
            <CardContent className="p-2 sm:p-4 text-center">
              <Trophy className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-purple-500" />
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{attempts}</p>
              <p className="text-[10px] sm:text-sm text-gray-600">Attempts</p>
            </CardContent>
          </Card>
        </div>

        {/* Surah & Reciter Selector */}
        <Card className="mb-4 sm:mb-6 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 sm:p-4 md:p-6">
            <CardTitle className="text-base sm:text-lg md:text-xl">Select Surah & Reciter</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Choose Surah</label>
              <Select value={selectedSurah.number.toString()} onValueChange={handleSurahChange}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Choose a Surah" />
                </SelectTrigger>
                <SelectContent>
                  {quranData.surahs.map(surah => (
                    <SelectItem key={surah.number} value={surah.number.toString()} className="text-xs sm:text-sm">
                      {surah.number}. {surah.name} - {surah.englishName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Choose Reciter</label>
              <Select value={selectedReciter.id} onValueChange={handleReciterChange}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Choose a Reciter" />
                </SelectTrigger>
                <SelectContent>
                  {reciters.map(reciter => (
                    <SelectItem key={reciter.id} value={reciter.id} className="text-xs sm:text-sm">
                      {reciter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Progress value={progress} className="mt-2 sm:mt-4 h-1.5 sm:h-2" />
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 text-center">
              Progress: {currentAyahIndex + 1} of {selectedSurah.ayahs.length} ayahs
            </p>
          </CardContent>
        </Card>

        {/* Current Ayah Display */}
        <Card className="mb-4 sm:mb-6 shadow-xl border-2 border-green-300">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="text-center mb-4 sm:mb-6">
              <Badge className="mb-3 sm:mb-4 bg-green-600 text-xs sm:text-sm">
                Ayah {currentAyah.number}
              </Badge>

              {/* Arabic Text with Red Highlighting */}
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-arabic leading-loose mb-4 sm:mb-6 text-gray-900 bg-green-50 p-4 sm:p-6 rounded-xl border-2 border-green-200" dir="rtl" style={{
                fontFamily: "'Amiri', 'Scheherazade New', 'Traditional Arabic', serif",
                lineHeight: "2.5"
              }}>
                {renderArabicWithHighlights(currentAyah.text)}
              </div>

              {/* Transliteration */}
              <div className="text-sm sm:text-base md:text-lg text-gray-700 mb-3 sm:mb-4 italic bg-blue-50 p-3 sm:p-4 rounded-lg">
                {currentAyah.transliteration}
              </div>

              {/* Translation */}
              <div className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto bg-purple-50 p-3 sm:p-4 rounded-lg">
                {currentAyah.translation}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-stretch sm:items-center">
              <Button
                onClick={playAudio}
                disabled={isRecording || isChecking}
                className={`${isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'} text-xs sm:text-sm md:text-base py-4 sm:py-5`}
                size="lg"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Pause Audio
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Listen to Recitation
                  </>
                )}
              </Button>

              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isChecking}
                className={`text-xs sm:text-sm md:text-base py-4 sm:py-5 ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                size="lg"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Start Reciting
                  </>
                )}
              </Button>
            </div>

            {isChecking && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 text-blue-600">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium text-xs sm:text-sm">Checking Tajweed...</span>
                </div>
              </div>
            )}

            {audioError && (
              <div className="mt-4">
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-xs sm:text-sm text-red-800">
                    {audioError}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <audio
              ref={audioRef}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onError={() => {
                setIsPlaying(false);
                console.error("Audio element error");
              }}
              preload="none"
            />
          </CardContent>
        </Card>

        {/* Transcript Display */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mb-4 sm:mb-6 border-2 border-purple-200">
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">What the system heard:</p>
                <p className="text-base sm:text-lg md:text-xl text-gray-900" dir="rtl">{transcript}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Feedback Display */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Alert className={`mb-4 sm:mb-6 ${
                feedback.type === 'success'
                  ? 'bg-green-50 border-green-300'
                  : feedback.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-red-50 border-red-300'
              }`}>
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                )}
                <AlertDescription className={`text-xs sm:text-sm ${
                  feedback.type === 'success'
                    ? 'text-green-800'
                    : feedback.type === 'warning'
                    ? 'text-yellow-800'
                    : 'text-red-800'
                }`}>
                  <p className="font-semibold text-sm sm:text-base md:text-lg mb-1">{feedback.message}</p>
                  {feedback.similarity !== undefined && (
                    <p className="text-xs sm:text-sm mb-1 sm:mb-2">Accuracy: {feedback.similarity}%</p>
                  )}
                  {feedback.tajweed && (
                    <p className="text-xs sm:text-sm mb-1 sm:mb-2">
                      Tajweed: <span className="font-semibold capitalize">{feedback.tajweed.replace(/_/g, ' ')}</span>
                    </p>
                  )}
                  {feedback.tips && (
                    <p className="text-xs sm:text-sm mt-2 sm:mt-3 bg-white p-2 sm:p-3 rounded-lg border-2 border-blue-200">
                      💡 <strong>Tip:</strong> {feedback.tips}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex flex-col xs:flex-row justify-between items-stretch xs:items-center gap-2 sm:gap-4">
          <Button
            onClick={() => {
              if (currentAyahIndex > 0) {
                setCurrentAyahIndex(currentAyahIndex - 1);
                setFeedback(null);
                setTranscript("");
                setHighlightedWords([]);
              }
            }}
            disabled={currentAyahIndex === 0 || isChecking}
            variant="outline"
            className="text-xs sm:text-sm"
            size="sm"
          >
            ← Previous Ayah
          </Button>

          <Button
            onClick={() => {
              setCurrentAyahIndex(0);
              setFeedback(null);
              setTranscript("");
              setHighlightedWords([]);
              setAttempts(0);
            }}
            disabled={isChecking}
            variant="outline"
            className="text-xs sm:text-sm"
            size="sm"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Restart Surah
          </Button>

          <Button
            onClick={() => {
              if (currentAyahIndex < selectedSurah.ayahs.length - 1) {
                setCurrentAyahIndex(currentAyahIndex + 1);
                setFeedback(null);
                setTranscript("");
                setHighlightedWords([]);
              }
            }}
            disabled={currentAyahIndex === selectedSurah.ayahs.length - 1 || isChecking}
            variant="outline"
            className="text-xs sm:text-sm"
            size="sm"
          >
            Next Ayah →
          </Button>
        </div>

        {/* Completion Message */}
        {currentAyahIndex === selectedSurah.ayahs.length - 1 && feedback?.type === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 sm:mt-6"
          >
            <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-0">
              <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                <Trophy className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-2xl sm:text-3xl font-bold mb-2">Masha'Allah!</h3>
                <p className="text-base sm:text-lg mb-3 sm:mb-4">
                  You've completed Surah {selectedSurah.name}!
                </p>
                <p className="text-lg sm:text-xl font-bold">Earned: {score} points</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .font-arabic {
          font-family: 'Traditional Arabic', 'Amiri', 'Scheherazade New', serif;
        }
      `}</style>
    </div>
  );