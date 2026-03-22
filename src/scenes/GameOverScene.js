import { FONT_FAMILY, addMenuBackdrop } from '../ui/theme.js';
import { playUiConfirm, playUiBack } from '../audio/sfx.js';
import { ensureBgm } from '../audio/music.js';
import { createAudioControls } from '../ui/audioControls.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create() {
    const cx = 640, cy = 360;
    addMenuBackdrop(this);
    this.add.rectangle(cx, cy, 1240, 680, 0x000000, 0.35).setDepth(-9);

    const frame = this.add.graphics().setDepth(-8);
    frame.lineStyle(3, 0x6a4010, 1);
    frame.strokeRect(cx - 280, cy - 235, 560, 470);
    frame.fillStyle(0x8a5520, 1);
    frame.fillRect(cx - 285, cy - 240, 12, 12);
    frame.fillRect(cx + 273, cy - 240, 12, 12);
    frame.fillRect(cx - 285, cy + 228, 12, 12);
    frame.fillRect(cx + 273, cy + 228, 12, 12);

    const burst = this.add.particles(cx, cy - 200, 'orb', {
      speed: { min: 80, max: 200 },
      angle: { min: 30, max: 150 },
      scale: { start: 0.35, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 400, max: 900 },
      quantity: 30,
      frequency: -1,
      tint: [0xff4400, 0xff8800, 0xffcc44],
      blendMode: 'ADD',
      depth: 10,
    });
    burst.explode(30);

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

    this.add.text(cx, cy - 100, 'GAME OVER', {
      fontFamily: FONT_FAMILY,
      fontSize: '32px', color: '#ff3300',
      stroke: '#1a0000', strokeThickness: 6,
    }).setOrigin(0.5);
    const playerCount = this.registry.get('playerCount') ?? 1;
    this.add.text(cx, cy, playerCount === 1 ? 'Your hero fell...' : 'Both heroes fell...', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px', color: '#aaaaaa',
    }).setOrigin(0.5);
    const retry = this.add.text(cx, cy + 110, '[ ENTER to Try Again ]', {
      fontFamily: FONT_FAMILY,
      fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5);
    this.tweens.add({ targets: retry, alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
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
