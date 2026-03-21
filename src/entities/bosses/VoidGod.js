import BaseBoss from './BaseBoss.js';

export default class VoidGod extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_voidgod', { hp: 2400 });
    this.setDisplaySize(90, 90);
    this._orbCooldown = 2000;
    this._holeCooldown = 5000;
    this._lastOrb = 0;
    this._lastHole = 0;
    this._blackHoles = [];
    this._voidShards = [];
    this._gravityWells = [];
    this._speedMult = 1.0;
    this.rangedImmune = false;
  }

  // Override: 3-phase system (66% and 33% thresholds)
  _checkPhase() {
    const ratio = this.hp / this.maxHp;
    let newPhase = 1;
    if (ratio <= 0.33) newPhase = 3;
    else if (ratio <= 0.66) newPhase = 2;

    if (newPhase !== this.phase) {
      this.phase = newPhase;
      this._doPhaseTransition();
    }
  }

  // Override: absorb ranged in phase 2+
  takeDamage(amount, isRanged = false) {
    if (this.rangedImmune && isRanged) {
      // Visual absorb effect only
      this.scene.tweens.add({ targets: this, alpha: 0.5, duration: 100, yoyo: true });
      return;
    }
    super.takeDamage(amount);
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this.rangedImmune = true;
      this.setTint(0x8800ff);
      this._orbCooldown = 1500;
      this._holeCooldown = 2500;
      this._spawnGravityWells();
    }
    if (phase === 3) {
      this._speedMult = 1.4;
      this.setTint(0xff00ff);
      this._orbCooldown = Math.floor(1500 / 1.4);
      this._holeCooldown = Math.floor(2500 / 1.4);
      this._spawnVoidShards();
    }
  }

  _spawnGravityWells() {
    for (let i = 0; i < 2; i++) {
      const well = this.scene.add.circle(
        400 + i * 800, 360, 30, 0x440088, 0.5
      );
      this._gravityWells.push(well);
    }
  }

  _spawnVoidShards() {
    for (let i = 0; i < 4; i++) {
      const shard = this.scene.add.rectangle(0, 0, 15, 15, 0xff00ff);
      shard._angle = (Math.PI / 2) * i;
      this._voidShards.push(shard);
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    // Float to arena center
    this.scene.physics.moveToObject(this, { x: 800, y: 350 }, 35);

    // Orb volley
    if (time - this._lastOrb > this._orbCooldown) {
      this._lastOrb = time;
      for (let i = 0; i < 5; i++) {
        const angle = (360 / 5) * i;
        this.emit('spawnBossBullet', this.x, this.y, angle, 250, 20);
      }
    }

    // Homing black holes
    if (time - this._lastHole > this._holeCooldown) {
      this._lastHole = time;
      const target = alive[Math.floor(Math.random() * alive.length)];
      const hole = this.scene.physics.add.sprite(this.x, this.y, 'boss_bullet');
      hole.setDisplaySize(20, 20).setTint(0x8800ff);
      hole._target = target;
      hole._dmgTimer = 0;
      this._blackHoles.push(hole);
    }

    // Update black holes (homing)
    this._blackHoles = this._blackHoles.filter(h => h.active);
    this._blackHoles.forEach(h => {
      if (!h._target || h._target.isDowned) {
        const newTarget = alive[0];
        if (!newTarget) return;
        h._target = newTarget;
      }
      this.scene.physics.moveToObject(h, h._target, 120 * this._speedMult);
      if (Phaser.Math.Distance.Between(h.x, h.y, h._target.x, h._target.y) < 20) {
        h._target.takeDamage(25);
        h.destroy();
      }
    });

    // Gravity wells pull players
    this._gravityWells.forEach(well => {
      alive.forEach(p => {
        const d = Phaser.Math.Distance.Between(well.x, well.y, p.x, p.y);
        if (d < 200) {
          const angle = Phaser.Math.Angle.Between(p.x, p.y, well.x, well.y);
          const pull = (200 - d) * 0.3;
          p.body.velocity.x += Math.cos(angle) * pull;
          p.body.velocity.y += Math.sin(angle) * pull;
        }
      });
    });

    // Void shards orbit
    if (this._voidShards.length > 0) {
      this._voidShards.forEach((s, i) => {
        s._angle += delta * 0.003 * this._speedMult;
        s.setPosition(
          this.x + Math.cos(s._angle) * 80,
          this.y + Math.sin(s._angle) * 80
        );
        alive.forEach(p => {
          if (Phaser.Math.Distance.Between(s.x, s.y, p.x, p.y) < 20) {
            p.takeDamage(12 * (delta / 1000));
          }
        });
      });
    }
  }

  destroy() {
    this._blackHoles.forEach(h => { if (h.active) h.destroy(); });
    this._gravityWells.forEach(w => { if (w.active) w.destroy(); });
    this._voidShards.forEach(s => { if (s.active) s.destroy(); });
    super.destroy();
  }
}
