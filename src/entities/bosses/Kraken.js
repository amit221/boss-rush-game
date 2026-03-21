import BaseBoss from './BaseBoss.js';

export default class Kraken extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_kraken', { hp: 1800 });
    this.setDisplaySize(100, 80);
    this._tentacles = [];
    this._inkPuddles = [];
    this._inkCooldown = 3000;
    this._lastInk = 0;
    this._tentacleCount = 4;
    this._inkDamages = false;
    this._createTentacles();
  }

  _createTentacles() {
    const existing = this._tentacles.length;
    for (let i = existing; i < this._tentacleCount; i++) {
      const angle = (Math.PI * 2 / this._tentacleCount) * i;
      const t = this.scene.add.rectangle(
        this.x + Math.cos(angle) * 100,
        this.y + Math.sin(angle) * 100,
        20, 60, 0x003366
      );
      this.scene.physics.add.existing(t, false);
      t.hp = 80;
      t.isTentacle = true;
      t._angle = angle;
      t._swingDir = 1;
      t._swingTimer = 0;
      this._tentacles.push(t);
      if (this.scene.minions) this.scene.minions.add(t);
    }
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._tentacleCount = 6;
      this._inkDamages = true;
      this._inkCooldown = 2000;
      this._createTentacles();
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    // Kraken stays roughly centered
    this.scene.physics.moveToObject(this, { x: 800, y: 400 }, 30);

    // Update tentacles
    this._tentacles = this._tentacles.filter(t => t.active);
    this._tentacles.forEach(t => {
      t._swingTimer += delta;
      // Swing tentacle toward nearest player
      const target = alive.reduce((a, b) =>
        Phaser.Math.Distance.Between(t.x, t.y, a.x, a.y) <
        Phaser.Math.Distance.Between(t.x, t.y, b.x, b.y) ? a : b
      );
      this.scene.physics.moveToObject(t, target, 120);
      // Keep near boss
      const distFromBoss = Phaser.Math.Distance.Between(this.x, this.y, t.x, t.y);
      if (distFromBoss > 200) {
        this.scene.physics.moveToObject(t, { x: this.x + Math.cos(t._angle) * 100, y: this.y + Math.sin(t._angle) * 100 }, 150);
      }
      // Damage on contact
      alive.forEach(p => {
        if (Phaser.Math.Distance.Between(t.x, t.y, p.x, p.y) < 25) {
          p.takeDamage(15 * (delta / 1000));
        }
      });
    });

    // Ink puddles
    if (time - this._lastInk > this._inkCooldown && alive.length > 0) {
      this._lastInk = time;
      const target = alive[Math.floor(Math.random() * alive.length)];
      this._spawnInk(target.x, target.y);
    }

    // Ink effect on players
    this._inkPuddles = this._inkPuddles.filter(p => p.active);
    this._inkPuddles.forEach(ink => {
      alive.forEach(p => {
        if (Phaser.Math.Distance.Between(ink.x, ink.y, p.x, p.y) < 40) {
          p._inInk = true;
          if (this._inkDamages) p.takeDamage(5 * (delta / 1000));
        }
      });
    });
    // Clear ink flag for players not in ink
    alive.forEach(p => {
      const inAny = this._inkPuddles.some(ink => Phaser.Math.Distance.Between(ink.x, ink.y, p.x, p.y) < 40);
      if (!inAny) p._inInk = false;
    });
  }

  _spawnInk(x, y) {
    const ink = this.scene.add.circle(x, y, 40, 0x001133, 0.7);
    this._inkPuddles.push(ink);
    this.scene.time.delayedCall(5000, () => {
      if (ink.active) ink.destroy();
    });
  }

  getTentacles() { return this._tentacles; }

  destroy() {
    this._tentacles.forEach(t => { if (t.active) t.destroy(); });
    this._inkPuddles.forEach(p => { if (p.active) p.destroy(); });
    super.destroy();
  }
}
