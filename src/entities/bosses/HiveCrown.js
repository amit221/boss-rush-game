import BaseBoss from './BaseBoss.js';

export default class HiveCrown extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_hivecrown', { hp: 3800 });
    this.setDisplaySize(82, 82);
    this._spawnCd = 2200;
    this._lastSpawn = 0;
    this._fanCd = 4500;
    this._lastFan = 0;
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._spawnCd = 1400;
      this._fanCd = 3000;
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    this.scene.physics.moveToObject(this, { x: 800, y: 360 }, 28);

    if (time - this._lastSpawn > this._spawnCd) {
      this._lastSpawn = time;
      const n = this.phase === 2 ? 4 : 3;
      this.emit('spawnMinions', n);
    }

    if (time - this._lastFan > this._fanCd) {
      this._lastFan = time;
      const target = alive[Math.floor(Math.random() * alive.length)];
      const base = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y) * (180 / Math.PI);
      for (let i = -3; i <= 3; i++) {
        this.emit('spawnBossBullet', this.x, this.y, base + i * 12, 270, 12);
      }
    }
  }
}
