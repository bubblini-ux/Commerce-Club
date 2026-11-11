/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CSSkin } from '../game/types';
import { RARITY_COLORS } from '../game/csSkins';
import { sounds } from '../audio/soundEffects';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: CSSkin[];
  onSellSkin: (skinId: string, value: number) => void;
  onInspectInScene: (skin: CSSkin) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onSellSkin,
  onInspectInScene,
}) => {
  if (!isOpen) return null;

  const totalValue = inventory.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 pointer-events-auto select-none">
      <div className="w-full max-w-4xl max-h-[85vh] bg-neutral-950 border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/60">
          <div>
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              HIGH-ROLLER SAFE & CS WEAPON INVENTORY
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Collected Weapons & Knives ({inventory.length})
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right font-mono">
              <span className="text-[10px] text-gray-400 uppercase block">Total Collection Value</span>
              <span className="text-lg sm:text-xl font-black text-emerald-400 tabular-nums">
                ${totalValue.toLocaleString()}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer font-bold text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {inventory.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="text-5xl">🗝️</div>
              <h3 className="text-lg font-bold text-gray-300 font-mono">Your High-Roller Safe is Empty</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Visit the Counter-Strike Case Vault in the casino floor to open weapon cases and collect rare Doppler knives and classified rifles!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {inventory.map((skin) => {
                const conf = RARITY_COLORS[skin.rarity];
                return (
                  <div
                    key={skin.id}
                    className="p-3.5 rounded-xl border flex flex-col justify-between gap-3 shadow-lg relative group transition-all"
                    style={{
                      backgroundColor: conf.bg,
                      borderColor: conf.border,
                    }}
                  >
                    <div>
                      <div className="flex justify-between items-start text-[10px] font-mono">
                        <span className="text-gray-300 font-bold">{skin.weapon}</span>
                        <span style={{ color: conf.text }} className="font-black">
                          {skin.wear}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-white truncate drop-shadow">
                        {skin.name}
                      </h4>
                      {skin.statTrak && (
                        <span className="text-[9px] font-mono text-orange-400 font-bold block">
                          StatTrak™
                        </span>
                      )}
                    </div>

                    {/* Skin Preview Badge */}
                    <div
                      className="h-20 rounded-lg flex items-center justify-center relative overflow-hidden border border-white/10"
                      style={{
                        background: `radial-gradient(circle, ${skin.primaryColor}55 0%, #000 90%)`,
                      }}
                    >
                      <div
                        className="w-18 h-4 rounded-sm rotate-[-25deg] shadow-lg border border-white/30"
                        style={{
                          background: `linear-gradient(45deg, ${skin.primaryColor}, ${skin.secondaryColor})`,
                        }}
                      />
                      {skin.rarity === 'knife_special' && (
                        <span className="absolute text-yellow-300 text-lg drop-shadow-[0_0_8px_#ffd700]">★</span>
                      )}
                    </div>

                    {/* Footer & Actions */}
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <div className="font-mono">
                        <span className="text-[9px] text-gray-400 block">VALUE</span>
                        <span className="text-xs font-black text-emerald-400">
                          ${skin.value.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            onInspectInScene(skin);
                            onClose();
                          }}
                          className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-mono font-bold cursor-pointer"
                        >
                          INSPECT 3D
                        </button>
                        <button
                          onClick={() => {
                            sounds.playChip();
                            onSellSkin(skin.id, skin.value);
                          }}
                          className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-amber-300 border border-amber-500/30 rounded text-[10px] font-mono font-bold cursor-pointer"
                        >
                          SELL
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
