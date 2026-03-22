import Player from '../entities/Player.js';
import { BOSS_CLASSES, BOSS_ORDER, BOSS_LABELS } from '../data/bosses.js';
import { WEAPONS } from '../data/weapons.js';
import { recordBossDefeated } from '../persistence/bossUnlocks.js';
import { FONT_FAMILY, COLORS } from '../ui/theme.js';
import { ensureBgm } from '../audio/music.js';
import { createAudioControls } from '../ui/audioControls.js';
import {
  hitBurst,
  hitDispatch,
  bulletTrail,
  meleeArc,
  hurtSparks,
  deathPopParticles,
  meleeConeParticles,
  bossDefeatParticles,
  shakeCameras,
  playHitRanged,
  playHitMelee,
  playHitArmor,
  playPlayerHurt,
  playMinionDie,
  playBossDefeat,
} from '../fx/combatFx.js';

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
    this._playerCount = reg.get('playerCount') ?? 1;
    const chars = reg.get('selectedCharacters') ?? { 1: 'brute', 2: 'scout' };

    // Arena — black void; Kenney Tiny Dungeon floor tile (CC0), tiled
    this.physics.world.setBounds(0, 0, 1600, 1200);
    this.add.rectangle(800, 600, 1600, 1200, 0x000000).setOrigin(0.5).setDepth(-3);
    const floor = this.add.tileSprite(800, 600, 1600, 1200, 'arena_floor').setOrigin(0.5).setDepth(-2);
    // Native tile is 16×16; scale up to match previous 64×64 “gameplay” tile size
    floor.setTileScale(4, 4);
    floor.setTint(0xb0906a);

    // Stone wall border (world-space, no scrollFactor override)
    const walls = this.add.graphics().setDepth(-1);
    walls.fillStyle(0x2a1800, 1);
    walls.fillRect(0, 0, 1600, 48);
    walls.fillRect(0, 1152, 1600, 48);
    walls.fillRect(0, 0, 48, 1200);
    walls.fillRect(1552, 0, 48, 1200);
    walls.lineStyle(2, 0x5a3010, 1);
    walls.strokeRect(0, 0, 1600, 1200);

    // Vignette overlay (viewport-fixed)
    const vignette = this.add.graphics().setScrollFactor(0).setDepth(54);
    vignette.fillGradientStyle(0x050200, 0x050200, 0x000000, 0x000000, 0.65, 0.65, 0, 0);
    vignette.fillRect(0, 0, 1280, 180);
    vignette.fillGradientStyle(0x000000, 0x000000, 0x050200, 0x050200, 0, 0, 0.65, 0.65);
    vignette.fillRect(0, 540, 1280, 180);
    vignette.fillGradientStyle(0x050200, 0x000000, 0x050200, 0x000000, 0.65, 0, 0.65, 0);
    vignette.fillRect(0, 0, 180, 720);
    vignette.fillGradientStyle(0x000000, 0x050200, 0x000000, 0x050200, 0, 0.65, 0, 0.65);
    vignette.fillRect(1100, 0, 180, 720);

    // Torch particle emitters at arena corners
    const torchPositions = [[80, 80], [1520, 80], [80, 1120], [1520, 1120]];
    torchPositions.forEach(([tx, ty]) => {
      this.add.particles(tx, ty, 'orb', {
        speed: { min: 20, max: 60 },
        angle: { min: 250, max: 290 },
        scale: { start: 0.35, end: 0 },
        alpha: { start: 0.9, end: 0 },
        lifespan: 800,
        frequency: 60,
        quantity: 2,
        tint: [0xff8800, 0xffcc44, 0xff4400],
        blendMode: 'ADD',
        depth: 55,
      });
    });

    // Ambient ember particles rising across the arena
    this.add.particles(800, 1100, 'orb', {
      speed: { min: 5, max: 25 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: { min: 2500, max: 4500 },
      frequency: 400,
      quantity: 1,
      tint: 0xff8800,
      blendMode: 'ADD',
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(-750, -100, 1500, 100)
      },
      depth: 10,
    });

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
      p.on('hurt', (player) => {
        hurtSparks(this, player.x, player.y);
        playPlayerHurt(this);
        shakeCameras(this, 90, 0.0045);
      });
    });

    // Bullet vs boss — use closure ref to avoid Phaser arg-order ambiguity
    if (this.boss) {
      this.physics.add.overlap(this.bullets, this.boss, (a, b) => {
        const bullet = (a.damage !== undefined) ? a : b;
        if (bullet.active) {
          const ix = bullet.x;
          const iy = bullet.y;
          const vx = bullet.body?.velocity?.x ?? 1;
          const vy = bullet.body?.velocity?.y ?? 0;
          const angleDeg = Math.atan2(vy, vx) * 180 / Math.PI;
          const hitColor = bullet._hitColor ?? 0xffcc66;
          const hitStyle = bullet._hitStyle ?? 'burst';
          this.boss.takeDamage(bullet.damage, true); // true = isRanged
          bullet.destroy();
          hitDispatch(this, ix, iy, hitStyle, hitColor, angleDeg);
          playHitRanged(this);
          playHitArmor(this);
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
        const mx = minion.x;
        const my = minion.y;
        const vx = bullet.body?.velocity?.x ?? 1;
        const vy = bullet.body?.velocity?.y ?? 0;
        const angleDeg = Math.atan2(vy, vx) * 180 / Math.PI;
        const hitColor = bullet._hitColor ?? 0xaa8866;
        const hitStyle = bullet._hitStyle ?? 'burst';
        bullet.destroy();
        if (minion.hp <= 0) {
          deathPopParticles(this, mx, my);
          playMinionDie(this);
          minion.destroy();
        } else {
          hitDispatch(this, mx, my, hitStyle, hitColor, angleDeg);
          playHitRanged(this);
        }
      }
    });

    // Split-screen cameras
    this._setupCameras();
    this._setupHUD();

    this.add.text(640, 14, 'ESC — character select', {
      fontFamily: FONT_FAMILY,
      fontSize: '8px', color: '#555566',
    }).setScrollFactor(0).setDepth(150);
    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.start('CharacterSelectScene');
    });

    // Timing for coin awards
    this._bossStartTime = this.time.now;
    this._p1Damage = 0;
    this._p2Damage = 0;
    this._p1Survived = true;
    this._p2Survived = true;

    // Show boss name
    const bossLabel = BOSS_LABELS[bossName] ?? bossName.replace(/([A-Z])/g, ' $1').trim();
    const bossNameText = this.add.text(640, 360, bossLabel, {
      fontFamily: FONT_FAMILY,
      fontSize: '26px',
      color: '#ffdd99',
      stroke: '#2a1810',
      strokeThickness: 8,
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.tweens.add({ targets: bossNameText, alpha: 0, delay: 2200, duration: 900, onComplete: () => bossNameText.destroy() });

    ensureBgm(this, 'music_battle');
    createAudioControls(this);
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
      this.add.rectangle(640, 360, 3, 720, 0x3a4860, 0.9).setScrollFactor(0).setDepth(200);
    } else {
      this.cameras.main.setViewport(0, 0, 1280, 720);
      this.cameras.main.setBounds(0, 0, 1600, 1200);
      this.cameras.main.startFollow(this.player1);
    }
  }

  _setupHUD() {
    const barW = 200;
    const barH = 12;
    const y = 700;
    const track = (cx, pid) => {
      this.add.rectangle(cx, y, barW + 10, 28, 0x0f0800, 0.92).setStrokeStyle(2, COLORS.strokeDim).setScrollFactor(0).setDepth(98);
      this.add.text(cx - barW / 2, y - 28, `P${pid}`, {
        fontFamily: FONT_FAMILY,
        fontSize: '10px',
        color: pid === 1 ? '#88ccff' : '#ffaa77',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    };
    track(120, 1);
    this._p1HpBar = this.add.rectangle(20, y, barW, barH, 0x44ff22).setScrollFactor(0).setDepth(100).setOrigin(0, 0.5);
    if (this._playerCount === 2) {
      track(760, 2);
      this._p2HpBar = this.add.rectangle(660, y, barW, barH, 0x44ff88).setScrollFactor(0).setDepth(100).setOrigin(0, 0.5);
    }
  }

  _hpBarColor(ratio) {
    // Full HP: green (0x44ff22) → 75%: yellow (0xffcc22) → 50%: orange (0xff8800) → 25%: fire red (0xff3300)
    if (ratio > 0.75) {
      // Green to yellow
      const t = (ratio - 0.75) / 0.25;
      const r = Math.round(68 + (1 - t) * 187);
      const g = Math.round(255 - (1 - t) * 51);
      const b = Math.round(34 * t);
      return (r << 16) | (g << 8) | b;
    } else if (ratio > 0.5) {
      // Yellow to orange
      const t = (ratio - 0.5) / 0.25;
      const r = 255;
      const g = Math.round(136 + t * 68);
      const b = 0;
      return (r << 16) | (g << 8) | b;
    } else if (ratio > 0.25) {
      // Orange to fire red
      const t = (ratio - 0.25) / 0.25;
      const r = 255;
      const g = Math.round(t * 136);
      const b = 0;
      return (r << 16) | (g << 8) | b;
    } else {
      // Fire red
      return 0xff3300;
    }
  }

  _updateHUD() {
    const r1 = Math.max(0, this.player1.hp / this.player1.maxHp);
    this._p1HpBar.scaleX = r1;
    this._p1HpBar.setFillStyle(this._hpBarColor(r1));
    if (this._playerCount === 2) {
      const r2 = Math.max(0, this.player2.hp / this.player2.maxHp);
      this._p2HpBar.scaleX = r2;
      this._p2HpBar.setFillStyle(this._hpBarColor(r2));
    }
  }

  _onPlayerFire(player, target) {
    const weapon = player.weaponData;
    const visuals = weapon.visuals ?? {};
    const angles = this._getBulletAngles(player, target, weapon);
    const dmgPerBullet = calculateDamage(player.charData.rangedDamage, weapon.damageMultiplier, player.damageUpgradeCount);

    angles.forEach(angleDeg => {
      const texKey = visuals.bulletTexture ?? 'bullet';
      const b = this.bullets.create(player.x, player.y, texKey);
      if (!b) return;
      const [bw, bh] = visuals.bulletSize ?? [8, 8];
      b.setDisplaySize(bw, bh);
      b.body.setSize(8, 8);
      if (visuals.bulletRotate) b.setAngularVelocity(360);
      b._hitColor = visuals.hitColor ?? 0xffcc66;
      b._hitStyle = visuals.hitStyle ?? 'burst';
      b.damage = dmgPerBullet;
      this.physics.velocityFromAngle(angleDeg, weapon.bulletSpeed, b.body.velocity);
      this.time.delayedCall(weapon.range / weapon.bulletSpeed * 1000, () => { if (b.active) b.destroy(); });
      if (visuals.trailColor) bulletTrail(this, b, visuals);
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
    const ang = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
    meleeArc(this, player.x, player.y, ang);
    meleeConeParticles(this, player.x, player.y, ang);
    if (typeof target.takeDamage === 'function') {
      target.takeDamage(dmg);
    } else if (target.hp !== undefined) {
      target.hp -= dmg;
      if (target.hp <= 0) target.destroy();
    }
    if (player.playerId === 1) this._p1Damage += dmg;
    else this._p2Damage += dmg; // stays 0 in 1P mode; _onBossDefeated only reads it for pid=2

    const vsBoss = this.boss && target === this.boss;
    hitBurst(this, target.x, target.y, vsBoss ? 0xffaa66 : 0xdd9966);
    playHitMelee(this);
    if (vsBoss) playHitArmor(this);
    shakeCameras(this, 55, 0.0028);

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
          const ix = bullet.x;
          const iy = bullet.y;
          const vx = bullet.body?.velocity?.x ?? 1;
          const vy = bullet.body?.velocity?.y ?? 0;
          const angleDeg = Math.atan2(vy, vx) * 180 / Math.PI;
          cl.takeDamage(bullet.damage);
          bullet.destroy();
          hitDispatch(this, ix, iy, bullet._hitStyle ?? 'burst', 0xcc88ff, angleDeg);
          playHitRanged(this);
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
    playBossDefeat(this);
    const bx = this.boss && this.boss.active ? this.boss.x : 800;
    const by = this.boss && this.boss.active ? this.boss.y : 300;
    bossDefeatParticles(this, bx, by);
    shakeCameras(this, 320, 0.014);
    this.cameras.main.flash(220, 255, 230, 140, false, undefined, 0.22);
    if (this.cam2) this.cam2.flash(220, 255, 230, 140, false, undefined, 0.22);
    const elapsed = (this.time.now - this._bossStartTime) / 1000;
    const totalDamage = this._p1Damage + this._p2Damage;

    const chars = this.registry.get('selectedCharacters') ?? { 1: 'brute', 2: 'scout' };
    const pids = this._playerCount === 2 ? [1, 2] : [1];
    pids.forEach(pid => {
      const charId = chars[pid];
      if (!charId) return;
      const myDamage = pid === 1 ? this._p1Damage : this._p2Damage;
      const survived = pid === 1 ? this._p1Survived : this._p2Survived;
      this.shopManager.awardBossCoins(charId, {
        survived,
        underTime: elapsed < 90,
        mostDamage: totalDamage > 0 && (myDamage / totalDamage) >= 0.5
      });
    });

    const nextIndex = this.bossIndex + 1;
    this.registry.set('bossIndex', nextIndex);
    recordBossDefeated(this.bossIndex);

    this.time.delayedCall(1500, () => {
      if (nextIndex >= BOSS_ORDER.length) {
        this.scene.start('VictoryScene');
      } else {
        this.scene.start('ShopScene');
      }
    });
  }

  _gameOver() {
    this.registry.set('bossIndex', 0);
    this.scene.start('GameOverScene');
  }

  update(time, delta) {
    this._checkRevive(delta);
    this._updateHUD();
    if (!this.boss) return;

    // Safety net: boss at 0 HP must trigger defeat (handles event/listener failures)
    if (this.boss.hp !== undefined && (this.boss.hp <= 0 || this.boss.hp < 0.01) && !this._bossDefeated) {
      this._onBossDefeated();
      return;
    }

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
