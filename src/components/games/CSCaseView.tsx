/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../audio/soundEffects';
import { CS_CASES, generateCarouselSkins, RARITY_COLORS, rollSkinFromCase } from '../../game/csSkins';
import { CSCase, CSSkin } from '../../game/types';

interface CSCaseViewProps {
  chips: number;
  onUpdateChips: (newChips: number, wonAmount?: number) => void;
  onAddSkinToInventory: (skin: CSSkin) => void;
  onStandUp: () => void;
  onUpdate3DWeaponPreview: (patternType: string, primary: string, secondary: string) => void;
}

export const CSCaseView: React.FC<CSCaseViewProps> = ({
  chips,
  onUpdateChips,
  onAddSkinToInventory,
  onStandUp,
  onUpdate3DWeaponPreview,
}) => {
  const [selectedCase, setSelectedCase] = useState<CSCase>(CS_CASES[0]);
  const [isOpening, setIsOpening] = useState(false);
  const [carouselSkins, setCarouselSkins] = useState<CSSkin[]>([]);
  const [wonSkin, setWonSkin] = useState<CSSkin | null>(null);
  const [showWonModal, setShowWonModal] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleOpenCase = () => {
    if (isOpening || chips < selectedCase.price) return;

    // Deduct case cost
    onUpdateChips(chips - selectedCase.price);
    setIsOpening(true);
    setWonSkin(null);
    setShowWonModal(false);

    sounds.playChip();

    // Roll winning skin and generate carousel of 50 items (winner at index 38)
    const winningSkin = rollSkinFromCase(selectedCase);
    const winningIndex = 38;
    const skins = generateCarouselSkins(selectedCase, winningSkin, winningIndex);
    setCarouselSkins(skins);

    // Update 3D scene preview knife
    onUpdate3DWeaponPreview(winningSkin.patternType, winningSkin.primaryColor, winningSkin.secondaryColor);

    // Animation physics parameters
    // Each item card is ~160px wide + 12px gap = 172px
    const cardWidth = 172;
    // Add random sub-pixel landing offset within the winning card (-50px to +50px from center)
    const randomOffset = (Math.random() - 0.5) * 80;
    const targetScroll = winningIndex * cardWidth - (window.innerWidth / 2) + (cardWidth / 2) + randomOffset;

    const startTime = performance.now();
    const duration = 5400; // 5.4 seconds authentic CS opening
    let lastTickIndex = -1;

    const animateCarousel = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Authentic CS ease-out quintic deceleration curve
      const easeOut = 1 - Math.pow(1 - progress, 4.5);
      const currentScroll = targetScroll * easeOut;

      if (carouselRef.current) {
        carouselRef.current.scrollLeft = currentScroll;

        // Calculate card index under ticker needle
        const currentCenterCard = Math.floor((currentScroll + window.innerWidth / 2) / cardWidth);
        if (currentCenterCard !== lastTickIndex && currentCenterCard >= 0 && currentCenterCard < skins.length) {
          lastTickIndex = currentCenterCard;
          const isRare = skins[currentCenterCard].rarity === 'covert' || skins[currentCenterCard].rarity === 'knife_special';
          sounds.playCaseTick(isRare);
        }
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateCarousel);
      } else {
        // Animation finished!
        setIsOpening(false);
        setWonSkin(winningSkin);
        setShowWonModal(true);

        if (winningSkin.rarity === 'knife_special') {
          sounds.playRareDropFanfare();
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#ffd700', '#f59e0b', '#ec4899', '#3b82f6'],
          });
        } else if (winningSkin.rarity === 'covert') {
          sounds.playWin(2.5);
          confetti({ particleCount: 70, spread: 60 });
        } else {
          sounds.playWin(1.0);
        }
      }
    };

    // Small delay before reel spins
    setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(animateCarousel);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const handleKeepSkin = () => {
    if (wonSkin) {
      onAddSkinToInventory(wonSkin);
      setShowWonModal(false);
    }
  };

  const handleQuickSell = () => {
    if (wonSkin) {
      onUpdateChips(chips + wonSkin.value, wonSkin.value);
      sounds.playChip();
      setShowWonModal(false);
    }
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Bar with Stand Up Button */}
      <div className="flex justify-between items-center pointer-events-auto">
        <div className="bg-black/85 border border-cyan-500/40 px-4 py-2 rounded-xl text-cyan-400 font-mono text-xs shadow-lg">
          <div className="font-bold text-white tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            CS:GO HIGH ROLLER WEAPON VAULT · COMMERCE CASINO
          </div>
          <div className="text-[11px] text-gray-300">Unbox rare Doppler knives, Dragon Lore & neon contraband</div>
        </div>

        <button
          onClick={onStandUp}
          disabled={isOpening}
          className="bg-gray-900/90 hover:bg-gray-800 disabled:opacity-40 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-xs font-mono font-bold border border-gray-700 cursor-pointer shadow-lg transition-all"
        >
          STAND UP (ESC)
        </button>
      </div>

      {/* Center Ticker / Carousel (when opening) */}
      <div className="flex flex-col items-center justify-center my-auto w-full">
        {isOpening ? (
          <div className="w-full relative pointer-events-auto">
            {/* Center Yellow Needle Indicator */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-20 w-1 bg-amber-400 shadow-[0_0_15px_#f59e0b] pointer-events-none">
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-amber-400 -translate-x-1.5" />
              <div className="absolute bottom-0 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-amber-400 -translate-x-1.5" />
            </div>

            {/* Horizontal Scrolling Skin Strip */}
            <div
              ref={carouselRef}
              className="overflow-x-hidden flex gap-3 py-6 bg-black/80 border-y-2 border-cyan-500/40 px-4"
              style={{ scrollBehavior: 'auto' }}
            >
              {carouselSkins.map((skin, i) => {
                const conf = RARITY_COLORS[skin.rarity];
                return (
                  <div
                    key={i}
                    className="w-40 flex-shrink-0 h-48 rounded-xl p-3 flex flex-col justify-between border-b-4 shadow-xl"
                    style={{
                      backgroundColor: conf.bg,
                      borderBottomColor: conf.border,
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderWidth: 1,
                    }}
                  >
                    <div className="text-[10px] font-mono font-bold text-gray-400 truncate">
                      {skin.weapon}
                    </div>
                    <div className="text-center font-bold text-sm text-white truncate drop-shadow">
                      {skin.name}
                    </div>

                    {/* Procedural Skin Icon Graphic */}
                    <div className="w-full h-20 rounded-lg flex items-center justify-center relative overflow-hidden border border-white/10"
                      style={{
                        background: `radial-gradient(circle, ${skin.primaryColor}55 0%, #000 90%)`,
                      }}
                    >
                      <div
                        className="w-16 h-4 rounded-sm rotate-[-25deg] shadow-lg border border-white/30"
                        style={{
                          background: `linear-gradient(45deg, ${skin.primaryColor}, ${skin.secondaryColor})`,
                        }}
                      />
                      {skin.rarity === 'knife_special' && (
                        <span className="absolute text-yellow-300 text-lg drop-shadow-[0_0_8px_#ffd700]">★</span>
                      )}
                    </div>

                    <div className="text-right text-[10px] font-mono font-black" style={{ color: conf.text }}>
                      {conf.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Case Inspection Preview & Odds */
          <div className="pointer-events-auto bg-gray-950/90 border border-gray-800 p-4 sm:p-6 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col gap-4 text-center">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-pink-400 font-extrabold">
                {selectedCase.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                {selectedCase.name}
              </h2>
              <p className="text-xs text-gray-300 mt-1 max-w-md mx-auto">
                {selectedCase.description}
              </p>
            </div>

            {/* Possible drops badges */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {selectedCase.possibleSkins.map((s, idx) => {
                const conf = RARITY_COLORS[s.rarity];
                return (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2.5 py-1 rounded border font-bold flex items-center gap-1.5 shadow"
                    style={{
                      backgroundColor: conf.bg,
                      borderColor: conf.border,
                      color: conf.text,
                    }}
                  >
                    <span>{s.weapon}</span>
                    <span className="text-gray-300">|</span>
                    <span>{s.name}</span>
                  </span>
                );
              })}
            </div>

            {/* Case Cost & Unlock Button */}
            <div className="flex items-center justify-center gap-4 pt-3 border-t border-gray-800">
              <div className="text-left font-mono">
                <span className="text-[10px] text-gray-400 uppercase block">Case Key Price</span>
                <span className="text-xl font-black text-amber-400 tabular-nums">
                  ${selectedCase.price.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleOpenCase}
                disabled={chips < selectedCase.price}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-mono font-black text-sm uppercase rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.8)] hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer transition-all"
              >
                UNLOCK & OPEN CASE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Case Selector Dock (Solid surface - zero backdrop-filter) */}
      <div className="pointer-events-auto max-w-xl mx-auto w-full">
        <div className="bg-gray-950/95 border border-cyan-500/30 p-2 sm:p-3 rounded-2xl shadow-2xl flex justify-between gap-2">
          {CS_CASES.map((cs) => (
            <button
              key={cs.id}
              onClick={() => {
                if (!isOpening) {
                  setSelectedCase(cs);
                  sounds.playChip();
                }
              }}
              disabled={isOpening}
              className={`flex-1 p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedCase.id === cs.id
                  ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'border-gray-800 bg-gray-900/60 hover:border-gray-700'
              }`}
            >
              <div className="text-[9px] font-mono text-cyan-300 font-bold uppercase truncate">
                {cs.badge}
              </div>
              <div className="text-xs font-bold text-white truncate">
                {cs.name}
              </div>
              <div className="text-xs font-mono font-black text-amber-400">
                ${cs.price.toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Unboxed Item Win Modal */}
      {showWonModal && wonSkin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 pointer-events-auto">
          <div
            className="w-full max-w-md rounded-2xl p-6 text-center border-2 shadow-2xl animate-in zoom-in-95 flex flex-col gap-4"
            style={{
              backgroundColor: RARITY_COLORS[wonSkin.rarity].bg,
              borderColor: RARITY_COLORS[wonSkin.rarity].border,
              boxShadow: `0 0 50px ${RARITY_COLORS[wonSkin.rarity].glow}`,
            }}
          >
            {/* Header / Rarity Label */}
            <div className="space-y-1">
              <span
                className="text-xs font-mono font-black tracking-widest uppercase block"
                style={{ color: RARITY_COLORS[wonSkin.rarity].text }}
              >
                {RARITY_COLORS[wonSkin.rarity].label}
              </span>
              <h3 className="text-3xl font-black text-white tracking-wide">
                {wonSkin.weapon} | {wonSkin.name}
              </h3>
              {wonSkin.statTrak && (
                <span className="inline-block px-2 py-0.5 bg-orange-600 text-white font-mono font-bold text-xs rounded">
                  StatTrak™ Confirmed
                </span>
              )}
            </div>

            {/* Float & Wear Specifications */}
            <div className="bg-black/60 border border-white/10 rounded-xl p-3 flex justify-around text-xs font-mono">
              <div>
                <span className="text-gray-400 block text-[10px]">EXTERIOR</span>
                <span className="text-white font-bold">{wonSkin.wear}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">FLOAT VALUE</span>
                <span className="text-amber-300 font-bold">{wonSkin.float}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">PLAY VALUE</span>
                <span className="text-emerald-400 font-black">${wonSkin.value.toLocaleString()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleQuickSell}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-amber-300 font-mono font-bold text-xs uppercase rounded-xl border border-amber-500/30 cursor-pointer transition-all"
              >
                QUICK SELL (${wonSkin.value.toLocaleString()})
              </button>
              <button
                onClick={handleKeepSkin}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-mono font-black text-xs uppercase rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                KEEP IN SAFE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
