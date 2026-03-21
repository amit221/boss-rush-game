import BaseBoss from './BaseBoss.js';

export default class IronGolem extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_irongolem', { hp: 1500 });
    this.setDisplaySize(90, 90);
    this._stompCooldown = 3000;
    this._boulderCooldown = 2500;
    this._lastStomp = 0;
    this._lastBoulder = 0;
    this._armorBroken = false;
    this._damageMult = 1.0;
    this._orbitAngle = 0;
    this._orbitRocks = [];
  }

  // Override takeDamage to apply armor multiplier
  takeDamage(amount) {
    super.takeDamage(amount * this._damageMult);
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._armorBroken = true;
      this._damageMult = 1.5;
      this._stompCooldown = 2000;
      // Visual: tint red to show armor broken
      this.setTint(0xff8888);
      // Spawn orbit rocks
      this._createOrbitRocks();
    }
  }

  _createOrbitRocks() {
    for (let i = 0; i < 3; i++) {
      const r = this.scene.add.circle(this.x, this.y, 10, 0x888888);
      this._orbitRocks.push(r);
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    // Slow movement toward nearest player
    const target = alive.reduce((a, b) =>
      Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y) <
      Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y) ? a : b
    );
    this.scene.physics.moveToObject(this, target, 45);

    // Stomp
    if (time - this._lastStomp > this._stompCooldown) {
      this._lastStomp = time;
      this._doStomp(alive);
    }

    // Boulder
    if (time - this._lastBoulder > this._boulderCooldown) {
      this._lastBoulder = time;
      const t = alive[Math.floor(Math.random() * alive.length)];
      this.emit('spawnBossBullet', this.x, this.y,
        Phaser.Math.Angle.Between(this.x, this.y, t.x, t.y) * (180 / Math.PI),
        180, 35);
    }

    // Orbit rocks
    if (this._orbitRocks.length > 0) {
      this._orbitAngle += delta * 0.002;
      this._orbitRocks.forEach((r, i) => {
        const a = this._orbitAngle + (Math.PI * 2 / 3) * i;
        r.setPosition(this.x + Math.cos(a) * 80, this.y + Math.sin(a) * 80);
        // Damage players on contact
        alive.forEach(p => {
          if (Phaser.Math.Distance.Between(r.x, r.y, p.x, p.y) < 30) {
            p.takeDamage(8 * (delta / 1000) * 60); // ~8 per second
          }
        });
      });
    }
  }

  _doStomp(players) {
    players.forEach(p => {
      if (Phaser.Math.Distance.Between(this.x, this.y, p.x, p.y) < 250) {
        p.takeDamage(30);
      }
    });
    // Shockwave ring visual
    const ring = this.scene.add.circle(this.x, this.y, 10, 0x888888, 0);
    ring.setStrokeStyle(4, 0xaaaaaa);
    this.scene.tweens.add({
      targets: ring, scaleX: 25, scaleY: 25, alpha: 0,
      duration: 500, onComplete: () => ring.destroy()
    });
    this.scene.cameras.main.shake(200, 0.008);
  }

  destroy() {
    this._orbitRocks.forEach(r => r.destroy());
    super.destroy();
  }
}
