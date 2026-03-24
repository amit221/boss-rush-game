import BaseBoss from './BaseBoss.js';

export default class Tidebreaker extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_tidebreaker', { hp: 4200 });
    this.setDisplaySize(90, 72);
    this._waveCd = 3200;
    this._lastWave = 0;
    this._curlCd = 2800;
    this._lastCurl = 0;
    this._wavePower = 420;
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._waveCd = 2200;
      this._curlCd = 1900;
      this._wavePower = 580;
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    this.scene.physics.moveToObject(this, { x: 800, y: 450 }, 36);

    if (time - this._lastWave > this._waveCd) {
      this._lastWave = time;
      const angle = Math.random() * Math.PI * 2;
      const fx = Math.cos(angle);
      const fy = Math.sin(angle);
      alive.forEach(p => {
        if (p.body) {
          p.body.velocity.x += fx * this._wavePower;
          p.body.velocity.y += fy * this._wavePower;
        }
      });
      const rip = this.scene.add.ellipse(this.x, this.y, 40, 40, 0x4488cc, 0.35);
      this.scene.tweens.add({
        targets: rip,
        scaleX: 25,
        scaleY: 25,
        alpha: 0,
        duration: 600,
        onComplete: () => rip.destroy(),
      });
    }

    if (time - this._lastCurl > this._curlCd) {
      this._lastCurl = time;
      for (let i = 0; i < 9; i++) {
        const spread = (i - 4) * 20;
        this.emit('spawnBossBullet', this.x, this.y, spread - 90, 230, 14);
        this.emit('spawnBossBullet', this.x, this.y, spread + 90, 230, 14);
      }
    }
  }
}
