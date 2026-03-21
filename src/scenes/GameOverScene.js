import { FONT_FAMILY } from '../ui/theme.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create() {
    const cx = 640, cy = 360;
    this.add.image(cx, cy, 'bg_menu').setDepth(-10).setDisplaySize(1280, 720);
    this.add.rectangle(cx, cy, 1280, 720, 0x2a0000, 0.7).setDepth(-9);
    this.add.text(cx, cy - 100, 'GAME OVER', {
      fontFamily: FONT_FAMILY,
      fontSize: '32px', color: '#ff4444',
      stroke: '#880000', strokeThickness: 6,
    }).setOrigin(0.5);
    const playerCount = this.registry.get('playerCount') ?? 2;
    this.add.text(cx, cy, playerCount === 1 ? 'Your hero fell...' : 'Both heroes fell...', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px', color: '#aaaaaa',
    }).setOrigin(0.5);
    const retry = this.add.text(cx, cy + 110, '[ ENTER to Try Again ]', {
      fontFamily: FONT_FAMILY,
      fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5);
    this.tweens.add({ targets: retry, alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
    this.input.keyboard.once('keydown-ENTER', () => {
      this.registry.set('bossIndex', 0);
      this.scene.start('MenuScene');
    });
  }
}
