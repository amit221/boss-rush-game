import BaseBoss from './BaseBoss.js';

export default class KingSlime extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_kingslime', { hp: 600 });
    this.setDisplaySize(80, 80);
    this._slamCooldown = 2500;
    this._lastSlam = 0;
    this._spawnCount = 4;
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._slamCooldown = 1500;
      this._spawnCount = 6;
    }
  }

  updateBoss(time, delta, players) {
    const alivePlayers = players.filter(p => !p.isDowned);
    if (alivePlayers.length === 0) return;

    // Move slowly toward nearest alive player
    const nearest = alivePlayers.reduce((a, b) =>
      Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y) <
      Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y) ? a : b
    );

    this.scene.physics.moveToObject(this, nearest, 60);

    // Slam attack
    if (time - this._lastSlam > this._slamCooldown) {
      this._lastSlam = time;
      this._doSlam(alivePlayers);
      this.emit('spawnMinions', this._spawnCount);
    }
  }

  _doSlam(players) {
    // Damage players within 200px
    players.forEach(p => {
      if (Phaser.Math.Distance.Between(this.x, this.y, p.x, p.y) < 200) {
        p.takeDamage(25);
      }
    });

    // Visual: expanding circle
    const circle = this.scene.add.circle(this.x, this.y, 10, 0x44ff44, 0.5);
    this.scene.tweens.add({
      targets: circle,
      scaleX: 20,
      scaleY: 20,
      alpha: 0,
      duration: 400,
      onComplete: () => circle.destroy()
    });
  }
}
