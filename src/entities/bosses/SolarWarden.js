import BaseBoss from './BaseBoss.js';

export default class SolarWarden extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_solarwarden', { hp: 4400 });
    this.setDisplaySize(84, 84);
    this._flares = [];
    for (let i = 0; i < 5; i++) {
      const f = this.scene.add.rectangle(0, 0, 28, 12, 0xffdd44, 0.95);
      f._baseAngle = (Math.PI * 2 * i) / 5;
      this._flares.push(f);
    }
    this._spin = 0.0028;
    this._novaCd = 6000;
    this._lastNova = 0;
    this._boltCd = 2000;
    this._lastBolt = 0;
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._spin = 0.0042;
      this._novaCd = 4200;
      this._boltCd = 1300;
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    this.scene.physics.moveToObject(this, { x: 800, y: 380 }, 34);

    this._flares.forEach(f => {
      f._baseAngle += delta * this._spin;
      const ox = Math.cos(f._baseAngle) * 100;
      const oy = Math.sin(f._baseAngle) * 100;
      f.setPosition(this.x + ox, this.y + oy);
      f.setRotation(f._baseAngle);
      alive.forEach(p => {
        if (Phaser.Math.Distance.Between(f.x, f.y, p.x, p.y) < 28) {
          p.takeDamage(20 * (delta / 1000));
        }
      });
    });

    if (time - this._lastBolt > this._boltCd) {
      this._lastBolt = time;
      const t = alive[Math.floor(Math.random() * alive.length)];
      const ang = Phaser.Math.Angle.Between(this.x, this.y, t.x, t.y) * (180 / Math.PI);
      for (let k = -1; k <= 1; k++) {
        this.emit('spawnBossBullet', this.x, this.y, ang + k * 35, 290, 15);
      }
    }

    if (time - this._lastNova > this._novaCd) {
      this._lastNova = time;
      for (let i = 0; i < 20; i++) {
        this.emit('spawnBossBullet', this.x, this.y, i * 18, 220, 12);
      }
    }
  }

  destroy() {
    this._flares.forEach(f => { if (f.active) f.destroy(); });
    super.destroy();
  }
}
