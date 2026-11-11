/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between p-8 bg-black/60 pointer-events-auto select-none">
      {/* Top Tagline */}
      <div className="flex justify-between items-center text-xs tracking-widest text-amber-300 font-mono">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          COMMERCE, CALIFORNIA · CARDROOM CAPITAL OF THE WORLD
        </span>
        <span className="bg-amber-500/20 text-amber-200 border border-amber-500/40 px-3 py-1 rounded text-[11px] font-bold">
          100% PLAY MONEY · NO REAL RISK
        </span>
      </div>

      {/* Hero Centerpiece Lockup with Bespoke SVG */}
      <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto my-auto space-y-6">
        {/* Custom SVG Logo Lockup */}
        <div className="relative">
          <svg className="w-24 h-24 mx-auto mb-2 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" viewBox="0 0 100 100" fill="none">
            {/* Outer Gilded Shield */}
            <path
              d="M50 5 L88 22 V52 C88 74 50 94 50 94 C50 94 12 74 12 52 V22 Z"
              fill="#181308"
              stroke="#f59e0b"
              strokeWidth="3.5"
            />
            {/* Inner Neon Crest */}
            <path
              d="M50 14 L80 27 V50 C80 68 50 84 50 84 C50 84 20 68 20 50 V27 Z"
              fill="#2b1408"
              stroke="#ec4899"
              strokeWidth="2"
            />
            {/* Ace of Spades & Crown Inset */}
            <path
              d="M50 32 C45 42 34 46 34 54 C34 60 39 64 45 64 C48 64 50 62 50 62 C50 62 52 64 55 64 C61 64 66 60 66 54 C66 46 55 42 50 32 Z"
              fill="#ffd700"
            />
            <path d="M48 62 L45 72 H55 L52 62 Z" fill="#ffd700" />
            <circle cx="50" cy="28" r="3" fill="#06b6d4" />
          </svg>

          <div className="text-xs uppercase tracking-[0.4em] text-pink-400 font-extrabold drop-shadow-[0_0_12px_#ec4899]">
            VICE COAST & COMMERCE CASINO
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white uppercase italic drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            THE COMMERCE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400">CLUB</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 font-medium max-w-xl mx-auto mt-3 drop-shadow">
            High-Stakes 3D California Cardroom · Counter-Strike Weapon Vault · European Roulette · 777 Slots
          </p>
        </div>

        {/* Start Game CTA Button */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <button
            onClick={onStart}
            className="group relative px-10 py-4 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 rounded-lg text-white font-extrabold text-lg uppercase tracking-wider shadow-[0_0_30px_rgba(244,63,94,0.6)] hover:shadow-[0_0_45px_rgba(244,63,94,0.9)] hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300/40"
          >
            <span className="flex items-center gap-3">
              <span>ENTER CASINO FLOOR</span>
              <span className="inline-block transition-transform group-hover:translate-x-1 font-mono">→</span>
            </span>
          </button>
          <span className="text-xs text-gray-400 font-mono">
            Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-amber-300">Space</kbd> or{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-amber-300">Enter</kbd> to begin
          </span>
        </div>
      </div>

      {/* Flat Control Hints Footer */}
      <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-400 font-mono border-t border-white/10 pt-4">
        <span><strong className="text-amber-400">WASD / Arrows:</strong> Walk Floor</span>
        <span>·</span>
        <span><strong className="text-cyan-400">Mouse Drag:</strong> Pan View</span>
        <span>·</span>
        <span><strong className="text-pink-400">Click Table:</strong> Sit & Play</span>
        <span>·</span>
        <span><strong className="text-emerald-400">Esc:</strong> Stand Up</span>
        <span>·</span>
        <span className="text-amber-300 font-bold">$100,000 Starting Play Chips</span>
      </div>
    </div>
  );
};
