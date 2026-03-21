import BaseBoss from './BaseBoss.js';

export default class PyroSkull extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_pyroskull', { hp: 900 });
    this.setDisplaySize(70, 70);
    this._fireballCooldown = 2000;
    this._waveCooldown = 4000;
    this._fireballCount = 3;
    this._lastFireball = 0;
    this._lastWave = 0;
    this._waveAngle = 0;
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._fireballCooldown = 1500;
      this._waveCooldown = 2000;
      this._fireballCount = 5;
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    // Hover slowly toward nearest player
    const target = alive.reduce((a, b) =>
      Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y) <
      Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y) ? a : b
    );
    this.scene.physics.moveToObject(this, target, 50);

    // Fireball spread
    if (time - this._lastFireball > this._fireballCooldown) {
      this._lastFireball = time;
      this._fireSpread(target);
    }

    // Rotating fire wave
    if (time - this._lastWave > this._waveCooldown) {
      this._lastWave = time;
      this._fireWave();
    }
  }

  _fireSpread(target) {
    const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y) * (180 / Math.PI);
    const spread = 30;
    const half = (this._fireballCount - 1) / 2;
    for (let i = 0; i < this._fireballCount; i++) {
      const angle = baseAngle + (i - half) * (spread / (this._fireballCount - 1 || 1));
      this.emit('spawnBossBullet', this.x, this.y, angle, 280, 18);
    }
  }

  _fireWave() {
    // Spawn 8 bullets in a ring rotating outward
    for (let i = 0; i < 8; i++) {
      const angle = this._waveAngle + i * 45;
      this.emit('spawnBossBullet', this.x, this.y, angle, 200, 12);
    }
    this._waveAngle = (this._waveAngle + 22.5) % 360;
  }
}
