/**
 * Visual theme for the boss arena: base void, tiled floor, wall trim, optional grid overlay, parallax scroll.
 * Keys must match BOSS_ORDER boss class names.
 */
export const ARENA_FLOOR_STYLES = {
  KingSlime: {
    voidColor: 0x040806,
    floorTint: 0x6d9d72,
    tileScale: 4,
    pattern: 'grid',
    patternStep: 96,
    patternColor: 0x2d4a30,
    patternAlpha: 0.14,
    wallFill: 0x1a3020,
    wallStroke: 0x3d6a48,
    scrollVx: 0.012,
    scrollVy: 0.008,
  },
  PyroSkull: {
    voidColor: 0x120604,
    floorTint: 0xc87048,
    tileScale: 4,
    pattern: 'diagonal',
    patternStep: 72,
    patternColor: 0x5a2010,
    patternAlpha: 0.16,
    wallFill: 0x3a1808,
    wallStroke: 0x8a4020,
    scrollVx: 0.018,
    scrollVy: 0.01,
  },
  StormEagle: {
    voidColor: 0x060810,
    floorTint: 0x7a8ca8,
    tileScale: 3.85,
    pattern: 'grid',
    patternStep: 80,
    patternColor: 0x283448,
    patternAlpha: 0.12,
    wallFill: 0x182030,
    wallStroke: 0x405878,
    scrollVx: 0.02,
    scrollVy: 0.004,
  },
  IronGolem: {
    voidColor: 0x080808,
    floorTint: 0x9898a0,
    tileScale: 4.1,
    pattern: 'grid',
    patternStep: 64,
    patternColor: 0x303038,
    patternAlpha: 0.18,
    wallFill: 0x222228,
    wallStroke: 0x585868,
    scrollVx: 0.006,
    scrollVy: 0.006,
  },
  ShadowMimic: {
    voidColor: 0x05040a,
    floorTint: 0x6a5888,
    tileScale: 4,
    pattern: 'diagonal',
    patternStep: 56,
    patternColor: 0x201830,
    patternAlpha: 0.2,
    wallFill: 0x1a1428,
    wallStroke: 0x483868,
    scrollVx: 0.008,
    scrollVy: -0.014,
  },
  Kraken: {
    voidColor: 0x02060c,
    floorTint: 0x4a7898,
    tileScale: 4,
    pattern: 'wave',
    patternStep: 88,
    patternColor: 0x183040,
    patternAlpha: 0.11,
    wallFill: 0x102030,
    wallStroke: 0x305878,
    scrollVx: 0.015,
    scrollVy: 0.012,
  },
  VoidGod: {
    voidColor: 0x030208,
    floorTint: 0x584878,
    tileScale: 4.2,
    pattern: 'grid',
    patternStep: 112,
    patternColor: 0x201838,
    patternAlpha: 0.22,
    wallFill: 0x140818,
    wallStroke: 0x403060,
    scrollVx: -0.01,
    scrollVy: 0.016,
  },
  AshWraith: {
    voidColor: 0x0a0a0a,
    floorTint: 0x8a8680,
    tileScale: 4,
    pattern: 'grid',
    patternStep: 72,
    patternColor: 0x383430,
    patternAlpha: 0.15,
    wallFill: 0x222220,
    wallStroke: 0x505048,
    scrollVx: 0.005,
    scrollVy: 0.02,
  },
  CrystalMatriarch: {
    voidColor: 0x030c10,
    floorTint: 0x78c8d8,
    tileScale: 3.9,
    pattern: 'diagonal',
    patternStep: 64,
    patternColor: 0x205868,
    patternAlpha: 0.13,
    wallFill: 0x143840,
    wallStroke: 0x4890a0,
    scrollVx: 0.01,
    scrollVy: -0.01,
  },
  ClockworkJudge: {
    voidColor: 0x0c0804,
    floorTint: 0xb89858,
    tileScale: 4,
    pattern: 'grid',
    patternStep: 48,
    patternColor: 0x403018,
    patternAlpha: 0.17,
    wallFill: 0x281c10,
    wallStroke: 0x786030,
    scrollVx: 0.022,
    scrollVy: 0,
  },
  TwinBinder: {
    voidColor: 0x060610,
    floorTint: 0x7868a8,
    tileScale: 4,
    pattern: 'cross',
    patternStep: 80,
    patternColor: 0x282040,
    patternAlpha: 0.14,
    wallFill: 0x181828,
    wallStroke: 0x484878,
    scrollVx: 0.01,
    scrollVy: 0.01,
  },
  SporeSovereign: {
    voidColor: 0x050804,
    floorTint: 0x6a9850,
    tileScale: 4.05,
    pattern: 'dots',
    patternStep: 56,
    patternColor: 0x284018,
    patternAlpha: 0.16,
    wallFill: 0x203018,
    wallStroke: 0x486838,
    scrollVx: 0.008,
    scrollVy: 0.018,
  },
  RunicColossus: {
    voidColor: 0x100804,
    floorTint: 0xa88860,
    tileScale: 4,
    pattern: 'grid',
    patternStep: 88,
    patternColor: 0x403020,
    patternAlpha: 0.15,
    wallFill: 0x281808,
    wallStroke: 0x684828,
    scrollVx: 0.007,
    scrollVy: 0.007,
  },
  HiveCrown: {
    voidColor: 0x0c0802,
    floorTint: 0xd0a848,
    tileScale: 3.95,
    pattern: 'hexish',
    patternStep: 52,
    patternColor: 0x483010,
    patternAlpha: 0.14,
    wallFill: 0x302008,
    wallStroke: 0x886020,
    scrollVx: 0.014,
    scrollVy: 0.012,
  },
  PrismPhantom: {
    voidColor: 0x080610,
    floorTint: 0xa898d8,
    tileScale: 4,
    pattern: 'diagonal',
    patternStep: 48,
    patternColor: 0x383060,
    patternAlpha: 0.12,
    wallFill: 0x201830,
    wallStroke: 0x605090,
    scrollVx: -0.012,
    scrollVy: 0.012,
  },
  Tidebreaker: {
    voidColor: 0x020810,
    floorTint: 0x5890a8,
    tileScale: 4,
    pattern: 'wave',
    patternStep: 72,
    patternColor: 0x183848,
    patternAlpha: 0.12,
    wallFill: 0x102838,
    wallStroke: 0x386878,
    scrollVx: 0.016,
    scrollVy: 0.006,
  },
  SolarWarden: {
    voidColor: 0x0c0a04,
    floorTint: 0xe0c060,
    tileScale: 4,
    pattern: 'grid',
    patternStep: 64,
    patternColor: 0x504018,
    patternAlpha: 0.13,
    wallFill: 0x302010,
    wallStroke: 0x886830,
    scrollVx: 0.011,
    scrollVy: -0.009,
  },
};

