/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../audio/soundEffects';
import { PlayingCard } from '../../game/types';

interface BlackjackViewProps {
  chips: number;
  onUpdateChips: (newChips: number, wonAmount?: number) => void;
  onStandUp: () => void;
}

const CHIP_DENOMS = [100, 500, 1000, 5000, 25000];

function generateCard(hidden = false): PlayingCard {
  const suits: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const val = Math.floor(Math.random() * 13) + 1;
  const labels = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const color = suit === '♥' || suit === '♦' ? 'red' : 'black';

  return {
    suit,
    value: val,
    label: labels[val],
    color,
    hidden,
  };
}

function calculateHandValue(cards: PlayingCard[]): { total: number; isSoft: boolean; isBlackjack: boolean } {
  const visible = cards.filter((c) => !c.hidden);
  let total = 0;
  let aces = 0;

  for (const c of visible) {
    if (c.value === 1) {
      aces += 1;
      total += 11;
    } else if (c.value >= 10) {
      total += 10;
    } else {
      total += c.value;
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  const isBlackjack = visible.length === 2 && total === 21;
  return { total, isSoft: aces > 0, isBlackjack };
}

export const BlackjackView: React.FC<BlackjackViewProps> = ({ chips, onUpdateChips, onStandUp }) => {
  const [bet, setBet] = useState(1000);
  const [selectedDenom, setSelectedDenom] = useState(1000);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer_turn' | 'resolved'>('betting');
  const [playerCards, setPlayerCards] = useState<PlayingCard[]>([]);
  const [dealerCards, setDealerCards] = useState<PlayingCard[]>([]);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [winAmount, setWinAmount] = useState<number>(0);

  const addChipToBet = (amount: number) => {
    if (gameState !== 'betting') return;
    if (bet + amount <= chips) {
      sounds.playChip();
      setBet((prev) => prev + amount);
    }
  };

  const clearBet = () => {
    if (gameState !== 'betting') return;
    setBet(0);
    sounds.playChip();
  };

  const startHand = () => {
    if (bet <= 0 || bet > chips) return;
    sounds.playChip();
    onUpdateChips(chips - bet);

    const pCard1 = generateCard();
    const dCard1 = generateCard();
    const pCard2 = generateCard();
    const dCard2 = generateCard(true); // Hidden hole card

    sounds.playCardDeal();
    setTimeout(() => sounds.playCardDeal(), 150);

    const initialPlayerCards = [pCard1, pCard2];
    const initialDealerCards = [dCard1, dCard2];

    setPlayerCards(initialPlayerCards);
    setDealerCards(initialDealerCards);

    const pScore = calculateHandValue(initialPlayerCards);
    if (pScore.isBlackjack) {
      // Natural Blackjack!
      setTimeout(() => {
        resolveDealer(initialDealerCards, initialPlayerCards, bet);
      }, 600);
    } else {
      setGameState('playing');
    }
  };

  const handleHit = () => {
    if (gameState !== 'playing') return;
    sounds.playCardDeal();
    const newCard = generateCard();
    const newCards = [...playerCards, newCard];
    setPlayerCards(newCards);

    const score = calculateHandValue(newCards);
    if (score.total > 21) {
      // Bust
      setGameState('resolved');
      setResultMessage('BUST! OVER 21');
      sounds.playBust();
    }
  };

  const handleDoubleDown = () => {
    if (gameState !== 'playing' || chips < bet) return;
    const addedBet = bet;
    onUpdateChips(chips - addedBet);
    const doubledBet = bet * 2;
    setBet(doubledBet);

    sounds.playChip();
    sounds.playCardDeal();
    const newCard = generateCard();
    const newCards = [...playerCards, newCard];
    setPlayerCards(newCards);

    const score = calculateHandValue(newCards);
    if (score.total > 21) {
      setGameState('resolved');
      setResultMessage('BUST ON DOUBLE!');
      sounds.playBust();
    } else {
      resolveDealer(dealerCards, newCards, doubledBet);
    }
  };

  const handleStand = () => {
    if (gameState !== 'playing') return;
    resolveDealer(dealerCards, playerCards, bet);
  };

  const resolveDealer = (dCards: PlayingCard[], pCards: PlayingCard[], activeBet: number) => {
    setGameState('dealer_turn');

    // Reveal dealer's hole card
    const revealed = dCards.map((c) => ({ ...c, hidden: false }));
    setDealerCards(revealed);
    sounds.playCardDeal();

    let curCards: PlayingCard[] = [...revealed];
    let dScore = calculateHandValue(curCards);

    const drawDealerLoop = () => {
      if (dScore.total < 17) {
        setTimeout(() => {
          sounds.playCardDeal();
          const extraCard = generateCard();
          curCards = [...curCards, extraCard];
          setDealerCards(curCards);
          dScore = calculateHandValue(curCards);
          drawDealerLoop();
        }, 400);
      } else {
        // Compare hands
        finalizeRound(dScore.total, curCards, pCards, activeBet);
      }
    };

    setTimeout(drawDealerLoop, 400);
  };

  const finalizeRound = (
    dealerTotal: number,
    finalDealerCards: PlayingCard[],
    finalPlayerCards: PlayingCard[],
    activeBet: number
  ) => {
    setGameState('resolved');
    const pScore = calculateHandValue(finalPlayerCards);
    const dScore = calculateHandValue(finalDealerCards);

    if (pScore.isBlackjack && !dScore.isBlackjack) {
      // 3 to 2 payout
      const payout = Math.round(activeBet * 2.5);
      setResultMessage('BLACKJACK! 3:2 PAYOUT');
      setWinAmount(payout);
      onUpdateChips(chips + payout, payout - activeBet);
      sounds.playWin(3.0);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } else if (pScore.isBlackjack && dScore.isBlackjack) {
      setResultMessage('PUSH! BOTH BLACKJACK');
      setWinAmount(activeBet);
      onUpdateChips(chips + activeBet);
    } else if (dealerTotal > 21) {
      const payout = activeBet * 2;
      setResultMessage('DEALER BUSTS! YOU WIN');
      setWinAmount(payout);
      onUpdateChips(chips + payout, activeBet);
      sounds.playWin(1.5);
    } else if (pScore.total > dealerTotal) {
      const payout = activeBet * 2;
      setResultMessage(`YOU WIN! ${pScore.total} vs ${dealerTotal}`);
      setWinAmount(payout);
      onUpdateChips(chips + payout, activeBet);
      sounds.playWin(1.5);
    } else if (pScore.total === dealerTotal) {
      setResultMessage(`PUSH! TIED AT ${pScore.total}`);
      setWinAmount(activeBet);
      onUpdateChips(chips + activeBet);
    } else {
      setResultMessage(`DEALER WINS: ${dealerTotal} to ${pScore.total}`);
      setWinAmount(0);
      sounds.playBust();
    }
  };

  const pScore = calculateHandValue(playerCards);
  const dScore = calculateHandValue(dealerCards);

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Bar with Table Info & Stand Up */}
      <div className="flex justify-between items-center pointer-events-auto">
        <div className="bg-black/80 border border-emerald-500/40 px-4 py-2 rounded-lg text-emerald-400 font-mono text-xs shadow-lg">
          <div className="font-bold text-white tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            THE COMMERCE CLUB · VIP HIGH ROLLER 3:2
          </div>
          <div className="text-[11px] text-gray-300">Dealer must hit soft 17 · Double on any 2 cards</div>
        </div>

        <button
          onClick={onStandUp}
          className="bg-gray-900/90 hover:bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-xs font-mono font-bold border border-gray-700 cursor-pointer shadow-lg transition-all"
        >
          STAND UP (ESC)
        </button>
      </div>

      {/* Center Table Playfield (Low occlusion, cards positioned ergonomically) */}
      <div className="flex flex-col items-center justify-center my-auto space-y-8">
        {/* Dealer Cards Area */}
        <div className="flex flex-col items-center space-y-2">
          <div className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span>DEALER'S HAND</span>
            {dealerCards.length > 0 && !dealerCards.some((c) => c.hidden) && (
              <span className="bg-gray-800 text-amber-300 px-2 py-0.5 rounded font-mono text-xs">
                {dScore.total}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 min-h-[96px]">
            {dealerCards.map((card, i) => (
              <div
                key={i}
                className={`w-16 h-24 sm:w-20 sm:h-28 rounded-lg shadow-2xl flex flex-col justify-between p-2 font-mono font-black border transition-all ${
                  card.hidden
                    ? 'bg-gradient-to-br from-red-950 to-neutral-900 border-red-700/60'
                    : 'bg-white border-gray-200'
                }`}
              >
                {card.hidden ? (
                  <div className="h-full flex items-center justify-center text-amber-500/80 text-xl font-serif">
                    ♠
                  </div>
                ) : (
                  <>
                    <div className={`text-sm ${card.color === 'red' ? 'text-red-600' : 'text-neutral-950'}`}>
                      {card.label}
                      <span className="text-xs ml-0.5">{card.suit}</span>
                    </div>
                    <div className={`text-2xl text-center ${card.color === 'red' ? 'text-red-600' : 'text-neutral-950'}`}>
                      {card.suit}
                    </div>
                    <div className={`text-sm text-right ${card.color === 'red' ? 'text-red-600' : 'text-neutral-950'}`}>
                      {card.label}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Result Announcement Banner */}
        {gameState === 'resolved' && (
          <div className="pointer-events-auto bg-black/90 border-2 border-amber-400 px-6 py-3 rounded-xl text-center shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-bounce">
            <div className="text-lg sm:text-2xl font-black text-amber-300 font-mono tracking-wider">
              {resultMessage}
            </div>
            {winAmount > 0 && (
              <div className="text-sm font-bold text-emerald-400 font-mono">
                +${winAmount.toLocaleString()} PLAY CHIPS
              </div>
            )}
            <button
              onClick={() => {
                setGameState('betting');
                setPlayerCards([]);
                setDealerCards([]);
                setResultMessage('');
              }}
              className="mt-2 px-5 py-1.5 bg-gradient-to-r from-amber-500 to-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              PLAY NEXT HAND
            </button>
          </div>
        )}

        {/* Player Cards Area */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center gap-3 min-h-[96px]">
            {playerCards.map((card, i) => (
              <div
                key={i}
                className="w-16 h-24 sm:w-20 sm:h-28 bg-white border border-gray-200 rounded-lg shadow-2xl flex flex-col justify-between p-2 font-mono font-black transition-all"
              >
                <div className={`text-sm ${card.color === 'red' ? 'text-red-600' : 'text-neutral-950'}`}>
                  {card.label}
                  <span className="text-xs ml-0.5">{card.suit}</span>
                </div>
                <div className={`text-2xl text-center ${card.color === 'red' ? 'text-red-600' : 'text-neutral-950'}`}>
                  {card.suit}
                </div>
                <div className={`text-sm text-right ${card.color === 'red' ? 'text-red-600' : 'text-neutral-950'}`}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <span>YOUR HAND</span>
            {playerCards.length > 0 && (
              <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono text-xs border border-amber-500/40">
                {pScore.total} {pScore.isSoft && pScore.total < 21 ? '(SOFT)' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls Dock (Solid/rgba surfaces - zero backdrop-filter) */}
      <div className="pointer-events-auto flex flex-col items-center gap-3 max-w-xl mx-auto w-full">
        {gameState === 'betting' ? (
          <div className="bg-gray-950/95 border border-amber-500/30 p-3 sm:p-4 rounded-2xl w-full shadow-2xl flex flex-col gap-3">
            {/* Chip selector */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-gray-400">SELECT CHIP:</span>
              <div className="flex gap-2">
                {CHIP_DENOMS.map((denom) => (
                  <button
                    key={denom}
                    onClick={() => {
                      setSelectedDenom(denom);
                      addChipToBet(denom);
                    }}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full font-mono font-black text-xs border-2 shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95 flex items-center justify-center ${
                      selectedDenom === denom ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-gray-600'
                    } ${
                      denom === 100
                        ? 'bg-blue-900 text-blue-200'
                        : denom === 500
                        ? 'bg-purple-900 text-purple-200'
                        : denom === 1000
                        ? 'bg-amber-900 text-amber-200'
                        : denom === 5000
                        ? 'bg-rose-900 text-rose-200'
                        : 'bg-emerald-900 text-emerald-200'
                    }`}
                  >
                    ${denom >= 1000 ? `${denom / 1000}k` : denom}
                  </button>
                ))}
              </div>
            </div>

            {/* Bet Summary & Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-800">
              <div className="font-mono">
                <div className="text-[10px] text-gray-400 uppercase">Current Wager</div>
                <div className="text-xl font-bold text-amber-400 tabular-nums">
                  ${bet.toLocaleString()}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearBet}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-mono font-bold cursor-pointer"
                >
                  CLEAR
                </button>
                <button
                  onClick={() => addChipToBet(bet)}
                  disabled={bet * 2 > chips}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-40 rounded-lg text-xs font-mono font-bold cursor-pointer"
                >
                  2X
                </button>
                <button
                  onClick={startHand}
                  disabled={bet <= 0 || bet > chips}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-black text-xs sm:text-sm tracking-wider uppercase rounded-lg shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer transition-all"
                >
                  DEAL CARDS
                </button>
              </div>
            </div>
          </div>
        ) : gameState === 'playing' ? (
          <div className="bg-gray-950/95 border border-emerald-500/40 p-4 rounded-2xl w-full shadow-2xl flex items-center justify-around gap-2">
            <button
              onClick={handleHit}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-sm uppercase rounded-xl shadow-lg hover:scale-105 active:scale-95 cursor-pointer transition-all border border-emerald-400/40"
            >
              HIT
            </button>
            <button
              onClick={handleStand}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-sm uppercase rounded-xl shadow-lg hover:scale-105 active:scale-95 cursor-pointer transition-all border border-rose-400/40"
            >
              STAND
            </button>
            <button
              onClick={handleDoubleDown}
              disabled={playerCards.length !== 2 || chips < bet}
              className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-black font-mono font-black text-sm uppercase rounded-xl shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer transition-all border border-amber-300/40"
            >
              DOUBLE (2X)
            </button>
          </div>
        ) : (
          <div className="bg-gray-950/90 border border-gray-800 px-6 py-3 rounded-xl text-center text-xs font-mono text-gray-400">
            DEALER PLAYING...
          </div>
        )}
      </div>
    </div>
  );
};
