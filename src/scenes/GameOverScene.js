export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create() {
    const cx = 640, cy = 360;
    this.add.rectangle(cx, cy, 1280, 720, 0x0a0000);
    this.add.text(cx, cy - 100, 'GAME OVER', {
      fontSize: '80px', color: '#ff4444', fontStyle: 'bold',
      stroke: '#880000', strokeThickness: 8
    }).setOrigin(0.5);
    const playerCount = this.registry.get('playerCount') ?? 2;
    this.add.text(cx, cy, playerCount === 1 ? 'Your hero fell...' : 'Both heroes fell...', {
      fontSize: '28px', color: '#aaaaaa'
    }).setOrigin(0.5);
    const retry = this.add.text(cx, cy + 110, '[ ENTER to Try Again ]', {
      fontSize: '26px', color: '#ffffff'
    }).setOrigin(0.5);
    this.tweens.add({ targets: retry, alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
    this.input.keyboard.once('keydown-ENTER', () => {
      this.registry.set('bossIndex', 0);
      this.scene.start('CharacterSelectScene');
    });
  }
}
