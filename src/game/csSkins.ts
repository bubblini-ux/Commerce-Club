/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CSCase, CSSkin, SkinRarity, SkinWear } from './types';

export const RARITY_COLORS: Record<SkinRarity, { text: string; bg: string; border: string; glow: string; label: string }> = {
  consumer: { text: '#b0c3d9', bg: '#1e2430', border: '#4b5768', glow: 'rgba(176,195,217,0.3)', label: 'Consumer Grade' },
  mil_spec: { text: '#4b69ff', bg: '#101c38', border: '#4b69ff', glow: 'rgba(75,105,255,0.4)', label: 'Mil-Spec Grade' },
  restricted: { text: '#8847ff', bg: '#251340', border: '#8847ff', glow: 'rgba(136,71,255,0.4)', label: 'Restricted' },
  classified: { text: '#d32ce6', bg: '#36103b', border: '#d32ce6', glow: 'rgba(211,44,230,0.5)', label: 'Classified' },
  covert: { text: '#eb4b4b', bg: '#401216', border: '#eb4b4b', glow: 'rgba(235,75,75,0.6)', label: 'Covert' },
  knife_special: { text: '#ffd700', bg: '#40340b', border: '#ffd700', glow: 'rgba(255,215,0,0.8)', label: '★ Exceedingly Rare Special' },
};

