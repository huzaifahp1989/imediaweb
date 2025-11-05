import { useState, useContext, createContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PropTypes from 'prop-types';

const AudioContext = createContext();

const AudioProvider = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  const playAudio = (audio) => {
    if (audioElement) {
      audioElement.pause();
    }
    
    const newAudio = new Audio(audio.url);
    newAudio.play().catch(err => {
      console.error("Error playing audio:", err);
      toast.error("Could not play audio. Please try another.");
    });
    setAudioElement(newAudio);
    setCurrentAudio(audio);
    setIsPlaying(true);

    newAudio.onended = () => {
      setIsPlaying(false);
    };
  };

  const pauseAudio = () => {
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    if (audioElement) {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  return (
    <AudioContext.Provider value={{ currentAudio, isPlaying, playAudio, pauseAudio, resumeAudio }}>
      {children}
    </AudioContext.Provider>
  );
};

AudioProvider.propTypes = {
  children: PropTypes.node.isRequired
};

const multimediaData = {
  quran: [
    {
      id: "fatiha",
      title: "Surah Al-Fatiha",
      reciter: "Mishary Rashid Alafasy",
      url: "https://server8.mp3quran.net/afs/001.mp3",
      category: "Quran"
    },
    {
      id: "yaseen",
      title: "Surah Yaseen",
      reciter: "Mishary Rashid Alafasy",
      url: "https://server8.mp3quran.net/afs/036.mp3",
      category: "Quran"
    },
    {
      id: "mulk",
      title: "Surah Al-Mulk",
      reciter: "Mishary Rashid Alafasy",
      url: "https://server8.mp3quran.net/afs/067.mp3",
      category: "Quran"
    },
    {
      id: "rahman",
      title: "Surah Ar-Rahman",
      reciter: "Mishary Rashid Alafasy",
      url: "https://server8.mp3quran.net/afs/055.mp3",
      category: "Quran"
    },
    {
      id: "kahf",
      title: "Surah Al-Kahf",
      reciter: "Mishary Rashid Alafasy",
      url: "https://server8.mp3quran.net/afs/018.mp3",
      category: "Quran"
    }
  ]
};

const AudioCard = ({ audio }) => {
  const { currentAudio, isPlaying, playAudio, pauseAudio, resumeAudio } = useContext(AudioContext);
  const isCurrentPlaying = currentAudio?.id === audio.id && isPlaying;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      <Card className="hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{audio.title}</h3>
              {audio.reciter && (
                <p className="text-sm text-gray-600">{audio.reciter}</p>
              )}
              {audio.artist && (
                <p className="text-sm text-gray-600">{audio.artist}</p>
              )}
              {audio.narrator && (
                <p className="text-sm text-gray-600">{audio.narrator}</p>
              )}
              {audio.speaker && (
                <p className="text-sm text-gray-600">{audio.speaker}</p>
              )}
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
              {audio.category}
            </Badge>
          </div>

          {audio.description && (
            <p className="text-sm text-gray-600 mb-4">{audio.description}</p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (isCurrentPlaying) {
                  pauseAudio();
                } else if (currentAudio?.id === audio.id) {
                  resumeAudio();
                } else {
                  playAudio(audio);
                }
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
            >
              {isCurrentPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {currentAudio?.id === audio.id ? "Resume" : "Play"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

AudioCard.propTypes = {
  audio: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    reciter: PropTypes.string,
    artist: PropTypes.string,
    narrator: PropTypes.string,
    speaker: PropTypes.string,
    category: PropTypes.string.isRequired,
    description: PropTypes.string
  }).isRequired
};

function Multimedia() {
  const [selectedCategory, setSelectedCategory] = useState("quran");

  const categories = [
    { id: "quran", name: "Quran Recitations", icon: "📖", description: "Listen to beautiful Quran recitations" }
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Islamic Multimedia
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Listen to beautiful Quran recitations
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              className={`${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-green-500 to-teal-500 text-white"
                  : ""
              }`}
              size="lg"
            >
              <span className="text-2xl mr-2">{cat.icon}</span>
              {cat.name}
            </Button>
          ))}
        </div>

        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {multimediaData[selectedCategory]?.map((audio) => (
            <AudioCard key={audio.id} audio={audio} />
          ))}
        </motion.div>
      </div>

      <GlobalAudioPlayer />
    </div>
  );
}

const GlobalAudioPlayer = () => {
  const { currentAudio, isPlaying, pauseAudio, resumeAudio } = useContext(AudioContext);

  if (!currentAudio) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 shadow-2xl z-50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Volume2 className="w-6 h-6" />
          <div>
            <p className="font-bold">{currentAudio.title}</p>
            {currentAudio.reciter && (
              <p className="text-sm opacity-90">{currentAudio.reciter}</p>
            )}
          </div>
        </div>
        <Button
          onClick={isPlaying ? pauseAudio : resumeAudio}
          variant="ghost"
          className="text-white hover:bg-white/20"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </Button>
      </div>
    </motion.div>
  );
};

export default function MultimediaPage() {
  return (
    <AudioProvider>
      <Multimedia />
    </AudioProvider>
  );
}

export { AudioContext };