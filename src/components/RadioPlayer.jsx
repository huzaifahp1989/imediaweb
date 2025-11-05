import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, VolumeX, Play, Pause, Radio, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMinimized, setIsMinimized] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Error playing radio:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {!isMinimized ? (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <Card className="w-[350px] sm:w-[450px] bg-gradient-to-r from-purple-600 to-blue-600 shadow-2xl border-2 border-white/20">
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3 sm:gap-4 mb-3">
                  {/* Radio Icon & Title */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                      <Radio className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-white">
                      <p className="font-bold text-base sm:text-lg">Islamic Radio 🎧</p>
                      <p className="text-xs sm:text-sm text-white/80">Live Streaming</p>
                    </div>
                  </div>

                  {/* Minimize Button */}
                  <Button
                    onClick={() => setIsMinimized(true)}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 p-2 h-9 w-9"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </Button>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-3">
                  {/* Play/Pause Button */}
                  <Button
                    onClick={togglePlay}
                    className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 rounded-full w-14 h-14 sm:w-16 sm:h-16 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 sm:w-7 sm:h-7" />
                    ) : (
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-1" />
                    )}
                  </Button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-3 bg-white/20 px-4 py-2.5 rounded-full backdrop-blur-sm flex-1">
                    <Button
                      onClick={toggleMute}
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 p-1 h-8 w-8"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>

                {/* Hidden Audio Element */}
                <audio
                  ref={audioRef}
                  src="https://a4.asurahosting.com:7820/radio.mp3"
                  preload="none"
                />
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Button
              onClick={() => setIsMinimized(false)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full w-16 h-16 p-0 shadow-2xl border-2 border-white/20"
            >
              <div className="flex flex-col items-center">
                <Radio className="w-6 h-6 mb-1" />
                <ChevronUp className="w-4 h-4" />
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}