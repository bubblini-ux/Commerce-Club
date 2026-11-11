/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameTable = 'floor' | 'blackjack' | 'roulette' | 'cs_cases' | 'slots';

export type SkinRarity = 'consumer' | 'mil_spec' | 'restricted' | 'classified' | 'covert' | 'knife_special';

export type SkinWear = 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';

export interface CSSkin {
  id: string;
  name: string;
  weapon: string;
  caseName: string;
  rarity: SkinRarity;
  wear: SkinWear;
  float: number;
  statTrak?: boolean;
  value: number; // play money chips value
  primaryColor: string;
  secondaryColor: string;
  patternType: 'neon' | 'marble_fade' | 'dragon' | 'lore' | 'hyper_beast' | 'asiimov' | 'doppler' | 'tiger_tooth';
  weaponType: 'karambit' | 'butterfly' | 'm9_bayonet' | 'awp' | 'ak47' | 'm4a4' | 'deagle' | 'gloves';
}

export interface CSCase {
  id: string;
  name: string;
  price: number;
  description: string;
  badge: string;
  accentColor: string;
  possibleSkins: Omit<CSSkin, 'id' | 'wear' | 'float' | 'value'>[];
}

export interface PlayingCard {
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 1 to 13
  label: string; // 'A', '2'-'10', 'J', 'Q', 'K'
  color: 'black' | 'red';
  hidden?: boolean;
}

export type BlackjackPhase = 'betting' | 'player_turn' | 'dealer_turn' | 'settled';

export interface RouletteBet {
  type: 'straight' | 'red' | 'black' | 'even' | 'odd' | 'low' | 'high' | 'dozen1' | 'dozen2' | 'dozen3' | 'col1' | 'col2' | 'col3';
  value?: number;
  amount: number;
}

export interface SlotSymbol {
  id: string;
  name: string;
  icon: string;
  multiplier: number; // For 5 of a kind
  color: string;
}

export interface PlayerStats {
  handsPlayed: number;
  handsWon: number;
  rouletteSpins: number;
  casesOpened: number;
  knivesUnboxed: number;
  slotSpins: number;
  biggestWin: number;
  totalWon: number;
  totalWagered: number;
}
