import {
  bossTextures,
  characterTextures,
  sharedBattleTextures,
} from '../data/graphicsManifest.js';
import { WEAPONS, getShopWeaponIds } from '../data/weapons.js';
import { SFX_FILES, MUSIC_FILES } from '../data/audioManifest.js';

function setNearestFilter(scene, textureKey) {
  const tex = scene.textures.get(textureKey);
  if (tex && typeof tex.setFilter === 'function') {
    tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}

function scaleSprite(scene, rawKey, finalKey, w, h) {
  setNearestFilter(scene, rawKey);
  const rt = scene.add.renderTexture(0, 0, w, h).setVisible(false);
  const img = scene.add.image(0, 0, rawKey)
    .setDisplaySize(w, h)
    .setOrigin(0, 0)
    .setVisible(false);
  rt.draw(img, 0, 0);
  rt.saveTexture(finalKey);
  setNearestFilter(scene, finalKey);
  img.destroy();
  rt.destroy();
}

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    const queue = [
      ...Object.values(characterTextures),
      ...Object.values(bossTextures),
      ...sharedBattleTextures,
    ];
    Object.entries(SFX_FILES).forEach(([key, file]) => {
      this.load.audio(key, file);
    });
    Object.entries(MUSIC_FILES).forEach(([key, file]) => {
      this.load.audio(key, file);
    });

    queue.forEach((entry) => {
      if (!entry.file) return;
      const { key, file } = entry;
      // TileSprite cannot use textures from RenderTexture.saveTexture() (dynamic).
      // Load floor as a normal image texture so BossScene's tileSprite works.
      if (key === 'arena_floor') {
        this.load.image('arena_floor', file);
      } else {
        this.load.image(`_raw_${key}`, file);
      }
    });
  }

  create() {
    const scaled = [
      ...Object.values(characterTextures),
      ...Object.values(bossTextures),
      ...sharedBattleTextures,
    ];
    scaled.forEach((entry) => {
      const { key, w, h } = entry;
      if (key === 'arena_floor') {
        setNearestFilter(this, 'arena_floor');
      } else {
        scaleSprite(this, `_raw_${key}`, key, w, h);
      }
    });

    this._createWeaponTextures();
    this._createShopWeaponIcons();
    this.scene.start('MenuScene');
  }

  _createShopWeaponIcons() {
    const stroke = 0x333333;
    const drawBorder = (g, fill) => {
      g.fillStyle(stroke, 1);
      g.fillRoundedRect(0, 0, 26, 26, 5);
      g.fillStyle(fill, 1);
      g.fillRoundedRect(2, 2, 22, 22, 4);
    };
    /** Solid-color fallback when bullet texture is missing */
    const mkSolid = (key, fill) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      drawBorder(g, fill);
      g.generateTexture(key, 26, 26);
      g.destroy();
      setNearestFilter(this, key);
    };
    const mkFromBullet = (key, bulletKey, accent) => {
      if (!this.textures.exists(bulletKey)) {
        mkSolid(key, accent);
        return;
      }
      const rt = this.add.renderTexture(0, 0, 26, 26).setVisible(false);
      const border = this.make.graphics({ x: 0, y: 0, add: false });
      drawBorder(border, accent);
      rt.draw(border, 0, 0);
      border.destroy();

      const img = this.add.image(0, 0, bulletKey).setOrigin(0, 0).setVisible(false);
      const inner = 22;
      const pad = 2;
      const sc = Math.min(inner / img.width, inner / img.height, 1);
      img.setScale(sc);
      const dw = img.displayWidth;
      const dh = img.displayHeight;
      const dx = pad + (inner - dw) / 2;
      const dy = pad + (inner - dh) / 2;
      rt.draw(img, dx, dy);
      img.destroy();
      rt.saveTexture(key);
      rt.destroy();
      setNearestFilter(this, key);
    };

    mkFromBullet('icon_weapon_default', 'bullet_default', 0x4488cc);
    getShopWeaponIds().forEach((id) => {
      const w = WEAPONS[id];
      const bulletKey = w.visuals?.bulletTexture ?? 'bullet_default';
      const accent = w.visuals?.hitColor ?? 0xffffff;
      mkFromBullet(`icon_weapon_${id}`, bulletKey, accent);
    });
  }

  _createWeaponTextures() {
    // Default Gun — round blue orb 12×12
    const gDefault = this.make.graphics({ x: 0, y: 0, add: false });
    gDefault.fillStyle(0x2266cc, 1);
    gDefault.fillCircle(6, 6, 6);
    gDefault.fillStyle(0x88ccff, 0.8);
    gDefault.fillCircle(4, 4, 3);
    gDefault.generateTexture('bullet_default', 12, 12);
    gDefault.destroy();

    // Shotgun pellet — small orange circle 8×8
    const gPellet = this.make.graphics({ x: 0, y: 0, add: false });
    gPellet.fillStyle(0xdd6600, 1);
    gPellet.fillCircle(4, 4, 4);
    gPellet.fillStyle(0xffcc66, 0.6);
    gPellet.fillCircle(3, 3, 2);
    gPellet.generateTexture('bullet_pellet', 8, 8);
    gPellet.destroy();

    // Sniper bolt — elongated white rectangle 16×4
    const gBolt = this.make.graphics({ x: 0, y: 0, add: false });
    gBolt.fillStyle(0xffffff, 1);
    gBolt.fillRect(0, 0, 16, 4);
    gBolt.fillStyle(0x88ccff, 0.7);
    gBolt.fillRect(2, 1, 10, 2);
    gBolt.generateTexture('bullet_bolt', 16, 4);
    gBolt.destroy();

    // Boomerang blade — rounded green rectangle 16×6
    const gBlade = this.make.graphics({ x: 0, y: 0, add: false });
    gBlade.fillStyle(0x44bb22, 1);
    gBlade.fillRoundedRect(0, 0, 16, 6, 2);
    gBlade.fillStyle(0xaaffaa, 0.6);
    gBlade.fillRoundedRect(2, 1, 10, 3, 1);
    gBlade.generateTexture('bullet_blade', 16, 6);
    gBlade.destroy();

    // Flamethrower — vertical flame ellipse 10×12
    const gFlame = this.make.graphics({ x: 0, y: 0, add: false });
    gFlame.fillStyle(0xcc3300, 1);
    gFlame.fillEllipse(5, 6, 8, 12);
    gFlame.fillStyle(0xff8800, 0.8);
    gFlame.fillEllipse(5, 7, 5, 7);
    gFlame.generateTexture('bullet_flame', 10, 12);
    gFlame.destroy();

    const mkCircle = (key, w, fill, inner) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(fill, 1);
      g.fillCircle(w / 2, w / 2, w / 2);
      if (inner != null) {
        g.fillStyle(inner, 0.85);
        g.fillCircle(w / 2 - 1, w / 2 - 1, w / 4);
      }
      g.generateTexture(key, w, w);
      g.destroy();
    };

    mkCircle('bullet_poison', 12, 0x226611, 0x66ff44);
    mkCircle('bullet_small', 8, 0x777777, 0xcccccc);
    mkCircle('bullet_plasma', 14, 0x883388, 0xffaaee);
    mkCircle('bullet_large', 18, 0x553322, 0xaa7744);
    mkCircle('bullet_void', 12, 0x220033, 0xaa66ff);
    mkCircle('bullet_meteor', 14, 0x662200, 0xff6622);
    mkCircle('bullet_tesla', 14, 0x666622, 0xffff66);

    const gIce = this.make.graphics({ x: 0, y: 0, add: false });
    gIce.fillStyle(0x88ccff, 1);
    gIce.fillTriangle(6, 0, 12, 14, 0, 14);
    gIce.generateTexture('bullet_ice', 12, 14);
    gIce.destroy();

    const gNeedle = this.make.graphics({ x: 0, y: 0, add: false });
    gNeedle.fillStyle(0xeeddcc, 1);
    gNeedle.fillRect(0, 1, 12, 4);
    gNeedle.generateTexture('bullet_needle', 12, 6);
    gNeedle.destroy();

    const gAcid = this.make.graphics({ x: 0, y: 0, add: false });
    gAcid.fillStyle(0x66aa11, 1);
    gAcid.fillCircle(5, 5, 5);
    gAcid.fillStyle(0xccff44, 0.9);
    gAcid.fillCircle(7, 7, 3);
    gAcid.generateTexture('bullet_acid', 10, 10);
    gAcid.destroy();

    const gPrism = this.make.graphics({ x: 0, y: 0, add: false });
    gPrism.fillStyle(0xff88cc, 1);
    gPrism.fillTriangle(5, 0, 10, 9, 0, 9);
    gPrism.generateTexture('bullet_prism', 10, 10);
    gPrism.destroy();

    const keys = [
      'bullet_default', 'bullet_pellet', 'bullet_bolt', 'bullet_blade', 'bullet_flame',
      'bullet_poison', 'bullet_small', 'bullet_plasma', 'bullet_ice', 'bullet_needle',
      'bullet_large', 'bullet_acid', 'bullet_void', 'bullet_meteor', 'bullet_tesla', 'bullet_prism',
    ];
    keys.forEach((key) => setNearestFilter(this, key));
  }
}
