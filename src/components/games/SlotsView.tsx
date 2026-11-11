/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../audio/soundEffects';

interface SlotsViewProps {
  chips: number;
  onUpdateChips: (newChips: number, wonAmount?: number) => void;
  onStandUp: () => void;
  onTriggerSceneSlots: (durationMs: number, onComplete: () => void) => void;
}

interface SlotItem {
  id: string;
  name: string;
  symbol: string;
  multiplier: number;
  color: string;
}

const SYMBOLS: SlotItem[] = [
  { id: '777', name: 'Lucky 777', symbol: '777', multiplier: 200, color: 'text-amber-400' },
  { id: 'diamond', name: 'Blue Diamond', symbol: '💎', multiplier: 75, color: 'text-cyan-400' },
  { id: 'bullion', name: 'Gold Bullion', symbol: '🪙', multiplier: 40, color: 'text-yellow-400' },
  { id: 'palm', name: 'California Palm', symbol: '🌴', multiplier: 25, color: 'text-emerald-400' },
  { id: 'spade', name: 'Ace of Spades', symbol: '♠', multiplier: 15, color: 'text-purple-400' },
  { id: 'chip', name: 'High-Roller Chip', symbol: '🎰', multiplier: 10, color: 'text-rose-400' },
  { id: 'cherry', name: 'Neon Cherry', symbol: '🍒', multiplier: 5, color: 'text-red-500' },
];

const BET_OPTIONS = [500, 1000, 2500, 5000, 10000, 25000];

