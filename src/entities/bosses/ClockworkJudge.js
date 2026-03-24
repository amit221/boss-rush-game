import BaseBoss from './BaseBoss.js';

export default class ClockworkJudge extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_clockworkjudge', { hp: 3000 });
    this.setDisplaySize(74, 74);
    this._laneCd = 2800;
    this._lastLane = 0;
    this._volleyCd = 4000;
    this._lastVolley = 0;
    this._laneH = true;
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._laneCd = 1800;
      this._volleyCd = 2800;
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    const target = alive.reduce((a, b) =>
      Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y) <
      Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y) ? a : b
    );
    this.scene.physics.moveToObject(this, target, 45);

    if (time - this._lastLane > this._laneCd) {
      this._lastLane = time;
      const horizontal = this._laneH;
      this._laneH = !this._laneH;
      if (horizontal) {
        const ly = 200 + Math.random() * 800;
        const bar = this.scene.add.rectangle(800, ly, 1600, 48, 0xffcc44, 0.4);
        this.scene.time.delayedCall(550, () => {
          if (!bar.active) return;
          bar.destroy();
          alive.forEach(p => {
            if (Math.abs(p.y - ly) < 60) p.takeDamage(32);
          });
        });
      } else {
        const lx = 200 + Math.random() * 1200;
        const bar = this.scene.add.rectangle(lx, 600, 48, 1200, 0xffcc44, 0.4);
        this.scene.time.delayedCall(550, () => {
          if (!bar.active) return;
          bar.destroy();
          alive.forEach(p => {
            if (Math.abs(p.x - lx) < 60) p.takeDamage(32);
          });
        });
      }
    }

    if (time - this._lastVolley > this._volleyCd) {
      this._lastVolley = time;
      const base = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y) * (180 / Math.PI);
      for (let i = -2; i <= 2; i++) {
        this.emit('spawnBossBullet', this.x, this.y, base + i * 18, 300, 15);
      }
    }
  }
}
