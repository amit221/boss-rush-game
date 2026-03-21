export default class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }

  create() {
    const cx = 640, cy = 360;
    this.add.rectangle(cx, cy, 1280, 720, 0x0a0a00);
    this.add.text(cx, cy - 110, 'VICTORY!', {
      fontSize: '88px', color: '#ffdd00', fontStyle: 'bold',
      stroke: '#ff8800', strokeThickness: 8
    }).setOrigin(0.5);
    this.add.text(cx, cy - 20, 'The Void God has been defeated!', {
      fontSize: '28px', color: '#ffffff'
    }).setOrigin(0.5);
    this.add.text(cx, cy + 30, 'You saved the world... for now.', {
      fontSize: '20px', color: '#aaaaaa'
    }).setOrigin(0.5);
    const again = this.add.text(cx, cy + 120, '[ ENTER to Play Again ]', {
      fontSize: '26px', color: '#44ff44'
    }).setOrigin(0.5);
    this.tweens.add({ targets: again, alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
    this.input.keyboard.once('keydown-ENTER', () => {
      const sm = this.registry.get('shopManager');
      if (sm) sm.reset();
      this.registry.set('bossIndex', 0);
      this.scene.start('CharacterSelectScene');
    });
  }
}
