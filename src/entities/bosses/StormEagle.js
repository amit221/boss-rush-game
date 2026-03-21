import BaseBoss from './BaseBoss.js';

export default class StormEagle extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_stormeagle', { hp: 1100 });
    this.setDisplaySize(80, 70);
    this._diveCooldown = 3000;
    this._lightningCooldown = 2500;
    this._lastDive = 0;
    this._lastLightning = 0;
    this._diving = false;
    this._diveCount = 1;
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._diveCooldown = 2000;
      this._lightningCooldown = 1800;
      this._diveCount = 2;
    }
  }

  updateBoss(time, delta, players) {
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    if (!this._diving) {
      // Orbit slowly above arena center
      this.scene.physics.moveToObject(this, { x: 800, y: 200 }, 40);
    }

    // Dive attack
    if (!this._diving && time - this._lastDive > this._diveCooldown) {
      this._lastDive = time;
      this._startDive(alive);
    }

    // Lightning strike
    if (time - this._lastLightning > this._lightningCooldown) {
      this._lastLightning = time;
      const targets = this._diveCount === 2 ? alive : [alive[Math.floor(Math.random() * alive.length)]];
      targets.forEach(t => this._lightningStrike(t));
    }
  }

  _startDive(alivePlayers) {
    this._diving = true;
    const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    // Dive to target position
    this.scene.physics.moveToObject(this, target, 360);
    this.scene.time.delayedCall(600, () => {
      this.setVelocity(0, 0);
      this._diving = false;
    });
  }

  _lightningStrike(player) {
    // Warning indicator at player position
    const warn = this.scene.add.rectangle(player.x, player.y, 40, 40, 0xffff00, 0.4);
    this.scene.time.delayedCall(600, () => {
      warn.destroy();
      if (!player.isDowned) {
        player.takeDamage(30);
        // Flash
        const flash = this.scene.add.rectangle(player.x, player.y, 20, 200, 0xffffff, 0.8);
        this.scene.time.delayedCall(150, () => flash.destroy());
      }
    });
  }
}
