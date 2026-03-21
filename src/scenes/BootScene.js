// SPRITE SUBSTITUTIONS (Kenney Tiny Dungeon — source tiles in pack):
// boss_kingslime: cyan blob creature (tile_0108) — no discrete green slime tile in export order used
// boss_stormeagle: bat (tile_0120) — no harpy; reads as winged enemy
// boss_irongolem: cyclops (tile_0109) — armored humanoid stand-in for stone/iron golem
// bullet: pale flask (tile_0113) — small rounded icon used as orb/projectile
// floor_tile: solid tan ground (tile_0048) — simple repeating dungeon floor

function scaleSprite(scene, rawKey, finalKey, w, h) {
  const rt = scene.add.renderTexture(0, 0, w, h).setVisible(false);
  const img = scene.add.image(0, 0, rawKey)
    .setDisplaySize(w, h)
    .setOrigin(0, 0)
    .setVisible(false);
  rt.draw(img, 0, 0);
  rt.saveTexture(finalKey);
  img.destroy();
  rt.destroy();
}

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.load.image('_raw_player_brute', 'assets/sprites/knight.png');
    this.load.image('_raw_player_scout', 'assets/sprites/rogue.png');
    this.load.image('_raw_boss_kingslime', 'assets/sprites/slime.png');
    this.load.image('_raw_boss_pyroskull', 'assets/sprites/skull.png');
    this.load.image('_raw_boss_stormeagle', 'assets/sprites/harpy.png');
    this.load.image('_raw_boss_irongolem', 'assets/sprites/golem.png');
    this.load.image('_raw_boss_shadowmimic', 'assets/sprites/ghost.png');
    this.load.image('_raw_boss_kraken', 'assets/sprites/crab.png');
    this.load.image('_raw_boss_voidgod', 'assets/sprites/lich.png');
    this.load.image('_raw_minion', 'assets/sprites/goblin.png');
    this.load.image('_raw_bullet', 'assets/sprites/orb.png');
    this.load.image('_raw_boss_bullet', 'assets/sprites/orb_red.png');
    this.load.image('_raw_floor_tile', 'assets/sprites/floor.png');
  }

  create() {
    const SPRITE_MAP = [
      { raw: '_raw_player_brute', key: 'player_brute', w: 48, h: 48 },
      { raw: '_raw_player_scout', key: 'player_scout', w: 48, h: 48 },
      { raw: '_raw_boss_kingslime', key: 'boss_kingslime', w: 80, h: 80 },
      { raw: '_raw_boss_pyroskull', key: 'boss_pyroskull', w: 80, h: 80 },
      { raw: '_raw_boss_stormeagle', key: 'boss_stormeagle', w: 80, h: 80 },
      { raw: '_raw_boss_irongolem', key: 'boss_irongolem', w: 96, h: 96 },
      { raw: '_raw_boss_shadowmimic', key: 'boss_shadowmimic', w: 80, h: 80 },
      { raw: '_raw_boss_kraken', key: 'boss_kraken', w: 96, h: 96 },
      { raw: '_raw_boss_voidgod', key: 'boss_voidgod', w: 96, h: 96 },
      { raw: '_raw_minion', key: 'minion', w: 32, h: 32 },
      { raw: '_raw_bullet', key: 'bullet', w: 32, h: 32 },
      { raw: '_raw_boss_bullet', key: 'boss_bullet', w: 32, h: 32 },
      { raw: '_raw_floor_tile', key: 'floor_tile', w: 48, h: 48 },
    ];

    SPRITE_MAP.forEach(({ raw, key, w, h }) => scaleSprite(this, raw, key, w, h));

    this.scene.start('MenuScene');
  }
}