const DEFAULT_STYLE = {
  voidColor: 0x000000,
  floorTint: 0xb0906a,
  tileScale: 4,
  pattern: 'grid',
  patternStep: 80,
  patternColor: 0x302010,
  patternAlpha: 0.12,
  wallFill: 0x2a1800,
  wallStroke: 0x5a3010,
  scrollVx: 0.01,
  scrollVy: 0.008,
};

export function getArenaFloorStyle(bossName) {
  return { ...DEFAULT_STYLE, ...(ARENA_FLOOR_STYLES[bossName] || {}) };
}

/** @param {Phaser.GameObjects.Graphics} g */
export function drawArenaFloorPattern(g, style) {
  const type = style.pattern || 'none';
  if (type === 'none') return;

  const W = 1600;
  const H = 1200;
  const step = style.patternStep ?? 80;
  const color = style.patternColor ?? 0x302010;
  const alpha = style.patternAlpha ?? 0.12;

  g.clear();
  g.lineStyle(1, color, alpha);

  if (type === 'grid') {
    for (let x = 0; x <= W; x += step) {
      g.lineBetween(x, 0, x, H);
    }
    for (let y = 0; y <= H; y += step) {
      g.lineBetween(0, y, W, y);
    }
    return;
  }

  if (type === 'diagonal') {
    for (let i = -H; i <= W + H; i += step) {
      g.lineBetween(i, 0, i + H, H);
    }
    return;
  }

  if (type === 'cross') {
    for (let i = -H; i <= W + H; i += step) {
      g.lineBetween(i, 0, i + H, H);
      g.lineBetween(i, H, i + H, 0);
    }
    return;
  }

  if (type === 'wave') {
    const rows = Math.ceil(H / step);
    for (let r = 0; r <= rows; r++) {
      const y = r * step;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= W; x += 40) {
        const wobble = Math.sin(x / 120 + r * 0.8) * 6;
        g.lineTo(x, y + wobble);
      }
      g.strokePath();
    }
    return;
  }

  if (type === 'dots') {
    g.fillStyle(color, alpha * 1.2);
    const r = Math.max(2, Math.floor(step / 14));
    for (let x = step / 2; x < W; x += step) {
      for (let y = step / 2; y < H; y += step) {
        g.fillCircle(x, y, r);
      }
    }
    return;
  }

  if (type === 'hexish') {
    for (let y = 0; y <= H; y += step) {
      const off = (y / step) % 2 === 0 ? 0 : step / 2;
      for (let x = -step; x <= W + step; x += step) {
        g.lineBetween(x + off, y, x + off + step / 2, y + step * 0.55);
        g.lineBetween(x + off + step / 2, y + step * 0.55, x + off, y + step * 1.1);
      }
    }
  }
}

