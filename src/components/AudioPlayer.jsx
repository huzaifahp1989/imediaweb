import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Download, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';

export default function AudioPlayer({ 
  title, 
  mp3Url, 
  coverImage, 
  onPlayComplete, 
  allowDownload = true, 
  autoplay = false 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

  useEffect(() => {
    if (!mp3Url) {
      setError("No audio URL provided");
      return;
    }

    const audio = new Audio(mp3Url);
    setAudioElement(audio);

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      if (onPlayComplete) onPlayComplete();
    });

    if (autoplay) {
      audio.play();
      setIsPlaying(true);
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [mp3Url, autoplay, onPlayComplete]);

  const togglePlay = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (mp3Url) {
      const link = document.createElement('a');
      link.href = mp3Url;
      link.download = title || 'audio';
      link.click();
    }
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <Card className="p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {coverImage && (
          <img src={coverImage} alt={title} className="w-full h-48 object-cover rounded-lg mb-4" />
        )}
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="flex gap-2 mb-4">
          <Button onClick={togglePlay} className="flex-1">
            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          {allowDownload && (
            <Button onClick={handleDownload} variant="outline">
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              setVolume(newVolume);
              if (audioElement) audioElement.volume = newVolume;
            }}
            className="flex-1"
          />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / 
          {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
        </div>
      </motion.div>
    </Card>
  );
}

AudioPlayer.propTypes = {
  title: PropTypes.string.isRequired,
  mp3Url: PropTypes.string,
  coverImage: PropTypes.string,
  onPlayComplete: PropTypes.func,
  allowDownload: PropTypes.bool,
  autoplay: PropTypes.bool
};