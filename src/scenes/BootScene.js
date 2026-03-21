export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    const textures = {
      player_brute:    { w: 40,  h: 40,  color: 0x4488ff },
      player_scout:    { w: 40,  h: 40,  color: 0xff8844 },
      boss_kingslime:  { w: 80,  h: 80,  color: 0x44ff44 },
      boss_pyroskull:  { w: 70,  h: 70,  color: 0xff4400 },
      boss_stormeagle: { w: 80,  h: 70,  color: 0xffff00 },
      boss_irongolem:  { w: 90,  h: 90,  color: 0x888888 },
      boss_shadowmimic:{ w: 60,  h: 80,  color: 0x440044 },
      boss_kraken:     { w: 100, h: 80,  color: 0x004488 },
      boss_voidgod:    { w: 90,  h: 90,  color: 0x220033 },
      minion:          { w: 24,  h: 24,  color: 0x88ff88 },
      bullet:          { w: 8,   h: 8,   color: 0xffffff },
      boss_bullet:     { w: 10,  h: 10,  color: 0xff4444 },
    };

    Object.entries(textures).forEach(([key, { w, h, color }]) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(color, 1);
      g.fillRect(0, 0, w, h);
      g.generateTexture(key, w, h);
      g.destroy();
    });
  }

  create() {
    this.scene.start('MenuScene');
  }
}