export const SlotsView: React.FC<SlotsViewProps> = ({
  chips,
  onUpdateChips,
  onStandUp,
  onTriggerSceneSlots,
}) => {
  const [bet, setBet] = useState(1000);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<SlotItem[][]>([
    [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]],
    [SYMBOLS[1], SYMBOLS[0], SYMBOLS[3]],
    [SYMBOLS[2], SYMBOLS[2], SYMBOLS[0]],
    [SYMBOLS[3], SYMBOLS[4], SYMBOLS[1]],
    [SYMBOLS[0], SYMBOLS[5], SYMBOLS[2]],
  ]);
  const [winMessage, setWinMessage] = useState<string>('');
  const [winningLines, setWinningLines] = useState<number[]>([]);

  const getRandomSymbol = (): SlotItem => {
    // Weighted probabilities
    const rand = Math.random() * 100;
    if (rand < 4) return SYMBOLS[0]; // 777
    if (rand < 12) return SYMBOLS[1]; // Diamond
    if (rand < 25) return SYMBOLS[2]; // Bullion
    if (rand < 42) return SYMBOLS[3]; // Palm
    if (rand < 62) return SYMBOLS[4]; // Spade
    if (rand < 82) return SYMBOLS[5]; // Chip
    return SYMBOLS[6]; // Cherry
  };

  const handleSpin = () => {
    if (isSpinning || chips < bet) return;

    onUpdateChips(chips - bet);
    setIsSpinning(true);
    setWinMessage('');
    setWinningLines([]);
    sounds.playChip();

    // Trigger physical 3D cabinet reel spinning in Three.js
    const duration = 2400;
    onTriggerSceneSlots(duration, () => {});

    // Reel mechanical tick interval
    let stopCount = 0;
    const interval = setInterval(() => {
      sounds.playReelStop();
      stopCount++;
      if (stopCount >= 5) clearInterval(interval);
    }, 450);

    // Stop reels after duration
    setTimeout(() => {
      const newReels: SlotItem[][] = [];
      for (let c = 0; c < 5; c++) {
        newReels.push([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
      }
      setReels(newReels);
      setIsSpinning(false);

      // Check 3 horizontal lines (Top row 0, Center row 1, Bottom row 2)
      let totalWon = 0;
      const matchedRows: number[] = [];

      for (let r = 0; r < 3; r++) {
        const line = [newReels[0][r], newReels[1][r], newReels[2][r], newReels[3][r], newReels[4][r]];
        const firstId = line[0].id;
        let matchCount = 1;
        for (let c = 1; c < 5; c++) {
          if (line[c].id === firstId) {
            matchCount++;
          } else {
            break;
          }
        }

        if (matchCount >= 3) {
          matchedRows.push(r);
          const mult = line[0].multiplier * (matchCount === 5 ? 1.0 : matchCount === 4 ? 0.4 : 0.15);
          totalWon += Math.round(bet * mult);
        }
      }

      setWinningLines(matchedRows);

      if (totalWon > 0) {
        setWinMessage(`JACKPOT! WON $${totalWon.toLocaleString()}`);
        onUpdateChips(chips - bet + totalWon, totalWon - bet);
        sounds.playWin(totalWon / bet);
        if (totalWon >= bet * 5) {
          confetti({ particleCount: 80, spread: 80 });
        }
      } else {
        setWinMessage('NO WIN - SPIN AGAIN');
        sounds.playBust();
      }
    }, duration);
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Bar with Stand Up Button */}
      <div className="flex justify-between items-center pointer-events-auto">
        <div className="bg-black/85 border border-amber-500/40 px-4 py-2 rounded-xl text-amber-400 font-mono text-xs shadow-lg">
          <div className="font-bold text-white tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            777 CALIFORNIA GOLD · 5-REEL SLOTS
          </div>
          <div className="text-[11px] text-gray-300">Match 3+ symbols across 3 high-roller paylines</div>
        </div>

        <button
          onClick={onStandUp}
          disabled={isSpinning}
          className="bg-gray-900/90 hover:bg-gray-800 disabled:opacity-40 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-xs font-mono font-bold border border-gray-700 cursor-pointer shadow-lg transition-all"
        >
          STAND UP (ESC)
        </button>
      </div>

      {/* Center 5-Reel Glass Matrix */}
      <div className="flex flex-col items-center justify-center my-auto w-full max-w-2xl mx-auto">
        {/* Win Alert */}
        {winMessage && (
          <div className="mb-4 bg-black/90 border-2 border-amber-400 px-6 py-2 rounded-xl text-center shadow-[0_0_30px_rgba(245,158,11,0.6)]">
            <span className="text-xl font-black text-amber-300 font-mono tracking-wider">
              {winMessage}
            </span>
          </div>
        )}

        {/* 5 Reels Frame */}
        <div className="bg-gradient-to-b from-neutral-900 to-black border-4 border-amber-500/60 p-4 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] w-full">
          <div className="grid grid-cols-5 gap-2 sm:gap-3 bg-neutral-950 p-3 rounded-2xl border border-amber-500/20">
            {reels.map((col, colIdx) => (
              <div
                key={colIdx}
                className="flex flex-col gap-2 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 p-2 rounded-xl border border-gray-800"
              >
                {col.map((item, rowIdx) => {
                  const isWinningRow = winningLines.includes(rowIdx);
                  return (
                    <div
                      key={rowIdx}
                      className={`h-16 sm:h-20 rounded-lg flex flex-col items-center justify-center border transition-all ${
                        isWinningRow
                          ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_#f59e0b]'
                          : 'bg-black/60 border-gray-800/80'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl filter drop-shadow">
                        {item.symbol}
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${item.color} truncate max-w-full px-1`}>
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar (Solid surface - zero backdrop-filter) */}
      <div className="pointer-events-auto max-w-2xl mx-auto w-full">
        <div className="bg-gray-950/95 border border-amber-500/30 p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
          {/* Bet Selector */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-gray-400">BET LEVEL:</span>
            <div className="flex gap-2">
              {BET_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    if (!isSpinning) {
                      setBet(opt);
                      sounds.playChip();
                    }
                  }}
                  disabled={isSpinning}
                  className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs border cursor-pointer transition-all ${
                    bet === opt
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : 'border-gray-700 bg-gray-900 text-gray-400 hover:text-white'
                  }`}
                >
                  ${opt >= 1000 ? `${opt / 1000}k` : opt}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-800">
            <div className="font-mono">
              <span className="text-[10px] text-gray-400 uppercase block">Total Spin Wager</span>
              <span className="text-xl font-black text-amber-400 tabular-nums">
                ${bet.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleSpin}
              disabled={isSpinning || chips < bet}
              className="px-10 py-3 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white font-mono font-black text-base uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(244,63,94,0.6)] hover:shadow-[0_0_35px_rgba(244,63,94,0.9)] hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer transition-all border border-amber-300/40"
            >
              {isSpinning ? 'SPINNING...' : 'PULL LEVER'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
