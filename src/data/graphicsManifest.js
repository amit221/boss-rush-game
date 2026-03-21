/**
 * Single source of truth for BootScene texture loading (CC0 — see specs doc).
 * All gameplay sprites: Kenney Tiny Dungeon **only** (one style).
 * Backgrounds use solid black behind the playfield; BossScene adds a subtle tiled floor only.
 */

/** Keyed by BOSS_ORDER / BOSS_CLASSES names */
export const bossTextures = {
  KingSlime: { file: 'assets/sprites/boss_kingslime.png', key: 'boss_kingslime', w: 80, h: 80 },
  PyroSkull: { file: 'assets/sprites/boss_pyroskull.png', key: 'boss_pyroskull', w: 80, h: 80 },
  StormEagle: { file: 'assets/sprites/boss_stormeagle.png', key: 'boss_stormeagle', w: 80, h: 80 },
  IronGolem: { file: 'assets/sprites/boss_irongolem.png', key: 'boss_irongolem', w: 96, h: 96 },
  ShadowMimic: { file: 'assets/sprites/boss_shadowmimic.png', key: 'boss_shadowmimic', w: 80, h: 80 },
  Kraken: { file: 'assets/sprites/boss_kraken.png', key: 'boss_kraken', w: 96, h: 96 },
  VoidGod: { file: 'assets/sprites/boss_voidgod.png', key: 'boss_voidgod', w: 96, h: 96 },
};

/** Keyed by CHARACTERS id — keys match Player / BootScene final texture names */
export const characterTextures = {
  brute: { file: 'assets/sprites/knight.png', key: 'player_brute', w: 48, h: 48 },
  scout: { file: 'assets/sprites/rogue.png', key: 'player_scout', w: 48, h: 48 },
};

/** Minions, bullets, arena floor — scaled into gameplay keys */
export const sharedBattleTextures = [
  { file: 'assets/sprites/minion.png', key: 'minion', w: 32, h: 32 },
  { file: 'assets/sprites/orb.png', key: 'bullet', w: 32, h: 32 },
  { file: 'assets/sprites/orb_red.png', key: 'boss_bullet', w: 32, h: 32 },
  { file: 'assets/sprites/floor.png', key: 'arena_floor', w: 64, h: 64 },
];
