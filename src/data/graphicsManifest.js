/**
 * Single source of truth for BootScene texture loading (CC0 — see specs doc).
 * All gameplay sprites: Kenney Tiny Dungeon **only** (one style).
 * Backgrounds use solid black behind the playfield; BossScene adds a tiled floor (Kenney Tiny Dungeon tile, CC0).
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
  // Runtime-generated silhouettes (swap for Kenney file + `file` when art exists)
  AshWraith: { procedural: 'ashwraith', key: 'boss_ashwraith', w: 80, h: 80 },
  CrystalMatriarch: { procedural: 'crystal', key: 'boss_crystalmatriarch', w: 88, h: 88 },
  ClockworkJudge: { procedural: 'clockwork', key: 'boss_clockworkjudge', w: 80, h: 80 },
  TwinBinder: { procedural: 'twinbinder', key: 'boss_twinbinder', w: 84, h: 84 },
  SporeSovereign: { procedural: 'spore', key: 'boss_sporesovereign', w: 88, h: 88 },
  RunicColossus: { procedural: 'runic', key: 'boss_runiccolossus', w: 96, h: 96 },
  HiveCrown: { procedural: 'hive', key: 'boss_hivecrown', w: 88, h: 88 },
  PrismPhantom: { procedural: 'prism', key: 'boss_prismphantom', w: 80, h: 80 },
  Tidebreaker: { procedural: 'tide', key: 'boss_tidebreaker', w: 96, h: 80 },
  SolarWarden: { procedural: 'solar', key: 'boss_solarwarden', w: 88, h: 88 },
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
  // Single 16×16 tile scaled to 64×64 for crisp tiling (see assets/sprites/CREDITS.txt)
  { file: 'assets/sprites/floor.png', key: 'arena_floor', w: 64, h: 64 },
];
