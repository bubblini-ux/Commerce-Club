/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { BlackjackView } from './components/games/BlackjackView';
import { RouletteView } from './components/games/RouletteView';
import { CSCaseView } from './components/games/CSCaseView';
import { SlotsView } from './components/games/SlotsView';
import { InventoryModal } from './components/InventoryModal';
import { ATMModal } from './components/ATMModal';
import { initCasinoScene, CasinoSceneContext } from './three/casinoScene';
import { setupControls, ControlsManager } from './three/interactiveControls';
import { CSSkin, GameTable } from './game/types';
import { sounds } from './audio/soundEffects';

export default function App() {
  const [gameStage, setGameStage] = useState<'title' | 'playing'>('title');
  const [activeTable, setActiveTable] = useState<GameTable>('floor');
  const [chips, setChips] = useState<number>(100000); // $100,000 starting high-roller play money stack
  const [inventory, setInventory] = useState<CSSkin[]>([]);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isATMOpen, setIsATMOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneContextRef = useRef<CasinoSceneContext | null>(null);
  const controlsManagerRef = useRef<ControlsManager | null>(null);

  // Initialize Three.js scene once in stable ref container outside re-rendering UI
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const ctx = initCasinoScene(canvasContainerRef.current);
    sceneContextRef.current = ctx;

    const controls = setupControls(ctx, canvasContainerRef.current, (newTable) => {
      setActiveTable(newTable);
    });
    controlsManagerRef.current = controls;

    // Periodic ambient casino chord
    const ambInterval = setInterval(() => {
      sounds.playCasinoAmbianceChord();
    }, 18000);

    return () => {
      clearInterval(ambInterval);
      controls.destroy();
      ctx.dispose();
      sceneContextRef.current = null;
      controlsManagerRef.current = null;
    };
  }, []);

  const handleStartGame = () => {
    sounds.playChip();
    setGameStage('playing');
    if (controlsManagerRef.current) {
      controlsManagerRef.current.setActiveTable('floor');
    }
  };

  const handleSelectTable = (table: GameTable) => {
    setActiveTable(table);
    if (controlsManagerRef.current) {
      controlsManagerRef.current.setActiveTable(table);
    }
  };

  const handleStandUp = () => {
    handleSelectTable('floor');
  };

  const handleUpdateChips = (newAmount: number) => {
    setChips(Math.max(0, newAmount));
  };

  const handleAddSkinToInventory = (skin: CSSkin) => {
    setInventory((prev) => [skin, ...prev]);
  };

  const handleSellSkin = (skinId: string, value: number) => {
    setInventory((prev) => prev.filter((s) => s.id !== skinId));
    setChips((prev) => prev + value);
  };

  const handleInspectInScene = (skin: CSSkin) => {
    if (sceneContextRef.current) {
      sceneContextRef.current.updateSkinPreview(skin.patternType, skin.primaryColor, skin.secondaryColor);
    }
    handleSelectTable('cs_cases');
  };

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const inventoryTotalValue = inventory.reduce((acc, cur) => acc + cur.value, 0);
  const netWorth = chips + inventoryTotalValue;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 3D WebGL Canvas Container (Stable mount, zero re-renders) */}
      <div ref={canvasContainerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Title Screen Overlay */}
      {gameStage === 'title' && <TitleScreen onStart={handleStartGame} />}

      {/* Main Game Interface (when Playing) */}
      {gameStage === 'playing' && (
        <>
          {/* Main Low-Occlusion HUD */}
          <HUD
            chips={chips}
            netWorth={netWorth}
            activeTable={activeTable}
            inventoryCount={inventory.length}
            onSelectTable={handleSelectTable}
            onOpenInventory={() => setIsInventoryOpen(true)}
            onOpenATM={() => setIsATMOpen(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />

          {/* Floor Navigation Hint (when exploring the casino) */}
          {activeTable === 'floor' && (
            <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center">
              <div className="bg-black/75 border border-white/10 px-4 py-2 rounded-xl text-xs font-mono text-gray-300 shadow-xl flex items-center gap-3">
                <span>
                  <strong className="text-amber-400">WASD</strong> Move
                </span>
                <span>·</span>
                <span>
                  <strong className="text-cyan-400">Drag</strong> Look
                </span>
                <span>·</span>
                <span>
                  <strong className="text-emerald-400">Click Table</strong> to Sit & Play
                </span>
              </div>
            </div>
          )}

          {/* Table Specific Game Overlays */}
          {activeTable === 'blackjack' && (
            <BlackjackView
              chips={chips}
              onUpdateChips={handleUpdateChips}
              onStandUp={handleStandUp}
            />
          )}

          {activeTable === 'roulette' && (
            <RouletteView
              chips={chips}
              onUpdateChips={handleUpdateChips}
              onStandUp={handleStandUp}
              onTriggerWheelSpin={(winningNumber, onComplete) => {
                if (controlsManagerRef.current) {
                  controlsManagerRef.current.spinRouletteWheel(winningNumber, onComplete);
                } else {
                  onComplete();
                }
              }}
            />
          )}

          {activeTable === 'cs_cases' && (
            <CSCaseView
              chips={chips}
              onUpdateChips={handleUpdateChips}
              onAddSkinToInventory={handleAddSkinToInventory}
              onStandUp={handleStandUp}
              onUpdate3DWeaponPreview={(pattern, primary, secondary) => {
                if (sceneContextRef.current) {
                  sceneContextRef.current.updateSkinPreview(pattern, primary, secondary);
                }
              }}
            />
          )}

          {activeTable === 'slots' && (
            <SlotsView
              chips={chips}
              onUpdateChips={handleUpdateChips}
              onStandUp={handleStandUp}
              onTriggerSceneSlots={(duration, onComplete) => {
                if (controlsManagerRef.current) {
                  controlsManagerRef.current.spinSlots(duration, onComplete);
                } else {
                  onComplete();
                }
              }}
            />
          )}

          {/* High-Roller Safe / Inventory Modal */}
          <InventoryModal
            isOpen={isInventoryOpen}
            onClose={() => setIsInventoryOpen(false)}
            inventory={inventory}
            onSellSkin={handleSellSkin}
            onInspectInScene={handleInspectInScene}
          />

          {/* Play Money Cashier & ATM Modal */}
          <ATMModal
            isOpen={isATMOpen}
            onClose={() => setIsATMOpen(false)}
            chips={chips}
            onAddChips={(amount) => handleUpdateChips(chips + amount)}
          />
        </>
      )}
    </div>
  );
}
