import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music } from 'lucide-react';
import { motion } from 'motion/react';

const TRACKS = [
  {
    id: 1,
    title: 'Neon Drive',
    artist: 'AI Synthwave',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 2,
    title: 'Cyberpunk Cityscapes',
    artist: 'Neural Vibes',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  },
  {
    id: 3,
    title: 'Digital Dreamscape',
    artist: 'Deep Groove Network',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3'
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => {
          console.error("Playback failed:", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrackIndex, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      if (dur) {
        setDuration(dur);
        setProgress((current / dur) * 100);
      }
    }
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
       const newTime = (Number(e.target.value) / 100) * audioRef.current.duration;
       audioRef.current.currentTime = newTime;
       setProgress(Number(e.target.value));
    }
  };

  const handleEnded = () => {
    nextTrack();
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="w-full sm:w-[320px] bg-black border-[4px] border-neon-pink p-6 flex flex-col font-mono text-neon-cyan shadow-[10px_-10px_0_var(--color-neon-cyan)] transform rotate-1 relative overflow-hidden z-20">
      {/* Fake scanlines inside the music player */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,255,255,0.1)_51%)] bg-[size:100%_4px] pointer-events-none z-0"></div>
      
      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`p-3 border-2 ${isPlaying ? 'border-neon-pink text-neon-pink bg-neon-pink/10 animate-pulse' : 'border-neon-cyan/50 text-neon-cyan/50 bg-black'} transition-all`}>
                <Music size={24} />
              </div>
              {/* Box around when playing */}
              {isPlaying && (
                <motion.div 
                  className="absolute inset-[-4px] border border-neon-cyan opacity-80"
                  animate={{ opacity: [0.1, 1, 0.1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              )}
            </div>
            <div>
              <div className="overflow-hidden w-36 relative h-8">
                <motion.h3 
                  className={`font-bold text-xl whitespace-nowrap absolute uppercase ${isPlaying ? 'text-neon-pink glitch-text tracking-widest' : 'text-neon-cyan/70'}`}
                  data-text={currentTrack.title}
                  animate={{ x: isPlaying && currentTrack.title.length > 12 ? [0, -100, 0] : 0 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                >
                  {currentTrack.title}
                </motion.h3>
              </div>
              <p className="text-sm text-neon-cyan tracking-widest uppercase mt-1 border-t border-neon-cyan/30 pt-1 -mt-1">{currentTrack.artist}</p>
            </div>
          </div>
          
          {/* EQ Visualizer Mock */}
          <div className="flex items-end h-8 gap-[4px] ml-2">
            {[1,2,3].map((i) => (
               <motion.div 
                 key={i}
                 className={`w-2 bg-neon-pink ${isPlaying ? '' : 'opacity-20 h-2'}`}
                 initial={{ height: "20%" }}
                 animate={{ height: isPlaying ? ["20%", "90%", "30%", "100%", "40%"] : "20%" }}
                 transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 0.15 + (i * 0.1),
                 }}
               />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="relative w-full h-[18px] bg-black border-2 border-neon-cyan cursor-pointer group flex items-center p-[2px]">
            <input 
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleProgressChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="h-full bg-neon-pink transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-neon-cyan mt-2 font-bold uppercase">
            <span>{formatTime((progress / 100) * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-2 relative">
          <button 
            onClick={prevTrack}
            className="p-3 text-neon-cyan hover:text-black hover:bg-neon-cyan border-2 border-transparent hover:border-neon-cyan transition-all"
          >
            <SkipBack size={24} fill="currentColor" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-16 h-16 flex items-center justify-center border-4 border-neon-cyan bg-black text-neon-pink hover:bg-neon-pink hover:text-black hover:border-neon-pink active:scale-95 transition-all shadow-[4px_4px_0_var(--color-neon-cyan)] hover:shadow-none"
          >
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1.5" />}
          </button>
          <button 
            onClick={nextTrack}
            className="p-3 text-neon-cyan hover:text-black hover:bg-neon-cyan border-2 border-transparent hover:border-neon-cyan transition-all"
          >
            <SkipForward size={24} fill="currentColor" />
          </button>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />
    </div>
  );
}
