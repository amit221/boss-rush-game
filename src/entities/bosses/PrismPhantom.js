import BaseBoss from './BaseBoss.js';

export default class PrismPhantom extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_prismphantom', { hp: 4000 });
    this.setDisplaySize(70, 70);
    this._blinkCd = 4500;
    this._lastBlink = 0;
    this._burstCd = 1800;
    this._lastBurst = 0;
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._blinkCd = 3000;
      this._burstCd = 1100;
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    const target = alive.reduce((a, b) =>
      Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y) <
      Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y) ? a : b
    );
    this.scene.physics.moveToObject(this, target, 62);

    if (time - this._lastBlink > this._blinkCd) {
      this._lastBlink = time;
      const nx = Phaser.Math.Clamp(target.x + Phaser.Math.Between(-280, 280), 200, 1400);
      const ny = Phaser.Math.Clamp(target.y + Phaser.Math.Between(-220, 220), 200, 1000);
      this.scene.tweens.add({
        targets: this,
        alpha: 0.05,
        duration: 180,
        onComplete: () => {
          this.setPosition(nx, ny);
          this.setAlpha(1);
        },
      });
    }

    if (time - this._lastBurst > this._burstCd) {
      this._lastBurst = time;
      const base = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y) * (180 / Math.PI);
      this.emit('spawnBossBullet', this.x, this.y, base - 25, 320, 12);
      this.emit('spawnBossBullet', this.x, this.y, base, 260, 16);
      this.emit('spawnBossBullet', this.x, this.y, base + 25, 200, 20);
    }
  }
}