export const CS_CASES: CSCase[] = [
  {
    id: 'commerce_vip',
    name: 'Commerce VIP Case',
    price: 5000,
    badge: 'CARDROOM VIP',
    accentColor: '#10b981',
    description: 'The signature case of the Commerce Casino floor. Features classic high-stakes sidearms and the legendary Karambit Marble Fade.',
    possibleSkins: [
      {
        name: 'Blue Ply',
        weapon: 'Desert Eagle',
        caseName: 'Commerce VIP Case',
        rarity: 'mil_spec',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e293b',
        patternType: 'neon',
        weaponType: 'deagle',
      },
      {
        name: 'Elite Build',
        weapon: 'AK-47',
        caseName: 'Commerce VIP Case',
        rarity: 'mil_spec',
        primaryColor: '#78716c',
        secondaryColor: '#f59e0b',
        patternType: 'lore',
        weaponType: 'ak47',
      },
      {
        name: 'Mortis',
        weapon: 'AWP',
        caseName: 'Commerce VIP Case',
        rarity: 'restricted',
        primaryColor: '#b91c1c',
        secondaryColor: '#1c1917',
        patternType: 'dragon',
        weaponType: 'awp',
      },
      {
        name: 'The Emperor',
        weapon: 'M4A4',
        caseName: 'Commerce VIP Case',
        rarity: 'classified',
        primaryColor: '#2563eb',
        secondaryColor: '#eab308',
        patternType: 'hyper_beast',
        weaponType: 'm4a4',
      },
      {
        name: 'Wild Lotus',
        weapon: 'AK-47',
        caseName: 'Commerce VIP Case',
        rarity: 'covert',
        primaryColor: '#10b981',
        secondaryColor: '#ec4899',
        patternType: 'neon',
        weaponType: 'ak47',
      },
      {
        name: 'Marble Fade',
        weapon: '★ Karambit',
        caseName: 'Commerce VIP Case',
        rarity: 'knife_special',
        primaryColor: '#f43f5e',
        secondaryColor: '#3b82f6',
        patternType: 'marble_fade',
        weaponType: 'karambit',
      },
    ],
  },
  {
    id: 'vice_neon',
    name: 'Vice Neon Dreams Case',
    price: 15000,
    badge: 'GTA 6 RETRO',
    accentColor: '#ec4899',
    description: 'Vice City and Leonida inspired fluorescent vaporwave collection. Unbox radioactive neon skins and the Butterfly Knife Doppler Phase 2.',
    possibleSkins: [
      {
        name: 'Ocean Drive',
        weapon: 'Desert Eagle',
        caseName: 'Vice Neon Dreams Case',
        rarity: 'mil_spec',
        primaryColor: '#06b6d4',
        secondaryColor: '#ec4899',
        patternType: 'neon',
        weaponType: 'deagle',
      },
      {
        name: 'Neon Rider',
        weapon: 'AK-47',
        caseName: 'Vice Neon Dreams Case',
        rarity: 'restricted',
        primaryColor: '#d946ef',
        secondaryColor: '#06b6d4',
        patternType: 'neon',
        weaponType: 'ak47',
      },
      {
        name: 'Neo-Noir',
        weapon: 'M4A4',
        caseName: 'Vice Neon Dreams Case',
        rarity: 'classified',
        primaryColor: '#ec4899',
        secondaryColor: '#3b82f6',
        patternType: 'neon',
        weaponType: 'm4a4',
      },
      {
        name: 'Hyper Beast',
        weapon: 'AWP',
        caseName: 'Vice Neon Dreams Case',
        rarity: 'covert',
        primaryColor: '#8b5cf6',
        secondaryColor: '#06b6d4',
        patternType: 'hyper_beast',
        weaponType: 'awp',
      },
      {
        name: 'Doppler Phase 2 (Pink Galaxy)',
        weapon: '★ Butterfly Knife',
        caseName: 'Vice Neon Dreams Case',
        rarity: 'knife_special',
        primaryColor: '#f43f5e',
        secondaryColor: '#a855f7',
        patternType: 'doppler',
        weaponType: 'butterfly',
      },
      {
        name: 'Vice Specialist',
        weapon: '★ Sport Gloves',
        caseName: 'Vice Neon Dreams Case',
        rarity: 'knife_special',
        primaryColor: '#ec4899',
        secondaryColor: '#06b6d4',
        patternType: 'neon',
        weaponType: 'gloves',
      },
    ],
  },
  {
    id: 'california_high_roller',
    name: 'California High Roller Foil Case',
    price: 50000,
    badge: 'HIGH ROLLER APEX',
    accentColor: '#f59e0b',
    description: 'The pinnacle of luxury gaming. Features pure gold gilded hardware, the AWP Dragon Lore, Howl, and the M9 Bayonet Lore.',
    possibleSkins: [
      {
        name: 'Golden Koi',
        weapon: 'Desert Eagle',
        caseName: 'California High Roller Foil Case',
        rarity: 'restricted',
        primaryColor: '#f59e0b',
        secondaryColor: '#78716c',
        patternType: 'tiger_tooth',
        weaponType: 'deagle',
      },
      {
        name: 'Asiimov',
        weapon: 'M4A4',
        caseName: 'California High Roller Foil Case',
        rarity: 'classified',
        primaryColor: '#f97316',
        secondaryColor: '#ffffff',
        patternType: 'asiimov',
        weaponType: 'm4a4',
      },
      {
        name: 'Howl (Contraband)',
        weapon: 'M4A4',
        caseName: 'California High Roller Foil Case',
        rarity: 'covert',
        primaryColor: '#ef4444',
        secondaryColor: '#000000',
        patternType: 'hyper_beast',
        weaponType: 'm4a4',
      },
      {
        name: 'Dragon Lore',
        weapon: 'AWP',
        caseName: 'California High Roller Foil Case',
        rarity: 'covert',
        primaryColor: '#eab308',
        secondaryColor: '#22c55e',
        patternType: 'dragon',
        weaponType: 'awp',
      },
      {
        name: 'Lore Gold Engraved',
        weapon: '★ M9 Bayonet',
        caseName: 'California High Roller Foil Case',
        rarity: 'knife_special',
        primaryColor: '#facc15',
        secondaryColor: '#22c55e',
        patternType: 'lore',
        weaponType: 'm9_bayonet',
      },
      {
        name: 'Fade 100% Full',
        weapon: '★ Karambit',
        caseName: 'California High Roller Foil Case',
        rarity: 'knife_special',
        primaryColor: '#ec4899',
        secondaryColor: '#f59e0b',
        patternType: 'marble_fade',
        weaponType: 'karambit',
      },
    ],
  },
];

