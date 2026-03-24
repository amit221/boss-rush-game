import { FONT_FAMILY, addMenuBackdrop } from '../ui/theme.js';
import { T } from '../i18n/hebrew.js';
import { playUiConfirm, playUiBack } from '../audio/sfx.js';
import { ensureBgm } from '../audio/music.js';
import { createAudioControls } from '../ui/audioControls.js';

export default class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }

  create() {
    const cx = 640, cy = 360;
    addMenuBackdrop(this);
    this.add.rectangle(cx, cy, 1240, 680, 0x000000, 0.3).setDepth(-9);

    const frame = this.add.graphics().setDepth(-8);
    frame.lineStyle(3, 0x6a4010, 1);
    frame.strokeRect(cx - 280, cy - 235, 560, 470);
    frame.fillStyle(0x8a5520, 1);
    frame.fillRect(cx - 285, cy - 240, 12, 12);
    frame.fillRect(cx + 273, cy - 240, 12, 12);
    frame.fillRect(cx - 285, cy + 228, 12, 12);
    frame.fillRect(cx + 273, cy + 228, 12, 12);

    const confetti = this.add.particles(cx, cy - 100, 'orb', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 600, max: 1200 },
      quantity: 60,
      frequency: -1,
      tint: [0xffcc44, 0xffaa22, 0xffffaa, 0xff8800],
      blendMode: 'ADD',
      depth: 10,
    });
    confetti.explode(60);

    this.add.particles(cx, 720, 'orb', {
      speed: { min: 15, max: 40 },
      angle: { min: 265, max: 275 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: { min: 2000, max: 5000 },
      frequency: 500,
      quantity: 1,
      tint: [0xff8800, 0xffcc44],
      blendMode: 'ADD',
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(-600, 0, 1200, 1)
      },
      depth: 5,
    });

    this.add.text(cx, cy - 110, T.victoryTitle, {
      fontFamily: FONT_FAMILY,
      fontSize: '36px', color: '#ffdd00',
      stroke: '#ff8800', strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(cx, cy - 20, T.victoryLine1, {
      fontFamily: FONT_FAMILY,
      fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(cx, cy + 30, T.victoryLine2, {
      fontFamily: FONT_FAMILY,
      fontSize: '11px', color: '#aaaaaa',
    }).setOrigin(0.5);
    const again = this.add.text(cx, cy + 120, T.playAgain, {
      fontFamily: FONT_FAMILY,
      fontSize: '12px', color: '#44ff44',
    }).setOrigin(0.5);
    this.tweens.add({ targets: again, alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
    const backToMenuEnter = () => {
      playUiConfirm(this);
      this.registry.set('bossIndex', 0);
      this.scene.start('MenuScene');
    };
    const backToMenuEsc = () => {
      playUiBack(this);
      this.registry.set('bossIndex', 0);
      this.scene.start('MenuScene');
    };
    this.input.keyboard.once('keydown-ENTER', backToMenuEnter);
    this.input.keyboard.once('keydown-ESC', backToMenuEsc);

    ensureBgm(this, 'music_menu');
    createAudioControls(this);
  }
}
