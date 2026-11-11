/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameTable } from '../game/types';
import { sounds } from '../audio/soundEffects';

interface HUDProps {
  chips: number;
  netWorth: number;
  activeTable: GameTable;
  inventoryCount: number;
  onSelectTable: (table: GameTable) => void;
  onOpenInventory: () => void;
  onOpenATM: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  chips,
  netWorth,
  activeTable,
  inventoryCount,
  onSelectTable,
  onOpenInventory,
  onOpenATM,
  isMuted,
  onToggleMute,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  const tables: { id: GameTable; label: string; icon: string }[] = [
    { id: 'floor', label: 'WALK FLOOR', icon: '🚶' },
    { id: 'blackjack', label: 'VIP BLACKJACK', icon: '🃏' },
    { id: 'roulette', label: 'ROULETTE', icon: '🎡' },
    { id: 'cs_cases', label: 'CS:GO VAULT', icon: '🗡️' },
    { id: 'slots', label: '777 SLOTS', icon: '🎰' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Top Perimeter Status Cluster */}
      <div className="flex justify-between items-start w-full">
        {/* Top-Left: Commerce Branding & Chip Stack */}
        <div className="pointer-events-auto bg-gray-950/90 border border-amber-500/30 rounded-xl p-3 shadow-xl flex items-center gap-3">
          {/* Commerce Logo Mini Crest */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-rose-700 flex items-center justify-center font-serif text-lg font-black text-amber-200 border border-amber-400 shadow">
            ♠
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-pink-400 font-extrabold uppercase">
                THE COMMERCE CLUB · CA
              </span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">
                PLAY MONEY
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono tabular-nums leading-tight">
              ${chips.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400 font-mono">
              Net Worth: <span className="text-white font-bold">${netWorth.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Top-Right: ATM Rebuy, Safe/Inventory, Sound Mute */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* ATM Rebuy Button */}
          <button
            onClick={() => {
              sounds.playChip();
              onOpenATM();
            }}
            className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/40 px-3 py-2 rounded-xl text-xs font-mono font-bold shadow-lg flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
            title="Free Play Money Reloads"
          >
            <span>🏦</span>
            <span className="hidden sm:inline">ATM REFILL</span>
          </button>

          {/* High-Roller Safe / Inventory */}
          <button
            onClick={() => {
              sounds.playChip();
              onOpenInventory();
            }}
            className="bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/40 px-3 py-2 rounded-xl text-xs font-mono font-bold shadow-lg flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 relative"
            title="High-Roller Safe (Skins & Knives)"
          >
            <span>🗝️</span>
            <span className="hidden sm:inline">SAFE</span>
            {inventoryCount > 0 && (
              <span className="bg-amber-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full font-mono">
                {inventoryCount}
              </span>
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="bg-gray-900/80 hover:bg-gray-800 text-gray-300 border border-gray-700 w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-lg cursor-pointer transition-all"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Unified Bottom Control Dock (Zero Viewport Occlusion, Centered & Collapsible) */}
      <div className="pointer-events-auto flex flex-col items-center mx-auto transition-transform duration-300">
        {/* Collapse / Expand Toggle */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="bg-gray-950/90 text-gray-400 hover:text-white border border-gray-800 text-[10px] font-mono px-3 py-1 rounded-t-lg cursor-pointer -mb-px flex items-center gap-1"
        >
          <span>{isDockCollapsed ? '▴ SHOW DOCK' : '▾ HIDE DOCK'}</span>
        </button>

        {/* Horizontal Navigation Dock */}
        {!isDockCollapsed && (
          <div className="bg-gray-950/95 border border-amber-500/30 px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-1.5 sm:gap-2 max-w-[min(940px,94vw)]">
            {tables.map((t) => {
              const isActive = activeTable === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    sounds.playChip();
                    onSelectTable(t.id);
                  }}
                  className={`px-3 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span className="hidden md:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