export function determineFloat(): { wear: SkinWear; float: number } {
  // Weighted float distribution matching Counter-Strike
  const rand = Math.random();
  let float: number;

  if (rand < 0.20) {
    // Factory New: 0.00 - 0.07
    float = Math.random() * 0.07;
    return { wear: 'Factory New', float: parseFloat(float.toFixed(5)) };
  } else if (rand < 0.45) {
    // Minimal Wear: 0.07 - 0.15
    float = 0.07 + Math.random() * 0.08;
    return { wear: 'Minimal Wear', float: parseFloat(float.toFixed(5)) };
  } else if (rand < 0.80) {
    // Field-Tested: 0.15 - 0.38
    float = 0.15 + Math.random() * 0.23;
    return { wear: 'Field-Tested', float: parseFloat(float.toFixed(5)) };
  } else if (rand < 0.93) {
    // Well-Worn: 0.38 - 0.45
    float = 0.38 + Math.random() * 0.07;
    return { wear: 'Well-Worn', float: parseFloat(float.toFixed(5)) };
  } else {
    // Battle-Scarred: 0.45 - 0.99
    float = 0.45 + Math.random() * 0.54;
    return { wear: 'Battle-Scarred', float: parseFloat(float.toFixed(5)) };
  }
}

export function calculateSkinValue(casePrice: number, rarity: SkinRarity, wear: SkinWear, isStatTrak: boolean): number {
  let baseMult = 1.0;
  switch (rarity) {
    case 'mil_spec':
      baseMult = 0.25 + Math.random() * 0.3; // $1,250 - $2,750 on 5k case
      break;
    case 'restricted':
      baseMult = 0.7 + Math.random() * 0.9; // $3,500 - $8,000
      break;
    case 'classified':
      baseMult = 2.0 + Math.random() * 2.5; // $10,000 - $22,500
      break;
    case 'covert':
      baseMult = 6.0 + Math.random() * 9.0; // $30,000 - $75,000
      break;
    case 'knife_special':
      baseMult = 25.0 + Math.random() * 45.0; // $125,000 - $350,000!
      break;
    default:
      baseMult = 0.2;
  }

  let wearMult = 1.0;
  switch (wear) {
    case 'Factory New':
      wearMult = 1.6;
      break;
    case 'Minimal Wear':
      wearMult = 1.25;
      break;
    case 'Field-Tested':
      wearMult = 1.0;
      break;
    case 'Well-Worn':
      wearMult = 0.85;
      break;
    case 'Battle-Scarred':
      wearMult = 0.65;
      break;
  }

  const statTrakMult = isStatTrak ? 1.4 : 1.0;
  const rawValue = Math.round(casePrice * baseMult * wearMult * statTrakMult);
  // Round to nice numbers
  return Math.max(500, Math.round(rawValue / 100) * 100);
}

// Rolls a skin from a case according to high-roller odds
export function rollSkinFromCase(csCase: CSCase): CSSkin {
  const roll = Math.random() * 100;
  let targetRarity: SkinRarity = 'mil_spec';

  // Rarity roll thresholds
  if (roll < 2.0) {
    targetRarity = 'knife_special'; // 2% chance for gold knife!
  } else if (roll < 8.0) {
    targetRarity = 'covert'; // 6% chance for covert red
  } else if (roll < 22.0) {
    targetRarity = 'classified'; // 14% chance for classified pink
  } else if (roll < 45.0) {
    targetRarity = 'restricted'; // 23% chance for purple
  } else {
    targetRarity = 'mil_spec'; // 55% mil-spec
  }

  // Filter possible skins matching rarity, or closest if not found
  let pool = csCase.possibleSkins.filter((s) => s.rarity === targetRarity);
  if (pool.length === 0) {
    pool = csCase.possibleSkins;
  }

  const baseSkin = pool[Math.floor(Math.random() * pool.length)];
  const { wear, float } = determineFloat();
  const isStatTrak = Math.random() < 0.12; // 12% chance of StatTrak
  const value = calculateSkinValue(csCase.price, baseSkin.rarity, wear, isStatTrak);

  return {
    ...baseSkin,
    id: `skin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    wear,
    float,
    statTrak: isStatTrak,
    value,
  };
}

// Generates an array of 50 skins for the high-speed horizontal unboxing carousel
export function generateCarouselSkins(csCase: CSCase, winningSkin: CSSkin, winningIndex: number = 38): CSSkin[] {
  const result: CSSkin[] = [];
  for (let i = 0; i < 50; i++) {
    if (i === winningIndex) {
      result.push(winningSkin);
    } else {
      result.push(rollSkinFromCase(csCase));
    }
  }
  return result;
}
