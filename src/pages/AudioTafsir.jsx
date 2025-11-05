import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

const tafsirLessons = [
  {
    id: 1,
    surah: "Al-Fatiha",
    number: 1,
    verses: 7,
    duration: "8:30",
    mp3Url: "https://server8.mp3quran.net/afs/001.mp3",
    description: "The Opening - Learn the meaning of the most recited surah"
  },
  {
    id: 2,
    surah: "Al-Ikhlas",
    number: 112,
    verses: 4,
    duration: "2:15",
    mp3Url: "https://server8.mp3quran.net/afs/112.mp3",
    description: "Sincerity - Understanding Allah's oneness"
  },
  {
    id: 3,
    surah: "Al-Falaq",
    number: 113,
    verses: 5,
    duration: "1:50",
    mp3Url: "https://server8.mp3quran.net/afs/113.mp3",
    description: "The Daybreak - Seeking protection from evil"
  },
  {
    id: 4,
    surah: "An-Nas",
    number: 114,
    verses: 6,
    duration: "1:40",
    mp3Url: "https://server8.mp3quran.net/afs/114.mp3",
    description: "Mankind - Protection from whispers"
  },
  {
    id: 5,
    surah: "Al-Asr",
    number: 103,
    verses: 3,
    duration: "1:20",
    mp3Url: "https://server8.mp3quran.net/afs/103.mp3",
    description: "Time - The importance of faith and good deeds"
  },
  {
    id: 6,
    surah: "Al-Kawthar",
    number: 108,
    verses: 3,
    duration: "1:15",
    mp3Url: "https://server8.mp3quran.net/afs/108.mp3",
    description: "Abundance - Allah's gift to the Prophet ﷺ"
  }
];

export default function AudioTafsir() {
  const [playingId, setPlayingId] = useState(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRefs = useRef({});

  const handlePlayPause = (lessonId) => {
    const audio = audioRefs.current[lessonId];
    
    // Pause any currently playing audio
    Object.keys(audioRefs.current).forEach(id => {
      if (id !== lessonId.toString() && audioRefs.current[id]) {
        audioRefs.current[id].pause();
      }
    });

    if (playingId === lessonId) {
      audio.pause();
      setPlayingId(null);
    } else {
      if (!audio.src) {
        const lesson = tafsirLessons.find(l => l.id === lessonId);
        audio.src = lesson.mp3Url;
      }
      audio.volume = isMuted ? 0 : volume;
      audio.play();
      setPlayingId(lessonId);
    }

    audio.onended = () => {
      setPlayingId(null);
    };
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) audio.volume = newVolume;
    });
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) audio.volume = newMuted ? 0 : volume;
    });
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">🎧</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Audio Tafsir for Kids
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Listen to recitations of short surahs
          </p>
        </motion.div>

        {/* Volume Control */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 max-w-xs mx-auto"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <button onClick={toggleMute} className="text-blue-600 hover:text-blue-700">
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600 w-12 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tafsir Lessons */}
        <div className="grid gap-6">
          {tafsirLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold text-2xl">
                        {lesson.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        Surah {lesson.surah}
                      </h3>
                      <p className="text-gray-600 mb-2">{lesson.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>📖 {lesson.verses} verses</span>
                        <span>⏱️ {lesson.duration}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handlePlayPause(lesson.id)}
                      className={`${playingId === lesson.id ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {playingId === lesson.id ? (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Listen
                        </>
                      )}
                    </Button>
                  </div>
                  <audio
                    ref={(el) => (audioRefs.current[lesson.id] = el)}
                    preload="none"
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300">
            <CardContent className="p-8 text-center">
              <Headphones className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                More Tafsir Lessons Coming Soon!
              </h3>
              <p className="text-gray-700">
                We&apos;re working on adding more surahs with simple, kid-friendly explanations.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}