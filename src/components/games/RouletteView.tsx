/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../audio/soundEffects';

interface RouletteViewProps {
  chips: number;
  onUpdateChips: (newChips: number, wonAmount?: number) => void;
  onStandUp: () => void;
  onTriggerWheelSpin: (winningNumber: number, onComplete: () => void) => void;
}

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
]);

const CHIP_DENOMS = [100, 500, 1000, 5000, 25000];

export const RouletteView: React.FC<RouletteViewProps> = ({
  chips,
  onUpdateChips,
  onStandUp,
  onTriggerWheelSpin,
}) => {
  const [selectedDenom, setSelectedDenom] = useState(1000);
  const [bets, setBets] = useState<{ [key: string]: number }>({});
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWinningNumber, setLastWinningNumber] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([17, 32, 0, 7, 23]);
  const [winMessage, setWinMessage] = useState<string>('');

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  const placeBet = (betKey: string) => {
    if (isSpinning) return;
    if (totalBet + selectedDenom > chips) return;
    sounds.playChip();
    setBets((prev) => ({
      ...prev,
      [betKey]: (prev[betKey] || 0) + selectedDenom,
    }));
  };

  const clearBets = () => {
    if (isSpinning) return;
    sounds.playChip();
    setBets({});
  };

  const handleSpin = () => {
    if (isSpinning || totalBet <= 0 || totalBet > chips) return;

    // Deduct total bet
    onUpdateChips(chips - totalBet);
    setIsSpinning(true);
    setWinMessage('');

    // Roll random European roulette number (0 - 36)
    const winningNum = Math.floor(Math.random() * 37);

    // Audio ball bouncing interval
    let bounceCount = 0;
    const bounceInterval = setInterval(() => {
      sounds.playBallBounce(1.0 - bounceCount * 0.05);
      bounceCount++;
      if (bounceCount > 8) clearInterval(bounceInterval);
    }, 280);

    // Trigger 3D wheel physical rotation in Three.js scene
    onTriggerWheelSpin(winningNum, () => {
      clearInterval(bounceInterval);
      setLastWinningNumber(winningNum);
      setHistory((prev) => [winningNum, ...prev.slice(0, 9)]);
      setIsSpinning(false);

      // Calculate payouts
      let totalWon = 0;
      const isRed = RED_NUMBERS.has(winningNum);
      const isBlack = winningNum !== 0 && !isRed;
      const isEven = winningNum !== 0 && winningNum % 2 === 0;
      const isOdd = winningNum !== 0 && winningNum % 2 !== 0;
      const isLow = winningNum >= 1 && winningNum <= 18;
      const isHigh = winningNum >= 19 && winningNum <= 36;

      // Straight up number
      if (bets[`num_${winningNum}`]) {
        totalWon += bets[`num_${winningNum}`] * 36;
      }
      // Red / Black
      if (isRed && bets['red']) totalWon += bets['red'] * 2;
      if (isBlack && bets['black']) totalWon += bets['black'] * 2;
      // Even / Odd
      if (isEven && bets['even']) totalWon += bets['even'] * 2;
      if (isOdd && bets['odd']) totalWon += bets['odd'] * 2;
      // High / Low
      if (isLow && bets['low']) totalWon += bets['low'] * 2;
      if (isHigh && bets['high']) totalWon += bets['high'] * 2;
      // Dozens
      if (winningNum >= 1 && winningNum <= 12 && bets['dozen_1']) totalWon += bets['dozen_1'] * 3;
      if (winningNum >= 13 && winningNum <= 24 && bets['dozen_2']) totalWon += bets['dozen_2'] * 3;
      if (winningNum >= 25 && winningNum <= 36 && bets['dozen_3']) totalWon += bets['dozen_3'] * 3;

      if (totalWon > 0) {
        setWinMessage(`WINNER! #${winningNum} PAID $${totalWon.toLocaleString()}`);
        onUpdateChips(chips - totalBet + totalWon, totalWon - totalBet);
        sounds.playWin(totalWon / totalBet);
        if (totalWon > totalBet * 3) {
          confetti({ particleCount: 70, spread: 60 });
        }
      } else {
        setWinMessage(`NO WIN ON #${winningNum}`);
        sounds.playBust();
      }
    });
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Bar with Recent Roll History */}
      <div className="flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-2 bg-black/85 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-lg">
          <span className="text-[11px] font-mono text-gray-400 font-bold">HISTORY:</span>
          <div className="flex items-center gap-1.5">
            {history.map((num, i) => {
              const isRed = RED_NUMBERS.has(num);
              const isZero = num === 0;
              return (
                <span
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow ${
                    isZero
                      ? 'bg-emerald-600 text-white'
                      : isRed
                      ? 'bg-red-600 text-white'
                      : 'bg-neutral-900 text-white border border-gray-700'
                  }`}
                >
                  {num}
                </span>
              );
            })}
          </div>
        </div>

        <button
          onClick={onStandUp}
          className="bg-gray-900/90 hover:bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-xs font-mono font-bold border border-gray-700 cursor-pointer shadow-lg transition-all"
        >
          STAND UP (ESC)
        </button>
      </div>

      {/* Center Announcer & Last Win */}
      <div className="flex flex-col items-center justify-center my-auto pointer-events-none">
        {winMessage && (
          <div className="bg-black/90 border-2 border-amber-400 px-6 py-2.5 rounded-xl text-center shadow-[0_0_30px_rgba(245,158,11,0.5)]">
            <span className="text-lg font-black text-amber-300 font-mono tracking-wider">
              {winMessage}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Betting Board (Solid surface, zero backdrop-filter) */}
      <div className="pointer-events-auto max-w-4xl mx-auto w-full flex flex-col gap-2">
        {/* Chips Selector Bar */}
        <div className="bg-gray-950/95 border border-gray-800 px-4 py-2 rounded-xl flex justify-between items-center shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">CHIP:</span>
            <div className="flex gap-1.5">
              {CHIP_DENOMS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDenom(d)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full font-mono font-black text-xs border-2 shadow cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center justify-center ${
                    selectedDenom === d ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-gray-700'
                  } ${
                    d === 100
                      ? 'bg-blue-900 text-blue-200'
                      : d === 500
                      ? 'bg-purple-900 text-purple-200'
                      : d === 1000
                      ? 'bg-amber-900 text-amber-200'
                      : d === 5000
                      ? 'bg-rose-900 text-rose-200'
                      : 'bg-emerald-900 text-emerald-200'
                  }`}
                >
                  ${d >= 1000 ? `${d / 1000}k` : d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono">
              <span className="text-[10px] text-gray-400 uppercase block">Total Bet</span>
              <span className="text-base sm:text-lg font-black text-amber-400 tabular-nums">
                ${totalBet.toLocaleString()}
              </span>
            </div>
            <button
              onClick={clearBets}
              disabled={isSpinning || totalBet === 0}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-40 text-xs font-mono font-bold rounded-lg cursor-pointer"
            >
              CLEAR
            </button>
            <button
              onClick={handleSpin}
              disabled={isSpinning || totalBet === 0 || totalBet > chips}
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-rose-600 text-white font-mono font-black text-sm uppercase rounded-lg shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer transition-all"
            >
              {isSpinning ? 'SPINNING...' : 'SPIN WHEEL'}
            </button>
          </div>
        </div>

        {/* Roulette Numbers Grid */}
        <div className="bg-emerald-950/95 border-2 border-amber-500/40 p-2 sm:p-3 rounded-2xl shadow-2xl overflow-x-auto">
          <div className="min-w-[620px] flex flex-col gap-1">
            {/* Main 1-36 Numbers with 0 on Left */}
            <div className="flex gap-1 items-stretch">
              {/* Green 0 */}
              <button
                onClick={() => placeBet('num_0')}
                className={`w-12 bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-black text-sm rounded border border-emerald-500 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 relative ${
                  bets['num_0'] ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                <span>0</span>
                {bets['num_0'] && (
                  <span className="text-[10px] bg-amber-400 text-black px-1 rounded-full font-bold">
                    ${bets['num_0'] >= 1000 ? `${bets['num_0'] / 1000}k` : bets['num_0']}
                  </span>
                )}
              </button>

              {/* 3 rows x 12 cols */}
              <div className="flex-1 grid grid-rows-3 grid-flow-col gap-1">
                {Array.from({ length: 36 }, (_, idx) => {
                  const col = Math.floor(idx / 3);
                  const row = idx % 3;
                  const num = col * 3 + (3 - row);
                  const isRed = RED_NUMBERS.has(num);
                  const betKey = `num_${num}`;
                  const currentBet = bets[betKey];

                  return (
                    <button
                      key={num}
                      onClick={() => placeBet(betKey)}
                      className={`h-9 flex items-center justify-center gap-1 font-mono font-bold text-xs rounded border transition-all cursor-pointer hover:scale-105 ${
                        isRed
                          ? 'bg-red-700 hover:bg-red-600 text-white border-red-500'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700'
                      } ${currentBet ? 'ring-2 ring-amber-400' : ''}`}
                    >
                      <span>{num}</span>
                      {currentBet && (
                        <span className="text-[9px] bg-amber-400 text-black px-1 rounded-full font-bold">
                          ${currentBet >= 1000 ? `${currentBet / 1000}k` : currentBet}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dozen Bets */}
            <div className="grid grid-cols-3 gap-1 pl-13">
              {[
                { key: 'dozen_1', label: '1st 12' },
                { key: 'dozen_2', label: '2nd 12' },
                { key: 'dozen_3', label: '3rd 12' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => placeBet(key)}
                  className={`py-1.5 bg-emerald-900/80 hover:bg-emerald-800 text-white font-mono text-xs font-bold rounded border border-emerald-600 cursor-pointer transition-all flex items-center justify-center gap-2 ${
                    bets[key] ? 'ring-2 ring-amber-400' : ''
                  }`}
                >
                  <span>{label} (2:1)</span>
                  {bets[key] && (
                    <span className="text-[10px] bg-amber-400 text-black px-1.5 rounded-full font-bold">
                      ${bets[key] >= 1000 ? `${bets[key] / 1000}k` : bets[key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Even Money Bets */}
            <div className="grid grid-cols-6 gap-1 pl-13">
              {[
                { key: 'low', label: '1 to 18' },
                { key: 'even', label: 'EVEN' },
                { key: 'red', label: 'RED', color: 'bg-red-700 border-red-500' },
                { key: 'black', label: 'BLACK', color: 'bg-neutral-900 border-neutral-700' },
                { key: 'odd', label: 'ODD' },
                { key: 'high', label: '19 to 36' },
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => placeBet(key)}
                  className={`py-1.5 text-white font-mono text-xs font-bold rounded border cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    color || 'bg-emerald-900/80 hover:bg-emerald-800 border-emerald-600'
                  } ${bets[key] ? 'ring-2 ring-amber-400' : ''}`}
                >
                  <span>{label}</span>
                  {bets[key] && (
                    <span className="text-[9px] bg-amber-400 text-black px-1 rounded-full font-bold">
                      ${bets[key] >= 1000 ? `${bets[key] / 1000}k` : bets[key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
