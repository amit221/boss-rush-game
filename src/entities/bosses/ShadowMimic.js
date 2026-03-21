import BaseBoss from './BaseBoss.js';
import { WEAPONS } from '../../data/weapons.js';

export default class ShadowMimic extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_shadowmimic', { hp: 1300 });
    this.setDisplaySize(60, 80);
    this._fireCooldown = 1800;
    this._lastFire = 0;
    this._isSplit = false;
    this._clones = [];
  }

  onPhaseChange(phase) {
    if (phase === 2 && !this._isSplit) {
      this._isSplit = true;
      this._spawnClones();
    }
  }

  _spawnClones() {
    // Hide original
    this.setVisible(false);
    this.setActive(false);
    if (this.body) this.body.enable = false;

    const cloneHp = Math.floor(this.maxHp * 0.4); // 520 each
    const positions = [
      { x: this.x - 150, y: this.y },
      { x: this.x + 150, y: this.y }
    ];

    positions.forEach((pos, i) => {
      const clone = this.scene.physics.add.sprite(pos.x, pos.y, 'boss_shadowmimic');
      clone.setDisplaySize(50, 65);
      clone.setTint(i === 0 ? 0x8800aa : 0xaa0088);
      clone.hp = cloneHp;
      clone.maxHp = cloneHp;
      clone.isClone = true;
      clone.takeDamage = (dmg) => {
        clone.hp = Math.max(0, clone.hp - dmg);
        if (clone.hp <= 0) {
          clone.destroy();
          this._clones = this._clones.filter(c => c !== clone);
          this._updateCloneHpBar();
          if (this._clones.length === 0) {
            this.emit('defeated');
          }
        } else {
          this._updateCloneHpBar();
        }
      };
      this._clones.push(clone);
    });

    // Register clones as targets in the scene
    this.emit('clonesSpawned', this._clones);
    this._updateCloneHpBar();
  }

  _updateCloneHpBar() {
    const totalHp = this._clones.reduce((sum, c) => sum + (c.hp ?? 0), 0);
    const totalMax = this._clones.length > 0 ? this.maxHp * 0.4 * 2 : 1;
    const ratio = Math.max(0, totalHp / totalMax);
    if (this._hpBarFill) this._hpBarFill.scaleX = ratio;
  }

  updateBoss(time, delta, players) {
    if (this._isSplit) {
      // Clones move independently toward players
      const alive = players.filter(p => !p.isDowned);
      if (alive.length === 0) return;
      this._clones.forEach((clone, i) => {
        if (!clone.active) return;
        const target = alive[i % alive.length];
        this.scene.physics.moveToObject(clone, target, 80);
        // Clone fires
        if (time - (clone._lastFire ?? 0) > 2000) {
          clone._lastFire = time;
          const angle = Phaser.Math.Angle.Between(clone.x, clone.y, target.x, target.y) * (180 / Math.PI);
          this.emit('spawnBossBullet', clone.x, clone.y, angle, 300, 20);
        }
      });
      return;
    }

    // Phase 1: hover and copy weapon
    const alive = players.filter(p => !p.isDowned);
    if (alive.length === 0) return;

    // Find nearest player
    const nearest = alive.reduce((a, b) =>
      Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y) <
      Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y) ? a : b
    );
    this.scene.physics.moveToObject(this, nearest, 60);

    if (time - this._lastFire > this._fireCooldown) {
      this._lastFire = time;
      this._copyAndFire(nearest, alive);
    }
  }

  _copyAndFire(nearest, allPlayers) {
    // Copy nearest player's weapon (fall back to Player 1 if equidistant)
    const weaponId = nearest.weaponId ?? 'default';
    const weapon = WEAPONS[weaponId] ?? WEAPONS.default;
    const baseDmg = nearest.charData?.rangedDamage ?? 14;
    const dmg = baseDmg * weapon.damageMultiplier * 0.7; // 70% of player damage

    const count = weapon.bulletCount ?? 1;
    const spread = weapon.spreadAngle ?? 0;
    const target = allPlayers[0];
    const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y) * (180 / Math.PI);

    for (let i = 0; i < count; i++) {
      const half = (count - 1) / 2;
      const angle = baseAngle + (i - half) * (spread / (count - 1 || 1));
      this.emit('spawnBossBullet', this.x, this.y, angle, weapon.bulletSpeed ?? 350, dmg);
    }
  }

  destroy() {
    this._clones.forEach(c => { if (c.active) c.destroy(); });
    super.destroy();
  }
}
