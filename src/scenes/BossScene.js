import Player from '../entities/Player.js';
import { BOSS_CLASSES, BOSS_ORDER } from '../data/bosses.js';
import { WEAPONS } from '../data/weapons.js';

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function findTarget(player, boss, minions) {
  const MINION_PRIORITY_RANGE = 150;
  const near = minions.filter(m => m.active && dist(player, m) <= MINION_PRIORITY_RANGE);
  if (near.length === 0) return boss;
  return near.reduce((closest, m) => dist(player, m) < dist(player, closest) ? m : closest);
}

function calculateDamage(baseDamage, weaponMultiplier, upgradeCount) {
  return baseDamage * weaponMultiplier * Math.pow(1.15, upgradeCount);
}

export default class BossScene extends Phaser.Scene {
  constructor() { super('BossScene'); }

  create() {
    const reg = this.registry;
    this.bossIndex = reg.get('bossIndex') ?? 0;
    this.shopManager = reg.get('shopManager');
    this._playerCount = reg.get('playerCount') ?? 2;
    const chars = reg.get('selectedCharacters') ?? { 1: 'brute', 2: 'scout' };

    // Arena
    this.physics.world.setBounds(0, 0, 1600, 1200);
    this.add.tileSprite(0, 0, 1600, 1200, 'floor_tile')
      .setOrigin(0, 0)
      .setDepth(-1);

    // Players
    this.player1 = new Player(this, 600, 600, 1, chars[1], this.shopManager);
    if (this._playerCount === 2) {
      this.player2 = new Player(this, 1000, 600, 2, chars[2], this.shopManager);
    }
    this.players = this._playerCount === 2 ? [this.player1, this.player2] : [this.player1];
    this._p1Keys = this.player1.getKeys(this);
    if (this._playerCount === 2) this._p2Keys = this.player2.getKeys(this);

    // Projectile groups
    this.bullets = this.physics.add.group();
    this.bossBullets = this.physics.add.group();

    // Minions group
    this.minions = this.physics.add.group();

    // Spawn boss
    const bossName = BOSS_ORDER[this.bossIndex];
    const BossClass = BOSS_CLASSES[bossName];
    if (!BossClass) {
      this._spawnPlaceholderBoss(bossName);
    } else {
      this.boss = new BossClass(this, 800, 300);
      this.boss.on('defeated', this._onBossDefeated, this);
      this.boss.on('spawnMinions', this._spawnMinions, this);
      this.boss.on('spawnBossBullet', this._spawnBossBullet, this);
      this.boss.on('clonesSpawned', this._onClonesSpawned, this);
    }

    // Player events
    this.players.forEach(p => {
      p.on('downed', this._onPlayerDowned, this);
      p.on('fire', this._onPlayerFire, this);
      p.on('melee', this._onPlayerMelee, this);
    });

    // Bullet vs boss — use closure ref to avoid Phaser arg-order ambiguity
    if (this.boss) {
      this.physics.add.overlap(this.bullets, this.boss, (a, b) => {
        const bullet = (a.damage !== undefined) ? a : b;
        if (bullet.active) {
          this.boss.takeDamage(bullet.damage, true); // true = isRanged
          bullet.destroy();
        }
      });
    }

    // Boss bullets vs players
    this.physics.add.overlap(this.bossBullets, this.players, (a, b) => {
      const bullet = (a.damage !== undefined) ? a : b;
      const player = (a.damage !== undefined) ? b : a;
      if (bullet.active && player.takeDamage && !player.isDowned) {
        player.takeDamage(bullet.damage);
        bullet.destroy();
        this.tweens.add({ targets: player, alpha: 0.3, duration: 100, yoyo: true });
      }
    });

    // Bullets vs minions
    this.physics.add.overlap(this.bullets, this.minions, (a, b) => {
      const bullet = (a.damage !== undefined) ? a : b;
      const minion = (a.damage !== undefined) ? b : a;
      if (bullet.active && minion.active) {
        minion.hp -= bullet.damage;
        bullet.destroy();
        if (minion.hp <= 0) minion.destroy();
      }
    });

    // Split-screen cameras
    this._setupCameras();
    this._setupHUD();

    // Timing for coin awards
    this._bossStartTime = this.time.now;
    this._p1Damage = 0;
    this._p2Damage = 0;
    this._p1Survived = true;
    this._p2Survived = true;

    // Show boss name
    const bossNameText = this.add.text(640, 360, bossName.replace(/([A-Z])/g, ' $1').trim(), {
      fontSize: '48px', color: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.tweens.add({ targets: bossNameText, alpha: 0, delay: 2000, duration: 1000, onComplete: () => bossNameText.destroy() });
  }

  _spawnPlaceholderBoss(name) {
    // Placeholder for unimplemented bosses — a rectangle with HP logic
    const rect = this.add.rectangle(800, 300, 80, 80, 0x888888);
    this.physics.add.existing(rect);
    rect.hp = 300;
    rect.maxHp = 300;
    rect.phase = 1;
    rect.takeDamage = (dmg) => {
      rect.hp = Math.max(0, rect.hp - dmg);
      if (rect.hp <= 0) this._onBossDefeated();
    };
    this.boss = rect;

    // Simple chase behavior
    this._placeholderTimer = this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        const alive = this.players.filter(p => !p.isDowned);
        if (alive.length === 0) return;
        const target = alive[0];
        this.physics.moveToObject(rect, target, 80);
      }
    });
  }

  _setupCameras() {
    if (this._playerCount === 2) {
      this.cameras.main.setViewport(0, 0, 640, 720);
      this.cameras.main.setBounds(0, 0, 1600, 1200);
      this.cameras.main.startFollow(this.player1);
      this.cam2 = this.cameras.add(640, 0, 640, 720);
      this.cam2.setBounds(0, 0, 1600, 1200);
      this.cam2.startFollow(this.player2);
      this.add.rectangle(640, 360, 4, 720, 0xffffff).setScrollFactor(0).setDepth(200);
    } else {
      this.cameras.main.setViewport(0, 0, 1280, 720);
      this.cameras.main.setBounds(0, 0, 1600, 1200);
      this.cameras.main.startFollow(this.player1);
    }
  }

  _setupHUD() {
    this.add.rectangle(120, 700, 200, 14, 0x333333).setScrollFactor(0).setDepth(99);
    this._p1HpBar = this.add.rectangle(20, 700, 200, 14, 0x44ff44).setScrollFactor(0).setDepth(100).setOrigin(0, 0.5);
    this._p1Label = this.add.text(20, 685, 'P1', { fontSize: '12px', color: '#4488ff' }).setScrollFactor(0).setDepth(100);
    if (this._playerCount === 2) {
      this.add.rectangle(760, 700, 200, 14, 0x333333).setScrollFactor(0).setDepth(99);
      this._p2HpBar = this.add.rectangle(660, 700, 200, 14, 0x44ff44).setScrollFactor(0).setDepth(100).setOrigin(0, 0.5);
      this._p2Label = this.add.text(660, 685, 'P2', { fontSize: '12px', color: '#ff8844' }).setScrollFactor(0).setDepth(100);
    }
  }

  _updateHUD() {
    this._p1HpBar.scaleX = Math.max(0, this.player1.hp / this.player1.maxHp);
    if (this._playerCount === 2) {
      this._p2HpBar.scaleX = Math.max(0, this.player2.hp / this.player2.maxHp);
    }
  }

  _onPlayerFire(player, target) {
    const weapon = player.weaponData;
    const angles = this._getBulletAngles(player, target, weapon);
    const dmgPerBullet = calculateDamage(player.charData.rangedDamage, weapon.damageMultiplier, player.damageUpgradeCount);

    angles.forEach(angleDeg => {
      const b = this.bullets.create(player.x, player.y, 'bullet');
      if (!b) return;
      b.setDisplaySize(8, 8);
      b.damage = dmgPerBullet;
      this.physics.velocityFromAngle(angleDeg, weapon.bulletSpeed, b.body.velocity);
      this.time.delayedCall(weapon.range / weapon.bulletSpeed * 1000, () => { if (b.active) b.destroy(); });
      // Track damage per created bullet
      if (player.playerId === 1) this._p1Damage += dmgPerBullet;
      else this._p2Damage += dmgPerBullet; // stays 0 in 1P mode; _onBossDefeated only reads it for pid=2
    });
  }

  _getBulletAngles(player, target, weapon) {
    const baseAngle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y) * (180 / Math.PI);
    if (weapon.bulletCount === 1) return [baseAngle];
    const half = weapon.spreadAngle / 2;
    const step = weapon.spreadAngle / (weapon.bulletCount - 1);
    return Array.from({ length: weapon.bulletCount }, (_, i) => baseAngle - half + step * i);
  }

  _onPlayerMelee(player, target) {
    const dmg = calculateDamage(player.charData.meleeDamage, player.weaponData.damageMultiplier, player.damageUpgradeCount);
    if (typeof target.takeDamage === 'function') {
      target.takeDamage(dmg);
    } else if (target.hp !== undefined) {
      target.hp -= dmg;
      if (target.hp <= 0) target.destroy();
    }
    if (player.playerId === 1) this._p1Damage += dmg;
    else this._p2Damage += dmg; // stays 0 in 1P mode; _onBossDefeated only reads it for pid=2

    // Hit flash on target
    this.tweens.add({ targets: target, alpha: 0.3, duration: 80, yoyo: true });
  }

  _spawnMinions(count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const x = this.boss.x + Math.cos(angle) * 120;
      const y = this.boss.y + Math.sin(angle) * 120;
      const m = this.minions.create(x, y, 'minion');
      if (!m) continue;
      m.setDisplaySize(24, 24);
      m.hp = 30;
      m.maxHp = 30;
    }
  }

  _spawnBossBullet(x, y, angleDeg, speed, damage) {
    const b = this.bossBullets.create(x, y, 'boss_bullet');
    if (!b) return;
    b.setDisplaySize(10, 10);
    b.damage = damage;
    this.physics.velocityFromAngle(angleDeg, speed, b.body.velocity);
    this.time.delayedCall(3000, () => { if (b.active) b.destroy(); });
  }

  _onClonesSpawned(clones) {
    // Add clones to the bullets overlap and player targeting
    clones.forEach(clone => {
      this.physics.add.overlap(this.bullets, clone, (bullet, cl) => {
        if (bullet.active && cl.active && cl.takeDamage) {
          cl.takeDamage(bullet.damage);
          bullet.destroy();
        }
      });
    });
    this._shadowClones = clones;
  }

  _onPlayerDowned(player) {
    if (player.playerId === 1) this._p1Survived = false;
    else this._p2Survived = false;

    player._reviveTimer = 0;
    player._reviveRing = this.add.graphics().setDepth(150);

    // Check if both are down
    const other = this.players.find(p => p !== player);
    if (!other || other.isDowned) {
      this.time.delayedCall(800, () => this._gameOver());
    }
  }

  _checkRevive(delta) {
    this.players.forEach(downed => {
      if (!downed.isDowned || !downed._reviveRing) return;
      const other = this.players.find(p => p !== downed && !p.isDowned);
      if (!other) return;

      const inRange = dist(downed, other) <= 100;

      if (inRange) {
        downed._reviveTimer = (downed._reviveTimer ?? 0) + delta;
        const pct = Math.min(1, downed._reviveTimer / downed.reviveChannelTime);

        downed._reviveRing.clear();
        downed._reviveRing.lineStyle(4, 0x00ff00, 1);
        downed._reviveRing.strokeCircle(downed.x, downed.y, 40);
        downed._reviveRing.fillStyle(0x00ff00, 0.3 * pct);
        downed._reviveRing.fillCircle(downed.x, downed.y, 40 * pct);

        if (downed._reviveTimer >= downed.reviveChannelTime) {
          downed._reviveRing.destroy();
          downed._reviveRing = null;
          downed.revive();
        }
      } else {
        downed._reviveTimer = 0;
        downed._reviveRing.clear();
      }
    });
  }

  _onBossDefeated() {
    if (this._bossDefeated) return;
    this._bossDefeated = true;
    const elapsed = (this.time.now - this._bossStartTime) / 1000;
    const totalDamage = this._p1Damage + this._p2Damage;

    const pids = this._playerCount === 2 ? [1, 2] : [1];
    pids.forEach(pid => {
      const myDamage = pid === 1 ? this._p1Damage : this._p2Damage;
      const survived = pid === 1 ? this._p1Survived : this._p2Survived;
      this.shopManager.awardBossCoins(pid, {
        survived,
        underTime: elapsed < 90,
        mostDamage: totalDamage > 0 && (myDamage / totalDamage) >= 0.5
      });
    });

    const nextIndex = this.bossIndex + 1;
    this.registry.set('bossIndex', nextIndex);

    this.time.delayedCall(1500, () => {
      if (nextIndex >= BOSS_ORDER.length) {
        this.scene.start('VictoryScene');
      } else {
        this.scene.start('ShopScene');
      }
    });
  }

  _gameOver() {
    this.shopManager.reset();
    this.registry.set('bossIndex', 0);
    this.scene.start('GameOverScene');
  }

  update(time, delta) {
    this._checkRevive(delta);
    this._updateHUD();
    if (!this.boss) return;

    const allMinions = [
      ...this.minions.getChildren().filter(m => m.active),
      ...(this._shadowClones ?? []).filter(c => c.active)
    ];

    const p1Target = !this.player1.isDowned ? findTarget(this.player1, this.boss, allMinions) : null;
    this.player1.update(time, delta, this._p1Keys, p1Target);

    if (this._playerCount === 2) {
      const p2Target = !this.player2.isDowned ? findTarget(this.player2, this.boss, allMinions) : null;
      this.player2.update(time, delta, this._p2Keys, p2Target);
    }

    // Apply ink slow from Kraken
    this.players.forEach(p => {
      if (!p.isDowned && p._inInk && p.body) {
        p.body.velocity.x *= 0.5;
        p.body.velocity.y *= 0.5;
      }
    });

    if (this.boss.update) this.boss.update(time, delta, this.players);
  }
}
