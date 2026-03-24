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

/** Placeholder silhouettes until Kenney PNGs exist for endgame bosses. */
function generateProceduralBossTexture(scene, { key, w, h, procedural: style }) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const cx = w / 2;
  const cy = h / 2;
  g.fillStyle(0x000000, 0);
  g.fillRect(0, 0, w, h);

  const draw = {
    ashwraith: () => {
      g.fillStyle(0x3a2a2a, 1);
      g.fillEllipse(cx, cy + 4, w * 0.45, h * 0.55);
      g.fillStyle(0x887766, 0.9);
      g.fillEllipse(cx, cy - 6, w * 0.35, h * 0.4);
      g.fillStyle(0xff4444, 1);
      g.fillCircle(cx - 10, cy - 4, 4);
      g.fillCircle(cx + 10, cy - 4, 4);
    },
    crystal: () => {
      g.fillStyle(0x446688, 1);
      g.fillTriangle(cx, 6, w - 8, h - 10, 8, h - 10);
      g.fillStyle(0xaaddff, 1);
      g.fillTriangle(cx, 14, w - 16, h - 18, 16, h - 18);
      g.fillStyle(0xffffff, 0.7);
      g.fillCircle(cx - 8, cy - 4, 5);
    },
    clockwork: () => {
      g.fillStyle(0x665533, 1);
      g.fillCircle(cx, cy, Math.min(w, h) * 0.38);
      g.fillStyle(0xccaa66, 1);
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        g.fillCircle(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22, 6);
      }
      g.fillStyle(0x222222, 1);
      g.fillCircle(cx, cy, 10);
    },
    twinbinder: () => {
      g.fillStyle(0x553344, 1);
      g.fillCircle(cx - 18, cy, 22);
      g.fillCircle(cx + 18, cy, 22);
      g.lineStyle(4, 0xff88aa, 1);
      g.lineBetween(cx - 12, cy, cx + 12, cy);
    },
    spore: () => {
      g.fillStyle(0x224422, 1);
      g.fillCircle(cx, cy, Math.min(w, h) * 0.42);
      g.fillStyle(0x66cc55, 1);
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 * i) / 12;
        g.fillCircle(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18, 4);
      }
    },
    runic: () => {
      g.fillStyle(0x4a3018, 1);
      g.fillRoundedRect(8, 10, w - 16, h - 20, 6);
      g.fillStyle(0xffaa44, 1);
      g.fillRect(cx - 4, 12, 8, h - 24);
      g.fillRect(12, cy - 4, w - 24, 8);
    },
    hive: () => {
      g.fillStyle(0x553300, 1);
      for (let i = 0; i < 6; i++) {
        const a1 = (Math.PI / 3) * i - Math.PI / 2;
        const a2 = (Math.PI / 3) * (i + 1) - Math.PI / 2;
        g.fillTriangle(
          cx, cy,
          cx + Math.cos(a1) * 28, cy + Math.sin(a1) * 28,
          cx + Math.cos(a2) * 28, cy + Math.sin(a2) * 28
        );
      }
      g.fillStyle(0xffdd44, 1);
      g.fillCircle(cx, cy, 12);
    },
    prism: () => {
      g.fillStyle(0x6644aa, 1);
      g.fillTriangle(cx - 22, cy + 20, cx + 22, cy + 20, cx, cy - 22);
      g.fillStyle(0xff6688, 0.85);
      g.fillTriangle(cx - 10, cy + 10, cx + 4, cy + 10, cx - 4, cy - 8);
      g.fillStyle(0x88ffcc, 0.85);
      g.fillTriangle(cx + 4, cy + 10, cx + 18, cy + 10, cx + 10, cy - 8);
    },
    tide: () => {
      g.fillStyle(0x224466, 1);
      g.fillEllipse(cx, cy, w * 0.85, h * 0.5);
      g.fillStyle(0x55aadd, 1);
      g.fillEllipse(cx - 10, cy - 6, w * 0.55, h * 0.28);
      g.fillEllipse(cx + 14, cy + 4, w * 0.4, h * 0.22);
    },
    solar: () => {
      g.fillStyle(0xffcc22, 1);
      g.fillCircle(cx, cy, 18);
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI * 2 * i) / 10;
        g.fillStyle(0xffee88, 1);
        g.fillTriangle(
          cx + Math.cos(a) * 12,
          cy + Math.sin(a) * 12,
          cx + Math.cos(a) * 36,
          cy + Math.sin(a) * 36,
          cx + Math.cos(a + 0.25) * 24,
          cy + Math.sin(a + 0.25) * 24
        );
      }
    },
  };

  (draw[style] || draw.ashwraith)();
  g.generateTexture(key, w, h);
  g.destroy();
  setNearestFilter(scene, key);
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
      if (entry.procedural) {
        generateProceduralBossTexture(this, entry);
        return;
      }
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
    const mk = (key, fill, stroke = 0x333333) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(stroke, 1);
      g.fillRoundedRect(0, 0, 26, 26, 5);
      g.fillStyle(fill, 1);
      g.fillRoundedRect(2, 2, 22, 22, 4);
      g.generateTexture(key, 26, 26);
      g.destroy();
      setNearestFilter(this, key);
    };
    mk('icon_weapon_default', 0x4488cc);
    getShopWeaponIds().forEach((id) => {
      const c = WEAPONS[id].visuals?.hitColor ?? 0xffffff;
      mk(`icon_weapon_${id}`, c);
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
