import { CHARACTERS } from '../data/characters.js';
import { WEAPONS } from '../data/weapons.js';

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, playerId, characterId, shopManager) {
    super(scene, x, y, `player_${characterId}`);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.playerId = playerId;
    this.characterId = characterId;
    this.shopManager = shopManager;
    this.charData = CHARACTERS[characterId];

    this.maxHp = this.charData.hp;
    this.hp = this.maxHp;
    this.speed = this.charData.speed;
    this.reviveChannelTime = 3000;

    this.weaponId = shopManager.getEquippedWeapon(characterId);
    this.weaponData = WEAPONS[this.weaponId] ?? WEAPONS.default;
    const wt = shopManager.getWeaponTier(characterId, this.weaponId);
    this.weaponTier = this.weaponId === 'default' ? 0 : Math.max(0, wt);

    this.isDowned = false;
    this._lastFired = 0;
    this._lastMelee = 0;

    this.setCollideWorldBounds(true);
  }

  getKeys(scene) {
    if (this.playerId === 1) {
      return {
        up: scene.input.keyboard.addKey('W'),
        down: scene.input.keyboard.addKey('S'),
        left: scene.input.keyboard.addKey('A'),
        right: scene.input.keyboard.addKey('D'),
      };
    } else {
      return {
        up: scene.input.keyboard.addKey('UP'),
        down: scene.input.keyboard.addKey('DOWN'),
        left: scene.input.keyboard.addKey('LEFT'),
        right: scene.input.keyboard.addKey('RIGHT'),
      };
    }
  }

  takeDamage(amount) {
    if (this.isDowned) return;
    this.hp = Math.max(0, this.hp - amount);
    this.emit('hurt', this, amount);
    if (this.hp <= 0) this.goDown();
  }

  goDown() {
    this.isDowned = true;
    this.setAlpha(0.4);
    this.setVelocity(0, 0);
    this.emit('downed', this);
  }

  revive() {
    this.isDowned = false;
    this.hp = Math.floor(this.maxHp * 0.3);
    this.setAlpha(1);
  }

  update(time, delta, keys, target) {
    if (this.isDowned) return;

    // Movement
    let vx = 0, vy = 0;
    if (keys.left.isDown) vx = -this.speed;
    if (keys.right.isDown) vx = this.speed;
    if (keys.up.isDown) vy = -this.speed;
    if (keys.down.isDown) vy = this.speed;

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.setVelocity(vx, vy);

    if (!target) return;

    // Auto-fire
    const effectiveFireRate = this.charData.fireRate / this.weaponData.fireRateMultiplier;
    if (time - this._lastFired > effectiveFireRate) {
      this._lastFired = time;
      this.emit('fire', this, target);
    }

    // Auto-melee
    if (dist(this, target) <= this.charData.meleeRange) {
      if (time - this._lastMelee > this.charData.meleeRate) {
        this._lastMelee = time;
        this.emit('melee', this, target);
      }
    }
  }
}
