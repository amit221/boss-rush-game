import BaseBoss from './BaseBoss.js';

export default class CrystalMatriarch extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_crystalmatriarch', { hp: 2800 });
    this.setDisplaySize(78, 78);
    this._spikeCd = 3200;
    this._lastSpike = 0;
    this._ringCd = 5000;
    this._lastRing = 0;
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._spikeCd = 2200;
      this._ringCd = 3500;
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    this.scene.physics.moveToObject(this, { x: 800, y: 380 }, 40);

    if (time - this._lastSpike > this._spikeCd) {
      this._lastSpike = time;
      const t = alive[Math.floor(Math.random() * alive.length)];
      const sx = Phaser.Math.Clamp(t.x, 120, 1480);
      const sy = Phaser.Math.Clamp(t.y, 120, 1080);
      const warn = this.scene.add.rectangle(sx, sy, 100, 100, 0xaaddff, 0.35);
      this.scene.time.delayedCall(700, () => {
        if (!warn.active) return;
        warn.destroy();
        alive.forEach(p => {
          if (Phaser.Math.Distance.Between(sx, sy, p.x, p.y) < 70) {
            p.takeDamage(28);
          }
        });
        const flash = this.scene.add.circle(sx, sy, 10, 0xffffff, 0.8);
        this.scene.tweens.add({
          targets: flash,
          scaleX: 8,
          scaleY: 8,
          alpha: 0,
          duration: 250,
          onComplete: () => flash.destroy(),
        });
      });
    }

    if (time - this._lastRing > this._ringCd) {
      this._lastRing = time;
      for (let i = 0; i < 12; i++) {
        const ang = i * 30;
        this.emit('spawnBossBullet', this.x, this.y, ang, 240, 16);
      }
    }
  }
}
