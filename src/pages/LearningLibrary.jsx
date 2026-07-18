import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, Lightbulb, FileText, Users, Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Volume2, VolumeX, Search, Settings as Cog, Bot } from "lucide-react";

const libraryResources = [
  {
    id: "encyclopedia",
    title: "Islamic Encyclopedia",
    description: "Learn about prophets, angels, and Islamic months",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
    emoji: "📚",
    link: "IslamicEncyclopedia"
  },
  {
    id: "tafsir",
    title: "Audio Tafsir for Kids",
    description: "Easy explanations of short surahs",
    icon: Headphones,
    color: "from-green-500 to-teal-500",
    emoji: "🎧",
    link: "AudioTafsir"
  },
  {
    id: "facts",
    title: "Did You Know?",
    description: "Fun and amazing Islamic facts",
    icon: Lightbulb,
    color: "from-amber-500 to-orange-500",
    emoji: "💡",
    link: "IslamicFacts"
  },
  {
    id: "worksheets",
    title: "Printable Worksheets",
    description: "Quran tracing, matching activities & more",
    icon: FileText,
    color: "from-purple-500 to-pink-500",
    emoji: "📄",
    link: "Worksheets"
  }
];

const quickLinks = [
  { title: "25 Prophets", icon: Users, count: "25 stories" },
  { title: "Islamic Months", icon: Calendar, count: "12 months" },
  { title: "99 Names of Allah", icon: Star, count: "Learn all" }
];

