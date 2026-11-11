/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { sounds } from '../audio/soundEffects';

interface ATMModalProps {
  isOpen: boolean;
  onClose: () => void;
  chips: number;
  onAddChips: (amount: number) => void;
}

export const ATMModal: React.FC<ATMModalProps> = ({ isOpen, onClose, chips, onAddChips }) => {
  if (!isOpen) return null;

  const reloadAmounts = [
    { label: 'Standard Cardroom Reload', amount: 25000, desc: 'Quick boost for blackjack & roulette' },
    { label: 'VIP High-Roller Bailout', amount: 50000, desc: 'Unlock California foil cases' },
    { label: 'Billionaire Whale Stack', amount: 100000, desc: 'Maximum stakes thrills with zero limits' },
  ];

  const handleReload = (amt: number) => {
    sounds.playWin(1.2);
    onAddChips(amt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 pointer-events-auto select-none">
      <div className="w-full max-w-lg bg-neutral-950 border border-emerald-500/40 rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-800 pb-4">
          <div>
            <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              COMMERCE CASINO CASHIER & FREE PLAY ATM
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Unlimited Play Chip Refills
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        {/* Current Balance */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-400 font-mono block">CURRENT PLAY BALANCE</span>
            <span className="text-2xl font-black text-amber-300 font-mono tabular-nums">
              ${chips.toLocaleString()}
            </span>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-mono font-bold">
            100% FREE RELOAD
          </span>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {reloadAmounts.map(({ label, amount, desc }) => (
            <button
              key={amount}
              onClick={() => handleReload(amount)}
              className="p-4 bg-gray-900/80 hover:bg-emerald-950/50 border border-gray-800 hover:border-emerald-500/60 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group hover:scale-[1.02]"
            >
              <div>
                <div className="text-sm font-bold text-white group-hover:text-emerald-300">
                  {label}
                </div>
                <div className="text-xs text-gray-400 font-mono">{desc}</div>
              </div>
              <div className="text-right font-mono">
                <span className="text-base font-black text-emerald-400 block">
                  +${amount.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400">CLAIM FREE</span>
              </div>
            </button>
          ))}
        </div>

        {/* Responsible Gaming Notice */}
        <div className="bg-neutral-900 p-3 rounded-xl border border-gray-800 text-[11px] text-gray-400 leading-relaxed font-mono">
          <strong className="text-amber-400">PLAY MONEY NOTICE:</strong> All chips and items in The Commerce Club are strictly virtual tokens for gameplay enjoyment. No real money or financial risk is involved. Enjoy high-stakes adrenaline with absolute peace of mind!
        </div>
      </div>
    </div>
  );
};
