import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { Gamepad2 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black border-[16px] border-neon-pink text-white flex flex-col items-center justify-center p-4 lg:p-8 static-noise">
      <div className="scanlines"></div>
      
      {/* Background synthwave grid effect but jarred */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <div className="absolute inset-0 saturate-200 contrast-200" style={{backgroundImage: "repeating-linear-gradient(45deg, #FF00FF22 0, #FF00FF22 2px, transparent 2px, transparent 10px)"}}></div>
      </div>

      <div className="z-10 w-full max-w-7xl mx-auto flex flex-col xl:flex-row items-center xl:items-end justify-center gap-8 lg:gap-14 mt-4 xl:-mt-12 relative">
        
        {/* Main Game Container */}
        <div className="w-full flex justify-center xl:flex-1 shrink-0">
          <SnakeGame />
        </div>

        {/* Music Player Side / Bottom */}
        <div className="w-full lg:w-auto flex flex-col gap-8 xl:pb-12 items-center xl:items-start shrink-0 relative">
          <div className="hidden xl:flex items-center gap-4 text-neon-cyan mb-12 bg-black border-4 border-neon-cyan p-6 rotate-[-2deg] shadow-[8px_8px_0_var(--color-neon-pink)]">
             <div className="p-3 bg-neon-cyan/20 border-2 border-neon-cyan">
                <Gamepad2 size={40} className="text-neon-cyan animate-pulse" />
             </div>
             <h1 className="text-6xl font-mono tracking-widest leading-none glitch-text uppercase" data-text="SYS//CRITICAL">
               SYS//CRITICAL
             </h1>
          </div>
          
          <MusicPlayer />
          
          <div className="text-2xl font-mono text-neon-pink max-w-xs text-center xl:text-left mt-4 border-l-4 border-neon-cyan pl-4 bg-black/80 py-2 rotate-[1deg]">
            <p className="uppercase">WARNING: SYNCHRONIZATION IMMINENT.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