const asmaUlHusna = [
  { arabic: "ٱللَّٰهُ", transliteration: "Allah", meaning: "The Name of God" },
  { arabic: "ٱلرَّحْمَٰنُ", transliteration: "Ar-Rahman", meaning: "The Most Merciful" },
  { arabic: "ٱلرَّحِيمُ", transliteration: "Ar-Rahim", meaning: "The Most Compassionate" },
  { arabic: "ٱلْمَلِكُ", transliteration: "Al-Malik", meaning: "The King" },
  { arabic: "ٱلْقُدُّوسُ", transliteration: "Al-Quddus", meaning: "The Most Holy" },
  { arabic: "ٱلسَّلَامُ", transliteration: "As-Salam", meaning: "The Source of Peace" },
  { arabic: "ٱلْمُؤْمِنُ", transliteration: "Al-Mu'min", meaning: "The Guardian of Faith" },
  { arabic: "ٱلْمُهَيْمِنُ", transliteration: "Al-Muhaymin", meaning: "The Protector" },
  { arabic: "ٱلْعَزِيزُ", transliteration: "Al-'Aziz", meaning: "The Almighty" },
  { arabic: "ٱلْجَبَّارُ", transliteration: "Al-Jabbar", meaning: "The Compeller" },
  { arabic: "ٱلْمُتَكَبِّرُ", transliteration: "Al-Mutakabbir", meaning: "The Supreme" },
  { arabic: "ٱلْخَالِقُ", transliteration: "Al-Khaliq", meaning: "The Creator" },
  { arabic: "ٱلْبَارِئُ", transliteration: "Al-Bari'", meaning: "The Evolver" },
  { arabic: "ٱلْمُصَوِّرُ", transliteration: "Al-Musawwir", meaning: "The Fashioner" },
  { arabic: "ٱلْغَفَّارُ", transliteration: "Al-Ghaffar", meaning: "The Constant Forgiver" },
  { arabic: "ٱلْقَهَّارُ", transliteration: "Al-Qahhar", meaning: "The All-Subduer" },
  { arabic: "ٱلْوَهَّابُ", transliteration: "Al-Wahhab", meaning: "The Supreme Bestower" },
  { arabic: "ٱلرَّزَّاقُ", transliteration: "Ar-Razzaq", meaning: "The Provider" },
  { arabic: "ٱلْفَتَّاحُ", transliteration: "Al-Fattah", meaning: "The Supreme Opener" },
  { arabic: "ٱلْعَلِيمُ", transliteration: "Al-'Alim", meaning: "The All-Knowing" },
  { arabic: "ٱلْقَابِضُ", transliteration: "Al-Qabid", meaning: "The Withholder" },
  { arabic: "ٱلْبَاسِطُ", transliteration: "Al-Basit", meaning: "The Extender" },
  { arabic: "ٱلْخَافِضُ", transliteration: "Al-Khafid", meaning: "The Reducer" },
  { arabic: "ٱلرَّافِعُ", transliteration: "Ar-Rafi'", meaning: "The Exalter" },
  { arabic: "ٱلْمُعِزُّ", transliteration: "Al-Mu'izz", meaning: "The Honourer" },
  { arabic: "ٱلْمُذِلُّ", transliteration: "Al-Mudhill", meaning: "The Dishonourer" },
  { arabic: "ٱلسَّمِيعُ", transliteration: "As-Sami'", meaning: "The All-Hearing" },
  { arabic: "ٱلْبَصِيرُ", transliteration: "Al-Basir", meaning: "The All-Seeing" },
  { arabic: "ٱلْحَكَمُ", transliteration: "Al-Hakam", meaning: "The Impartial Judge" },
  { arabic: "ٱلْعَدْلُ", transliteration: "Al-'Adl", meaning: "The Utterly Just" },
  { arabic: "ٱللَّطِيفُ", transliteration: "Al-Latif", meaning: "The Subtle One" },
  { arabic: "ٱلْخَبِيرُ", transliteration: "Al-Khabir", meaning: "The All-Aware" },
  { arabic: "ٱلْحَلِيمُ", transliteration: "Al-Halim", meaning: "The Most Forbearing" },
  { arabic: "ٱلْعَظِيمُ", transliteration: "Al-'Azim", meaning: "The Magnificent" },
  { arabic: "ٱلْغَفُورُ", transliteration: "Al-Ghafur", meaning: "The Great Forgiver" },
  { arabic: "ٱلشَّكُورُ", transliteration: "Ash-Shakur", meaning: "The Most Appreciative" },
  { arabic: "ٱلْعَلِيُّ", transliteration: "Al-'Aliyy", meaning: "The Most High" },
  { arabic: "ٱلْكَبِيرُ", transliteration: "Al-Kabir", meaning: "The Most Great" },
  { arabic: "ٱلْحَفِيظُ", transliteration: "Al-Hafiz", meaning: "The Preserver" },
  { arabic: "ٱلْمُقِيتُ", transliteration: "Al-Muqit", meaning: "The Sustainer" },
  { arabic: "ٱلْحَسِيبُ", transliteration: "Al-Hasib", meaning: "The Reckoner" },
  { arabic: "ٱلْجَلِيلُ", transliteration: "Al-Jalil", meaning: "The Majestic" },
  { arabic: "ٱلْكَرِيمُ", transliteration: "Al-Karim", meaning: "The Most Generous" },
  { arabic: "ٱلرَّقِيبُ", transliteration: "Ar-Raqib", meaning: "The Watchful One" },
  { arabic: "ٱلْمُجِيبُ", transliteration: "Al-Mujib", meaning: "The Responder" },
  { arabic: "ٱلْوَاسِعُ", transliteration: "Al-Wasi'", meaning: "The All-Encompassing" },
  { arabic: "ٱلْحَكِيمُ", transliteration: "Al-Hakim", meaning: "The All-Wise" },
  { arabic: "ٱلْوَدُودُ", transliteration: "Al-Wadud", meaning: "The Most Loving" },
  { arabic: "ٱلْمَجِيدُ", transliteration: "Al-Majid", meaning: "The Glorious" },
  { arabic: "ٱلْبَاعِثُ", transliteration: "Al-Ba'ith", meaning: "The Infuser of New Life" },
  { arabic: "ٱلشَّهِيدُ", transliteration: "Ash-Shahid", meaning: "The All Observing Witness" },
  { arabic: "ٱلْحَقُّ", transliteration: "Al-Haqq", meaning: "The Absolute Truth" },
  { arabic: "ٱلْوَكِيلُ", transliteration: "Al-Wakil", meaning: "The Supreme Trustee" },
  { arabic: "ٱلْقَوِيُّ", transliteration: "Al-Qawiyy", meaning: "The All-Strong" },
  { arabic: "ٱلْمَتِينُ", transliteration: "Al-Matin", meaning: "The Firm One" },
  { arabic: "ٱلْوَلِيُّ", transliteration: "Al-Waliyy", meaning: "The Sole Planner" },
  { arabic: "ٱلْحَمِيدُ", transliteration: "Al-Hamid", meaning: "The All Praiseworthy" },
  { arabic: "ٱلْمُحْصِي", transliteration: "Al-Muhsi", meaning: "The All-Enumerating" },
  { arabic: "ٱلْمُبْدِئُ", transliteration: "Al-Mubdi'", meaning: "The Originator" },
  { arabic: "ٱلْمُعِيدُ", transliteration: "Al-Mu'id", meaning: "The Restorer" },
  { arabic: "ٱلْمُحْيِي", transliteration: "Al-Muhyi", meaning: "The Giver of Life" },
  { arabic: "ٱلْمُمِيتُ", transliteration: "Al-Mumit", meaning: "The Creator of Death" },
  { arabic: "ٱلْحَيُّ", transliteration: "Al-Hayy", meaning: "The Ever-Living" },
  { arabic: "ٱلْقَيُّومُ", transliteration: "Al-Qayyum", meaning: "The Self-Subsisting" },
  { arabic: "ٱلْوَاجِدُ", transliteration: "Al-Wajid", meaning: "The Finder" },
  { arabic: "ٱلْمَاجِدُ", transliteration: "Al-Majid", meaning: "The Glorious and Excellent" },
  { arabic: "ٱلْوَاحِدُ", transliteration: "Al-Wahid", meaning: "The One" },
  { arabic: "ٱلْأَحَدُ", transliteration: "Al-Ahad", meaning: "The Indivisible, Absolute One" },
  { arabic: "ٱلصَّمَدُ", transliteration: "As-Samad", meaning: "The Self-Sufficient" },
  { arabic: "ٱلْقَادِرُ", transliteration: "Al-Qadir", meaning: "The Omnipotent One" },
  { arabic: "ٱلْمُقْتَدِرُ", transliteration: "Al-Muqtadir", meaning: "The Powerful" },
  { arabic: "ٱلْمُقَدِّمُ", transliteration: "Al-Muqaddim", meaning: "The Expediter" },
  { arabic: "ٱلْمُؤَخِّرُ", transliteration: "Al-Mu'akhkhir", meaning: "The Delayer" },
  { arabic: "ٱلأَوَّلُ", transliteration: "Al-Awwal", meaning: "The First" },
  { arabic: "ٱلْآخِرُ", transliteration: "Al-Akhir", meaning: "The Last" },
  { arabic: "ٱلظَّاهِرُ", transliteration: "Az-Zahir", meaning: "The Manifest" },
  { arabic: "ٱلْبَاطِنُ", transliteration: "Al-Batin", meaning: "The Hidden One" },
  { arabic: "ٱلْوَالِي", transliteration: "Al-Wali", meaning: "The Sole Governor" },
  { arabic: "ٱلْمُتَعَالِي", transliteration: "Al-Muta'ali", meaning: "The Self Exalted" },
  { arabic: "ٱلْبَرُّ", transliteration: "Al-Barr", meaning: "The Most Kind" },
  { arabic: "ٱلتَّوَّابُ", transliteration: "At-Tawwab", meaning: "The Supreme Accepter of Repentance" },
  { arabic: "ٱلْمُنْتَقِمُ", transliteration: "Al-Muntaqim", meaning: "The Avenger" },
  { arabic: "ٱلْعَفُوُّ", transliteration: "Al-'Afuw", meaning: "The Supreme Pardoner" },
  { arabic: "ٱلرَّءُوفُ", transliteration: "Ar-Ra'uf", meaning: "The Most Kind" },
  { arabic: "مَالِكُ ٱلْمُلْكِ", transliteration: "Malik-ul-Mulk", meaning: "Master of the Kingdom" },
  { arabic: "ذُو ٱلْجَلَالِ وَٱلْإِكْرَامِ", transliteration: "Dhul-Jalali Wal-Ikram", meaning: "Lord of Glory and Honour" },
  { arabic: "ٱلْمُقْسِطُ", transliteration: "Al-Muqsit", meaning: "The Just One" },
  { arabic: "ٱلْجَامِعُ", transliteration: "Al-Jami'", meaning: "The Gatherer" },
  { arabic: "ٱلْغَنِيُّ", transliteration: "Al-Ghaniyy", meaning: "The Self-Sufficient" },
  { arabic: "ٱلْمُغْنِي", transliteration: "Al-Mughni", meaning: "The Enricher" },
  { arabic: "ٱلْمَانِعُ", transliteration: "Al-Mani'", meaning: "The Withholder" },
  { arabic: "ٱلضَّارُ", transliteration: "Ad-Darr", meaning: "The Distresser" },
  { arabic: "ٱلنَّافِعُ", transliteration: "An-Nafi'", meaning: "The Propitious" },
  { arabic: "ٱلنُّورُ", transliteration: "An-Nur", meaning: "The Light" },
  { arabic: "ٱلْهَادِي", transliteration: "Al-Hadi", meaning: "The Guide" },
  { arabic: "ٱلْبَدِيعُ", transliteration: "Al-Badi'", meaning: "The Originator" },
  { arabic: "ٱلْبَاقِي", transliteration: "Al-Baqi", meaning: "The Everlasting" },
  { arabic: "ٱلْوَارِثُ", transliteration: "Al-Warith", meaning: "The Inheritor" },
  { arabic: "ٱلرَّشِيدُ", transliteration: "Ar-Rashid", meaning: "The Infallible Teacher" },
  { arabic: "ٱلصَّبُورُ", transliteration: "As-Sabur", meaning: "The Most Patient" },
];

