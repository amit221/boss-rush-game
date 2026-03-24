import BaseBoss from './BaseBoss.js';

export default class RunicColossus extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_runiccolossus', { hp: 3600 });
    this.setDisplaySize(88, 88);
    this._runeCd = 3500;
    this._lastRune = 0;
    this._stompCd = 5500;
    this._lastStomp = 0;
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._runeCd = 2400;
      this._stompCd = 3800;
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    this.scene.physics.moveToObject(this, { x: 800, y: 400 }, 32);

    if (time - this._lastRune > this._runeCd) {
      this._lastRune = time;
      const pool = [[500, 400], [1100, 400], [800, 250], [800, 650]];
      const i0 = Phaser.Math.Between(0, pool.length - 1);
      let i1 = Phaser.Math.Between(0, pool.length - 1);
      if (i1 === i0) i1 = (i0 + 1) % pool.length;
      const positions = [pool[i0], pool[i1]];
      positions.forEach(([rx, ry]) => {
        const ring = this.scene.add.circle(rx, ry, 12, 0xffaa44, 0.5);
        this.scene.tweens.add({
          targets: ring,
          scaleX: 5,
          scaleY: 5,
          alpha: 0.15,
          duration: 600,
          yoyo: true,
          repeat: 2,
          onComplete: () => ring.destroy(),
        });
        this.scene.time.delayedCall(1200, () => {
          alive.forEach(p => {
            if (Phaser.Math.Distance.Between(rx, ry, p.x, p.y) < 90) {
              p.takeDamage(36);
            }
          });
        });
      });
    }

    if (time - this._lastStomp > this._stompCd) {
      this._lastStomp = time;
      alive.forEach(p => {
        p.takeDamage(8);
      });
      this.scene.cameras.main.shake(200, 0.012);
      if (this.scene.cam2) this.scene.cam2.shake(200, 0.012);
      for (let i = 0; i < 16; i++) {
        this.emit('spawnBossBullet', this.x, this.y, i * 22.5, 200, 13);
      }
    }
  }
}
