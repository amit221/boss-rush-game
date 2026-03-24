import BaseBoss from './BaseBoss.js';

export default class SporeSovereign extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_sporesovereign', { hp: 3400 });
    this.setDisplaySize(80, 80);
    this._clouds = [];
    this._cloudCd = 3000;
    this._lastCloud = 0;
    this._sprayCd = 2500;
    this._lastSpray = 0;
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._cloudCd = 2000;
      this._sprayCd = 1600;
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    const target = alive.reduce((a, b) =>
      Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y) <
      Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y) ? a : b
    );
    this.scene.physics.moveToObject(this, target, 42);

    if (time - this._lastCloud > this._cloudCd) {
      this._lastCloud = time;
      const cx = Phaser.Math.Clamp(this.x + Phaser.Math.Between(-200, 200), 150, 1450);
      const cy = Phaser.Math.Clamp(this.y + Phaser.Math.Between(-150, 150), 150, 1050);
      const c = this.scene.add.circle(cx, cy, 16, 0x44aa33, 0.45);
      this.scene.tweens.add({
        targets: c,
        scaleX: 4.5,
        scaleY: 4.5,
        alpha: 0.2,
        duration: 1200,
        ease: 'Quad.easeOut',
      });
      this._clouds.push({ c, dmgR: 68, dps: 22, until: time + 5000 });
    }

    if (time - this._lastSpray > this._sprayCd) {
      this._lastSpray = time;
      for (let i = 0; i < 14; i++) {
        this.emit('spawnBossBullet', this.x, this.y, i * 26, 180 + i * 8, 11);
      }
    }

    this._clouds = this._clouds.filter(cl => {
      if (time > cl.until) {
        cl.c.destroy();
        return false;
      }
      alive.forEach(p => {
        if (Phaser.Math.Distance.Between(cl.c.x, cl.c.y, p.x, p.y) < cl.dmgR) {
          p.takeDamage(cl.dps * (delta / 1000));
        }
      });
      return true;
    });
  }

  destroy() {
    this._clouds.forEach(cl => { if (cl.c.active) cl.c.destroy(); });
    super.destroy();
  }
}
