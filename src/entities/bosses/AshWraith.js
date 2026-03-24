import BaseBoss from './BaseBoss.js';

export default class AshWraith extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_ashwraith', { hp: 2600 });
    this.setDisplaySize(72, 72);
    this._puddles = [];
    this._dropCd = 2200;
    this._lastDrop = 0;
    this._burstCd = 3500;
    this._lastBurst = 0;
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._dropCd = 1400;
      this._burstCd = 2400;
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    const target = alive.reduce((a, b) =>
      Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y) <
      Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y) ? a : b
    );
    this.scene.physics.moveToObject(this, target, 55);

    if (time - this._lastDrop > this._dropCd) {
      this._lastDrop = time;
      const c = this.scene.add.circle(this.x, this.y, 8, 0x554444, 0.85);
      this.scene.tweens.add({
        targets: c,
        scaleX: 5,
        scaleY: 5,
        alpha: 0.15,
        duration: 800,
        ease: 'Sine.easeOut',
      });
      this._puddles.push({ c, r: 40, until: time + 4500 });
    }

    if (time - this._lastBurst > this._burstCd) {
      this._lastBurst = time;
      for (let i = 0; i < 8; i++) {
        this.emit('spawnBossBullet', this.x, this.y, i * 45, 210, 14);
      }
    }

    this._puddles = this._puddles.filter(p => {
      if (time > p.until) {
        p.c.destroy();
        return false;
      }
      alive.forEach(pl => {
        if (Phaser.Math.Distance.Between(p.c.x, p.c.y, pl.x, pl.y) < p.r) {
          pl.takeDamage(10 * (delta / 1000));
        }
      });
      return true;
    });
  }

  destroy() {
    this._puddles.forEach(p => { if (p.c.active) p.c.destroy(); });
    super.destroy();
  }
}
