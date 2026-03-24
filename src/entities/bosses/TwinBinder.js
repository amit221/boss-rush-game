import BaseBoss from './BaseBoss.js';

export default class TwinBinder extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_twinbinder', { hp: 3200 });
    this.setDisplaySize(76, 76);
    this._orbitR = 95;
    this._orbitA = 0;
    this._orbitSpeed = 0.0022;
    this._nodes = [
      { off: 0, size: 22 },
      { off: Math.PI, size: 22 },
    ];
    this._pulseCd = 4000;
    this._lastPulse = 0;
    this._shotCd = 900;
    this._lastShot = 0;
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._orbitSpeed = 0.0035;
      this._orbitR = 115;
      this._pulseCd = 2600;
      this._shotCd = 550;
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    this.scene.physics.moveToObject(this, { x: 800, y: 420 }, 38);
    this._orbitA += delta * this._orbitSpeed;

    this._nodes.forEach((n, i) => {
      const a = this._orbitA + n.off;
      const nx = this.x + Math.cos(a) * this._orbitR;
      const ny = this.y + Math.sin(a) * this._orbitR;
      n._x = nx;
      n._y = ny;
      alive.forEach(p => {
        if (Phaser.Math.Distance.Between(nx, ny, p.x, p.y) < n.size + 14) {
          p.takeDamage(18 * (delta / 1000));
        }
      });
    });

    if (time - this._lastPulse > this._pulseCd) {
      this._lastPulse = time;
      const n0 = this._nodes[0];
      const n1 = this._nodes[1];
      if (n0._x != null && n1._x != null) {
        const steps = 10;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const px = n0._x + (n1._x - n0._x) * t;
          const py = n0._y + (n1._y - n0._y) * t;
          this.scene.time.delayedCall(s * 40, () => {
            alive.forEach(p => {
              if (Phaser.Math.Distance.Between(px, py, p.x, p.y) < 28) {
                p.takeDamage(12);
              }
            });
          });
        }
      }
    }

    if (time - this._lastShot > this._shotCd) {
      this._lastShot = time;
      const target = alive[0];
      const ang = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y) * (180 / Math.PI);
      this.emit('spawnBossBullet', this.x, this.y, ang, 260, 14);
    }
  }
}