export default function LearningLibrary() {
  const [query, setQuery] = React.useState("");
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const speakRef = React.useRef(null);
  const location = useLocation();
  const namesRef = React.useRef(null);
  const [voices, setVoices] = React.useState([]);
  const [arabicVoices, setArabicVoices] = React.useState([]);
  const [selectedArabicVoice, setSelectedArabicVoice] = React.useState("");
  const [rate, setRate] = React.useState(0.85);
  const [pitch, setPitch] = React.useState(1.05);
  const [useProAudio, setUseProAudio] = React.useState(true);
  const [audio, setAudio] = React.useState(null);
  const [currentlyPlayingIdx, setCurrentlyPlayingIdx] = React.useState(null);
  const [asmaAudioBase, setAsmaAudioBase] = React.useState("");
  const [testStatus, setTestStatus] = React.useState("");
  const [lastError, setLastError] = React.useState("");
  const [asmaCombinedUrl, setAsmaCombinedUrl] = React.useState("");
  const [useCloudTts, setUseCloudTts] = React.useState(false);
  const [cloudVoice, setCloudVoice] = React.useState('ar-SA-HamedNeural');

  const normalizeBase = (b) => {
    if (!b) return "";
    return b.endsWith("/") ? b : (b + "/");
  };
  React.useEffect(() => {
    speakRef.current = window?.speechSynthesis || null;
    const loadVoices = () => {
      const list = speakRef.current?.getVoices?.() || [];
      setVoices(list);
      const ars = list.filter(v => String(v.lang || "").toLowerCase().startsWith("ar"));
      setArabicVoices(ars);
      if (!selectedArabicVoice && ars.length > 0) setSelectedArabicVoice(ars[0].name || "");
    };
    loadVoices();
    try { window?.speechSynthesis?.addEventListener?.("voiceschanged", loadVoices); } catch {}
    return () => {
      speakRef.current?.cancel?.();
      try { window?.speechSynthesis?.removeEventListener?.("voiceschanged", loadVoices); } catch {}
    };
  }, []);

  React.useEffect(() => {
    try {
      const base = import.meta.env?.VITE_ASMA_AUDIO_BASE || "";
      if (base) {
        setAsmaAudioBase(normalizeBase(base));
      } else {
        const raw = localStorage.getItem("siteSettings");
        if (raw) {
          const s = JSON.parse(raw);
          if (s?.asmaAudioBase) setAsmaAudioBase(normalizeBase(String(s.asmaAudioBase)));
        }
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      const combined = import.meta.env?.VITE_ASMA_COMBINED_URL || "";
      if (combined) {
        setAsmaCombinedUrl(combined);
      } else {
        const raw = localStorage.getItem("siteSettings");
        if (raw) {
          const s = JSON.parse(raw);
          if (s?.asmaCombinedUrl) setAsmaCombinedUrl(String(s.asmaCombinedUrl));
        }
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const section = params.get("section");
    if (section === "names" && namesRef.current) {
      namesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.search]);

  const stopSpeaking = () => { try { speakRef.current?.cancel?.(); setIsSpeaking(false); } catch {} };
  const speakText = (text, lang = "ar", voiceName = "") => {
    try {
      if (!speakRef.current) return;
      stopSpeaking();
      const utter = new SpeechSynthesisUtterance(text);
      const list = speakRef.current.getVoices?.() || [];
      let chosen = null;
      if (voiceName) chosen = list.find(v => v.name === voiceName) || null;
      if (!chosen) chosen = list.find(v => String(v.lang || "").toLowerCase().startsWith(lang)) || null;
      if (chosen) utter.voice = chosen;
      utter.lang = chosen?.lang || (lang === "ar" ? "ar-SA" : lang);
      utter.rate = rate;
      utter.pitch = pitch;
      utter.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      speakRef.current.speak(utter);
    } catch {}
  };

  const stopProAudio = () => {
    try {
      audio?.pause?.();
      setCurrentlyPlayingIdx(null);
    } catch {}
  };

  const buildNameAudioUrl = (idx) => {
    if (!asmaAudioBase) return "";
    // Try common patterns: 1.mp3, 01.mp3, 001.mp3
    const p2 = String(idx + 1).padStart(2, '0');
    const p3 = String(idx + 1).padStart(3, '0');
    return `${asmaAudioBase}${idx + 1}.mp3`; // primary
  };

  const playProAudio = (idx, fallbackText) => {
    const url = buildNameAudioUrl(idx);
    if (!url) {
      speakText(fallbackText, 'ar', selectedArabicVoice);
      return;
    }
    try {
      stopSpeaking();
      stopProAudio();
      const a = new Audio(url);
      a.crossOrigin = 'anonymous';
      a.onended = () => setCurrentlyPlayingIdx(null);
      a.onerror = () => {
        setCurrentlyPlayingIdx(null);
        setLastError(`Audio failed: ${url}`);
        speakText(fallbackText, 'ar', selectedArabicVoice);
      };
      setAudio(a);
      setCurrentlyPlayingIdx(idx);
      a.play().catch(() => {
        setCurrentlyPlayingIdx(null);
        setLastError(`Audio play error: ${url}`);
        speakText(fallbackText, 'ar', selectedArabicVoice);
      });
    } catch {
      setLastError(`Audio exception: ${url}`);
      speakText(fallbackText, 'ar', selectedArabicVoice);
    }
  };

  // Simple 2s segments default; replace with precise timestamps when available
  const defaultTimestamps = React.useMemo(() => (
    Array.from({ length: 99 }, (_, i) => ({ start: i * 2, end: (i + 1) * 2 }))
  ), []);

  const playCombinedSegment = (idx, fallbackText) => {
    if (!asmaCombinedUrl) {
      speakText(fallbackText, 'ar', selectedArabicVoice);
      return;
    }
    try {
      const t = defaultTimestamps[idx] || { start: 0, end: 2 };
      stopSpeaking();
      stopProAudio();
      const a = audio || new Audio();
      a.crossOrigin = 'anonymous';
      if (a.src !== asmaCombinedUrl) {
        a.src = asmaCombinedUrl;
        a.load();
      }
      const onTimeUpdate = () => {
        if (a.currentTime >= t.end) {
          a.pause();
          a.removeEventListener('timeupdate', onTimeUpdate);
          setCurrentlyPlayingIdx(null);
        }
      };
      a.addEventListener('timeupdate', onTimeUpdate);
      a.onended = () => setCurrentlyPlayingIdx(null);
      a.onerror = () => {
        setCurrentlyPlayingIdx(null);
        setLastError(`Combined audio failed: ${asmaCombinedUrl}`);
        speakText(fallbackText, 'ar', selectedArabicVoice);
      };
      setAudio(a);
      a.currentTime = t.start;
      setCurrentlyPlayingIdx(idx);
      a.play().catch(() => {
        setCurrentlyPlayingIdx(null);
        setLastError(`Combined play error: ${asmaCombinedUrl}`);
        speakText(fallbackText, 'ar', selectedArabicVoice);
      });
    } catch {
      setLastError(`Combined exception: ${asmaCombinedUrl}`);
      speakText(fallbackText, 'ar', selectedArabicVoice);
    }
  };

  const generateCloudTts = async (idx, text) => {
    try {
      const endpoint = '/api/asmaTts'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idx, arabic: text, voice: cloudVoice })
      })
      if (!res.ok) {
        setLastError('TTS generation failed')
        return
      }
      const data = await res.json()
      const url = String(data?.url || '')
      if (!url) return
      stopSpeaking()
      stopProAudio()
      const a = new Audio(url)
      a.crossOrigin = 'anonymous'
      a.onended = () => setCurrentlyPlayingIdx(null)
      a.onerror = () => { setCurrentlyPlayingIdx(null); setLastError('Cloud audio failed') }
      setAudio(a)
      setCurrentlyPlayingIdx(idx)
      a.play().catch(() => { setCurrentlyPlayingIdx(null); setLastError('Cloud play error') })
    } catch {
      setLastError('Cloud exception')
    }
  }

  const testAudio = async () => {
    setTestStatus("Testing...");
    setLastError("");
    const url = buildNameAudioUrl(0);
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        setTestStatus("OK");
      } else {
        setTestStatus(`Fail (${res.status})`);
        setLastError(`Fetch failed: ${url}`);
      }
    } catch (e) {
      setTestStatus("Network error");
      setLastError(`Network error: ${url}`);
    }
  };

  const filteredNames = asmaUlHusna.filter(n => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      n.arabic.replace(/\s/g, '').toLowerCase().includes(q) ||
      n.transliteration.toLowerCase().includes(q) ||
      n.meaning.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Learning Library
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore Islamic knowledge through engaging resources and materials
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-blue-500 to-purple-500 text-white hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Icon className="w-12 h-12 mx-auto mb-3" />
                      <h3 className="text-xl font-bold mb-1">{link.title}</h3>
                      <p className="text-sm text-blue-100">{link.count}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {libraryResources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <Link to={createPageUrl(resource.link)}>
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group overflow-hidden border-2 hover:border-green-300">
                    <CardHeader className={`bg-gradient-to-br ${resource.color} text-white pb-6`}>
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="text-6xl"
                        >
                          {resource.emoji}
                        </motion.div>
                        <div>
                          <CardTitle className="text-2xl mb-2">{resource.title}</CardTitle>
                          <p className="text-sm text-white/90">{resource.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 border-2 border-gray-200 group-hover:border-green-500 transition-all">
                        <Icon className="w-5 h-5 mr-2" />
                        Explore Now
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Educational Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-4 border-green-400 shadow-2xl bg-gradient-to-r from-green-50 to-teal-50">
            <CardContent className="p-8 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                "Seek knowledge from the cradle to the grave"
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                - Prophet Muhammad ﷺ
              </p>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our learning library is designed to make Islamic education easy, fun, and engaging for young learners.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 99 Names of Allah */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <Card ref={namesRef} className="border-2 border-purple-300">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <CardTitle className="text-2xl">99 Names of Allah (Asma’ul Husna)</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-4">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search names or meanings"
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2 items-center"></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredNames.map((n, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-right text-xl font-bold mb-1" style={{ direction: 'rtl', fontFamily: 'serif' }}>{n.arabic}</div>
                    <div className="text-sm text-gray-700 italic">{n.transliteration}</div>
                    <div className="text-sm text-gray-600">{n.meaning}</div>
                    <div className="mt-2"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
