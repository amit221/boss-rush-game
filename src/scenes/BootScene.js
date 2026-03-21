import {
  BACKGROUNDS,
  bossTextures,
  characterTextures,
  sharedBattleTextures,
} from '../data/graphicsManifest.js';

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
    Object.values(BACKGROUNDS).forEach(({ key, file }) => {
      this.load.image(key, file);
    });

    const queue = [
      ...Object.values(characterTextures),
      ...Object.values(bossTextures),
      ...sharedBattleTextures,
    ];
    queue.forEach(({ key, file }) => {
      this.load.image(`_raw_${key}`, file);
    });
  }

  create() {
    const scaled = [
      ...Object.values(characterTextures),
      ...Object.values(bossTextures),
      ...sharedBattleTextures,
    ];
    scaled.forEach(({ key, w, h }) => {
      scaleSprite(this, `_raw_${key}`, key, w, h);
    });

    this.scene.start('MenuScene');
  }
}
