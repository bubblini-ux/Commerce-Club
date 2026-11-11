/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Creates high-fidelity procedural textures using HTML5 2D Canvas.
 * Zero external image dependencies - guaranteed zero 404s.
 */

// Iconic Commerce Casino California cardroom carpet:
// Deep ruby/burgundy with gold art-deco geometric interlocking trellis and emerald accents.
export function createCommerceCarpetTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base luxury burgundy
  ctx.fillStyle = '#3a0814';
  ctx.fillRect(0, 0, size, size);

  // Subtle woven fiber noise
  const imgData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    imgData.data[i] = Math.min(255, Math.max(0, imgData.data[i] + noise));
    imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + noise * 0.5));
    imgData.data[i + 2] = Math.min(255, Math.max(0, imgData.data[i + 2] + noise * 0.8));
  }
  ctx.putImageData(imgData, 0, 0);

  // Repeatable geometric art-deco motif (128x128 grid)
  const tileSize = 128;
  for (let x = 0; x < size; x += tileSize) {
    for (let y = 0; y < size; y += tileSize) {
      // Outer gold octagonal diamond
      ctx.save();
      ctx.translate(x + tileSize / 2, y + tileSize / 2);

      // Gold filigree border
      ctx.strokeStyle = '#c69214';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -tileSize * 0.42);
      ctx.lineTo(tileSize * 0.42, 0);
      ctx.lineTo(0, tileSize * 0.42);
      ctx.lineTo(-tileSize * 0.42, 0);
      ctx.closePath();
      ctx.stroke();

      // Inner emerald diamond
      ctx.fillStyle = '#063d27';
      ctx.beginPath();
      ctx.moveTo(0, -tileSize * 0.24);
      ctx.lineTo(tileSize * 0.24, 0);
      ctx.lineTo(0, tileSize * 0.24);
      ctx.lineTo(-tileSize * 0.24, 0);
      ctx.closePath();
      ctx.fill();

      // Center gold rosette / card club pip
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Corner gold pips
      ctx.fillStyle = '#9a7008';
      ctx.fillRect(-tileSize * 0.48, -tileSize * 0.48, 6, 6);
      ctx.fillRect(tileSize * 0.48 - 6, -tileSize * 0.48, 6, 6);
      ctx.fillRect(-tileSize * 0.48, tileSize * 0.48 - 6, 6, 6);
      ctx.fillRect(tileSize * 0.48 - 6, tileSize * 0.48 - 6, 6, 6);

      ctx.restore();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Polished black marble with gold and white calcite veins for borders and pillars
export function createPolishedMarbleTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Dark obsidian charcoal base
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#0d0f12');
  grad.addColorStop(0.5, '#16191f');
  grad.addColorStop(1, '#090a0d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Calcite marble veins
  ctx.strokeStyle = 'rgba(235, 240, 255, 0.25)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    let cx = Math.random() * size;
    let cy = 0;
    ctx.moveTo(cx, cy);
    while (cy < size) {
      cx += (Math.random() - 0.5) * 40;
      cy += 30 + Math.random() * 40;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Golden veins
  ctx.strokeStyle = 'rgba(212, 163, 56, 0.4)';
  ctx.lineWidth = 2.0;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    let cx = 0;
    let cy = Math.random() * size;
    ctx.moveTo(cx, cy);
    while (cx < size) {
      cx += 35 + Math.random() * 40;
      cy += (Math.random() - 0.5) * 50;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// High-Stakes Blackjack Table Felt
export function createBlackjackFeltTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep casino cardroom emerald green
  const grad = ctx.createRadialGradient(w / 2, h * 0.3, 50, w / 2, h / 2, w * 0.6);
  grad.addColorStop(0, '#0d4a2d');
  grad.addColorStop(1, '#062617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Outer border lines
  ctx.strokeStyle = '#d4af37'; // Casino gold
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, w - 40, h - 40);

  // Central Gold Arch Line
  ctx.beginPath();
  ctx.arc(w / 2, 100, 360, 0.25 * Math.PI, 0.75 * Math.PI, false);
  ctx.stroke();

  // Insurance line
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w / 2, 100, 310, 0.28 * Math.PI, 0.72 * Math.PI, false);
  ctx.stroke();

  // Insurance Text
  ctx.fillStyle = '#f3cf65';
  ctx.font = 'bold 15px "Cinzel", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.fillText('INSURANCE PAYS 2 TO 1', w / 2, 385);

  // Header Text
  ctx.font = 'bold 24px "Cinzel", "Times New Roman", serif';
  ctx.fillText('THE COMMERCE CLUB', w / 2, 130);

  ctx.font = 'italic 16px "Times New Roman", serif';
  ctx.fillStyle = '#d4af37';
  ctx.fillText('CALIFORNIA HIGH ROLLER CARDROOM', w / 2, 155);

  ctx.font = 'bold 20px "Cinzel", "Times New Roman", serif';
  ctx.fillText('BLACKJACK PAYS 3 TO 2', w / 2, 210);

  ctx.font = 'bold 14px "Arial", sans-serif';
  ctx.fillStyle = '#a3e635';
  ctx.fillText('Dealer Must Hit Soft 17 · Double on Any 2 Cards', w / 2, 235);

  // 5 Player Bet Positions
  const spots = 5;
  for (let i = 0; i < spots; i++) {
    const angle = 0.32 * Math.PI + (i / (spots - 1)) * (0.36 * Math.PI);
    const sx = w / 2 + Math.cos(angle) * 360;
    const sy = 100 + Math.sin(angle) * 360;

    // Betting box
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sx, sy, 32, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
    ctx.fill();

    // Commerce Club Crest
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('BET', sx, sy + 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// European Roulette Wheel Ring (37 numbers: 0 + 1-36)
export function createRouletteWheelTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const center = size / 2;
  const outerR = size * 0.48;
  const innerR = size * 0.32;

  // Background brass/wood ring
  ctx.fillStyle = '#2b1408';
  ctx.fillRect(0, 0, size, size);

  // European roulette sequence
  const numbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];
  const redNumbers = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
  ]);

  const step = (Math.PI * 2) / numbers.length;

  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    const startAngle = i * step;
    const endAngle = startAngle + step;

    // Pocket color
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, outerR, startAngle, endAngle);
    ctx.closePath();

    if (num === 0) {
      ctx.fillStyle = '#15803d'; // Green 0
    } else if (redNumbers.has(num)) {
      ctx.fillStyle = '#dc2626'; // Vivid red
    } else {
      ctx.fillStyle = '#18181b'; // Black
    }
    ctx.fill();

    // Brass fret dividers
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw number label
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle + step / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(num.toString(), (outerR + innerR) / 2, 0);
    ctx.restore();
  }

  // Inner brass ring
  ctx.beginPath();
  ctx.arc(center, center, innerR, 0, Math.PI * 2);
  ctx.fillStyle = '#c89b3c';
  ctx.fill();
  ctx.strokeStyle = '#784d12';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Center mahogany cone
  ctx.beginPath();
  ctx.arc(center, center, innerR * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = '#3f1a0e';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Roulette Felt Betting Grid
export function createRouletteFeltTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep green felt
  ctx.fillStyle = '#063d24';
  ctx.fillRect(0, 0, w, h);

  // Gold border
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 4;
  ctx.strokeRect(15, 15, w - 30, h - 30);

  // Commerce Title on Felt
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 20px "Cinzel", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.fillText('COMMERCE CASINO CALIFORNIA · HIGH-ROLLER ROULETTE', w / 2, 45);

  const startX = 140;
  const startY = 75;
  const cellW = 65;
  const cellH = 75;

  const redNumbers = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
  ]);

  // Zero box
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(startX - 65, startY, 60, cellH * 3);
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2;
  ctx.strokeRect(startX - 65, startY, 60, cellH * 3);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Arial';
  ctx.fillText('0', startX - 35, startY + cellH * 1.5 + 10);

  // 1-36 grid (3 rows x 12 columns)
  for (let c = 0; c < 12; c++) {
    for (let r = 0; r < 3; r++) {
      const num = c * 3 + (3 - r); // Standard roulette layout
      const x = startX + c * cellW;
      const y = startY + r * cellH;

      ctx.fillStyle = redNumbers.has(num) ? '#b91c1c' : '#18181b';
      ctx.fillRect(x, y, cellW, cellH);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, cellW, cellH);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(num.toString(), x + cellW / 2, y + cellH / 2 + 8);
    }
  }

  // Outside bets (1st 12, 2nd 12, 3rd 12)
  const dozenW = cellW * 4;
  const outsideY = startY + cellH * 3 + 10;
  const outsideH = 45;

  ['1st 12', '2nd 12', '3rd 12'].forEach((label, i) => {
    const x = startX + i * dozenW;
    ctx.fillStyle = '#0f5132';
    ctx.fillRect(x, outsideY, dozenW, outsideH);
    ctx.strokeStyle = '#eab308';
    ctx.strokeRect(x, outsideY, dozenW, outsideH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(label, x + dozenW / 2, outsideY + 28);
  });

  // Low/Even/Red/Black/Odd/High
  const evenBets = ['1 to 18', 'EVEN', 'RED', 'BLACK', 'ODD', '19 to 36'];
  const evenW = (cellW * 12) / 6;
  const evenY = outsideY + outsideH + 8;

  evenBets.forEach((label, i) => {
    const x = startX + i * evenW;
    ctx.fillStyle = label === 'RED' ? '#b91c1c' : label === 'BLACK' ? '#18181b' : '#0f5132';
    ctx.fillRect(x, evenY, evenW, outsideH);
    ctx.strokeStyle = '#eab308';
    ctx.strokeRect(x, evenY, evenW, outsideH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(label, x + evenW / 2, evenY + 28);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Glowing Neon Sign Texture with GTA 6 / Vice neon atmosphere
export function createNeonSignTexture(
  mainText: string,
  subText: string,
  neonColor: string = '#ec4899',
  secondaryColor: string = '#06b6d4'
): THREE.CanvasTexture {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Dark matte backing
  ctx.fillStyle = '#07090e';
  ctx.fillRect(0, 0, w, h);

  // Border neon glow
  ctx.strokeStyle = neonColor;
  ctx.shadowColor = neonColor;
  ctx.shadowBlur = 15;
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  // Main Neon Glow Text
  ctx.shadowColor = neonColor;
  ctx.shadowBlur = 25;
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 64px "Arial Black", "Impact", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(mainText, w / 2, 115);

  // Second pass for intense neon center core
  ctx.shadowBlur = 4;
  ctx.fillStyle = neonColor;
  ctx.fillText(mainText, w / 2, 115);

  // Subtext in secondary neon (cyan / gold)
  ctx.shadowColor = secondaryColor;
  ctx.shadowBlur = 18;
  ctx.font = 'bold 26px "Arial", sans-serif';
  ctx.fillStyle = secondaryColor;
  ctx.fillText(subText, w / 2, 185);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural dynamic texture for CS knife & gun weapon inspection
export function createCSSkinCanvasTexture(
  patternType: string,
  primaryColor: string,
  secondaryColor: string
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  if (patternType === 'marble_fade') {
    // Marble Fade tri-color gradient (Red, Blue, Yellow)
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#ef4444');
    grad.addColorStop(0.35, '#a855f7');
    grad.addColorStop(0.7, '#3b82f6');
    grad.addColorStop(1, '#eab308');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Subtle smokey swirls
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, 30 + Math.random() * 80, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (patternType === 'doppler') {
    // Doppler Phase 2 Pink Galaxy
    const grad = ctx.createRadialGradient(size * 0.4, size * 0.4, 20, size / 2, size / 2, size * 0.8);
    grad.addColorStop(0, '#f43f5e'); // Neon pink
    grad.addColorStop(0.5, '#7e22ce'); // Deep purple
    grad.addColorStop(1, '#0f172a'); // Black
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Galaxy star dust
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 200; i++) {
      ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
    }
  } else if (patternType === 'dragon' || patternType === 'lore') {
    // Gold dragon scales / knotwork
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    const step = 32;
    for (let x = 0; x < size; x += step) {
      for (let y = 0; y < size; y += step) {
        ctx.beginPath();
        ctx.arc(x + step / 2, y, step / 2, 0, Math.PI);
        ctx.stroke();
      }
    }
  } else {
    // Neon Cyber / Hyper Beast
    const grad = ctx.createLinearGradient(0, 0, size, 0);
    grad.addColorStop(0, primaryColor);
    grad.addColorStop(1, secondaryColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Diagonal futuristic hazard stripes
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    for (let i = -size; i < size * 2; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 20, 0);
      ctx.lineTo(i + 20 + size, size);
      ctx.lineTo(i + size, size);
      ctx.closePath();
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
