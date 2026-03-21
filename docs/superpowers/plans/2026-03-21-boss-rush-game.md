# Boss Rush Co-op Game — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 2-player local co-op boss rush game in Phaser.js 3 — 7 unique bosses, split-screen, shared keyboard, shop between levels.

**Architecture:** Scene-based Phaser.js 3 with ES modules. Each boss extends `BaseBoss`. `CombatSystem` handles all auto-targeting. `ShopManager` persists state in Phaser registry. Split-screen via two Phaser cameras.

**Tech Stack:** Phaser.js 3.60 (CDN), JavaScript ES modules, Jest (unit tests for pure logic), `npx live-server` to serve locally.

**Spec:** `docs/superpowers/specs/2026-03-21-boss-rush-game-design.md`

---

## File Map

| File | Responsibility |
|--|--|
| `index.html` | Entry point, loads Phaser CDN + main.js |
| `src/main.js` | Phaser game config, registers all scenes |
| `src/scenes/BootScene.js` | Preload all assets |
| `src/scenes/MenuScene.js` | Main menu, controls display |
| `src/scenes/CharacterSelectScene.js` | Both players pick characters |
| `src/scenes/BossScene.js` | Combat: split-screen, spawns correct boss, handles revive |
| `src/scenes/ShopScene.js` | Post-boss shop UI |
| `src/scenes/GameOverScene.js` | Game over screen |
| `src/scenes/VictoryScene.js` | Victory screen |
| `src/entities/Player.js` | Player sprite, movement, stats, weapon |
| `src/entities/bosses/BaseBoss.js` | HP, phases, HP bar, phase flash |
| `src/entities/bosses/KingSlime.js` | Boss 1 logic |
| `src/entities/bosses/PyroSkull.js` | Boss 2 logic |
| `src/entities/bosses/StormEagle.js` | Boss 3 logic |
| `src/entities/bosses/IronGolem.js` | Boss 4 logic |
| `src/entities/bosses/ShadowMimic.js` | Boss 5 logic |
| `src/entities/bosses/Kraken.js` | Boss 6 logic |
| `src/entities/bosses/VoidGod.js` | Boss 7 logic |
| `src/systems/CombatSystem.js` | Auto-targeting, auto-fire, auto-melee, damage |
| `src/systems/ShopManager.js` | Coin wallet, weapon equip, upgrade caps |
| `src/data/bosses.js` | Ordered boss class list |
| `src/data/characters.js` | Character stat definitions |
| `src/data/weapons.js` | Weapon stat definitions |
| `tests/CombatSystem.test.js` | Jest tests for targeting/damage logic |
| `tests/ShopManager.test.js` | Jest tests for shop economy logic |

---

## Task 1: Project Setup

**Files:**
- Create: `index.html`
- Create: `src/main.js`
- Create: `package.json`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Boss Rush</title>
  <style>
    * { margin: 0; padding: 0; }
    body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
  <script type="module" src="src/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `src/main.js`**

```js
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import BossScene from './scenes/BossScene.js';
import ShopScene from './scenes/ShopScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [BootScene, MenuScene, CharacterSelectScene, BossScene, ShopScene, GameOverScene, VictoryScene]
};

new Phaser.Game(config);
```

- [ ] **Step 3: Create `package.json`**

```json
{
  "name": "boss-rush-game",
  "version": "1.0.0",
  "scripts": {
    "test": "jest",
    "serve": "npx live-server --port=8080"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

- [ ] **Step 4: Install dependencies**

```bash
cd C:/Users/97254/alonamit
npm install
```

- [ ] **Step 5: Create placeholder scene files** (empty classes so the game loads without errors)

Create each of these with a minimal class:
```js
// src/scenes/BootScene.js
export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() {}
  create() { this.scene.start('MenuScene'); }
}
```

Repeat for: `MenuScene`, `CharacterSelectScene`, `BossScene`, `ShopScene`, `GameOverScene`, `VictoryScene` — each with `constructor`, empty `create()`, and appropriate `super('SceneName')`.

- [ ] **Step 6: Verify game loads in browser**

Run: `npm run serve`
Open: `http://localhost:8080`
Expected: Black screen, no console errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: project scaffold — Phaser config, all scenes registered"
```

---

## Task 2: Data Definitions

**Files:**
- Create: `src/data/characters.js`
- Create: `src/data/weapons.js`
- Create: `src/data/bosses.js`

- [ ] **Step 1: Create `src/data/characters.js`**

```js
export const CHARACTERS = {
  brute: {
    id: 'brute',
    name: 'Brute',
    color: 0x4488ff,        // placeholder sprite color
    hp: 150,
    speed: 180,
    rangedDamage: 20,
    meleeDamage: 40,
    fireRate: 800,           // ms between shots
    meleeRange: 80,
    meleeRate: 600,          // ms between melee swings
  },
  scout: {
    id: 'scout',
    name: 'Scout',
    color: 0xff8844,
    hp: 100,
    speed: 260,
    rangedDamage: 14,
    meleeDamage: 22,
    fireRate: 500,
    meleeRange: 80,
    meleeRate: 400,
  }
};
```

- [ ] **Step 2: Create `src/data/weapons.js`**

```js
export const WEAPONS = {
  default: {
    id: 'default',
    name: 'Default Gun',
    price: 0,
    bulletCount: 1,
    spreadAngle: 0,
    damageMultiplier: 1.0,
    fireRateMultiplier: 1.0,
    bulletSpeed: 400,
    piercing: false,
    range: 600,              // px before bullet despawns
  },
  shotgun: {
    id: 'shotgun',
    name: 'Shotgun',
    price: 80,
    bulletCount: 3,
    spreadAngle: 30,         // total degrees spread
    damageMultiplier: 0.8,
    fireRateMultiplier: 0.6, // slower fire rate
    bulletSpeed: 500,
    piercing: false,
    range: 300,
  },
  sniper: {
    id: 'sniper',
    name: 'Sniper',
    price: 100,
    bulletCount: 1,
    spreadAngle: 0,
    damageMultiplier: 2.0,
    fireRateMultiplier: 0.5,
    bulletSpeed: 800,
    piercing: true,
    range: 900,
  },
  boomerang: {
    id: 'boomerang',
    name: 'Boomerang',
    price: 90,
    bulletCount: 1,
    spreadAngle: 0,
    damageMultiplier: 1.2,
    fireRateMultiplier: 0.7,
    bulletSpeed: 350,
    piercing: false,
    returns: true,           // projectile returns to player
    range: 400,
  },
  flamethrower: {
    id: 'flamethrower',
    name: 'Flamethrower',
    price: 120,
    bulletCount: 1,
    spreadAngle: 0,
    damageMultiplier: 0.4,   // per tick
    fireRateMultiplier: 8.0, // very fast (continuous)
    bulletSpeed: 200,
    piercing: false,
    range: 120,
  }
};
```

- [ ] **Step 3: Create `src/data/bosses.js`** (import boss classes after they're created; for now use strings)

```js
// Boss order — index = level number (0-based)
// Replace string keys with actual class imports once bosses are implemented
export const BOSS_ORDER = [
  'KingSlime',
  'PyroSkull',
  'StormEagle',
  'IronGolem',
  'ShadowMimic',
  'Kraken',
  'VoidGod',
];
```

- [ ] **Step 4: Commit**

```bash
git add src/data/
git commit -m "feat: add character, weapon, and boss data definitions"
```

---

## Task 3: ShopManager (with tests)

**Files:**
- Create: `src/systems/ShopManager.js`
- Create: `tests/ShopManager.test.js`

- [ ] **Step 1: Write failing tests**

```js
// tests/ShopManager.test.js
const { ShopManager } = require('../src/systems/ShopManager.js');

describe('ShopManager', () => {
  let shop;
  beforeEach(() => { shop = new ShopManager(); });

  test('starts with 0 coins', () => {
    expect(shop.getCoins(1)).toBe(0);
    expect(shop.getCoins(2)).toBe(0);
  });

  test('awards coins after boss defeat', () => {
    shop.awardBossCoins(1, { survived: true, underTime: true, mostDamage: false });
    expect(shop.getCoins(1)).toBe(115); // 100 + 20 + 15 - no mostDamage
  });

  test('awards full bonus when all criteria met', () => {
    shop.awardBossCoins(1, { survived: true, underTime: true, mostDamage: true });
    expect(shop.getCoins(1)).toBe(150); // 100 + 20 + 15 + 15
  });

  test('can buy weapon if enough coins', () => {
    shop.addCoins(1, 100);
    const result = shop.buyWeapon(1, 'sniper'); // costs 100
    expect(result).toBe(true);
    expect(shop.getCoins(1)).toBe(0);
    expect(shop.getEquippedWeapon(1)).toBe('sniper');
  });

  test('cannot buy weapon if insufficient coins', () => {
    shop.addCoins(1, 50);
    const result = shop.buyWeapon(1, 'sniper'); // costs 100
    expect(result).toBe(false);
    expect(shop.getCoins(1)).toBe(50);
  });

  test('stat upgrade capped at 3 per run', () => {
    shop.addCoins(1, 1000);
    shop.buyUpgrade(1, 'damageUp');
    shop.buyUpgrade(1, 'damageUp');
    shop.buyUpgrade(1, 'damageUp');
    const result = shop.buyUpgrade(1, 'damageUp'); // 4th purchase
    expect(result).toBe(false);
  });

  test('getUpgradeCount returns correct count', () => {
    shop.addCoins(1, 200);
    shop.buyUpgrade(1, 'hpUp');
    shop.buyUpgrade(1, 'hpUp');
    expect(shop.getUpgradeCount(1, 'hpUp')).toBe(2);
  });

  test('reset clears all state', () => {
    shop.addCoins(1, 200);
    shop.buyUpgrade(1, 'hpUp');
    shop.reset();
    expect(shop.getCoins(1)).toBe(0);
    expect(shop.getUpgradeCount(1, 'hpUp')).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest tests/ShopManager.test.js
```
Expected: All FAIL with "Cannot find module"

- [ ] **Step 3: Implement `ShopManager`**

```js
// src/systems/ShopManager.js
const WEAPON_PRICES = { shotgun: 80, sniper: 100, boomerang: 90, flamethrower: 120 };
const UPGRADE_PRICES = { hpUp: 50, speedUp: 60, damageUp: 70, fastRevive: 80 };
const MAX_UPGRADES = 3;

class ShopManager {
  constructor() { this.reset(); }

  reset() {
    this._coins = { 1: 0, 2: 0 };
    this._weapons = { 1: 'default', 2: 'default' };
    this._upgrades = { 1: {}, 2: {} };
  }

  getCoins(playerId) { return this._coins[playerId] ?? 0; }
  addCoins(playerId, amount) { this._coins[playerId] = (this._coins[playerId] ?? 0) + amount; }

  awardBossCoins(playerId, { survived, underTime, mostDamage }) {
    let total = 100;
    if (survived) total += 20;
    if (underTime) total += 15;
    if (mostDamage) total += 15;
    this.addCoins(playerId, total);
  }

  getEquippedWeapon(playerId) { return this._weapons[playerId] ?? 'default'; }

  buyWeapon(playerId, weaponId) {
    const price = WEAPON_PRICES[weaponId];
    if (!price || this._coins[playerId] < price) return false;
    this._coins[playerId] -= price;
    this._weapons[playerId] = weaponId;
    return true;
  }

  getUpgradeCount(playerId, upgradeId) {
    return this._upgrades[playerId][upgradeId] ?? 0;
  }

  buyUpgrade(playerId, upgradeId) {
    const price = UPGRADE_PRICES[upgradeId];
    if (!price) return false;
    const count = this.getUpgradeCount(playerId, upgradeId);
    if (count >= MAX_UPGRADES) return false;
    if (this._coins[playerId] < price) return false;
    this._coins[playerId] -= price;
    this._upgrades[playerId][upgradeId] = count + 1;
    return true;
  }

  getUpgradesForPlayer(playerId) {
    return { ...this._upgrades[playerId] };
  }
}

module.exports = { ShopManager };
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest tests/ShopManager.test.js
```
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add src/systems/ShopManager.js tests/ShopManager.test.js
git commit -m "feat: ShopManager with coin wallet, weapon purchase, upgrade caps"
```

---

## Task 4: CombatSystem (with tests)

**Files:**
- Create: `src/systems/CombatSystem.js`
- Create: `tests/CombatSystem.test.js`

- [ ] **Step 1: Write failing tests**

```js
// tests/CombatSystem.test.js
const { findTarget, calculateDamage } = require('../src/systems/CombatSystem.js');

describe('findTarget', () => {
  const player = { x: 0, y: 0 };
  const boss = { x: 300, y: 0 };

  test('returns boss when no minions', () => {
    expect(findTarget(player, boss, [])).toBe(boss);
  });

  test('returns minion when within 150px', () => {
    const minion = { x: 100, y: 0 };
    expect(findTarget(player, boss, [minion])).toBe(minion);
  });

  test('returns boss when minion is farther than 150px', () => {
    const farMinion = { x: 200, y: 0 };
    expect(findTarget(player, boss, [farMinion])).toBe(boss);
  });

  test('returns nearest minion when multiple minions within range', () => {
    const near = { x: 80, y: 0 };
    const far = { x: 130, y: 0 };
    expect(findTarget(player, boss, [far, near])).toBe(near);
  });
});

describe('calculateDamage', () => {
  test('returns base damage with no upgrades', () => {
    expect(calculateDamage(20, 1.0, 0)).toBe(20);
  });

  test('applies weapon multiplier', () => {
    expect(calculateDamage(20, 2.0, 0)).toBe(40);
  });

  test('applies damage upgrades (15% per upgrade)', () => {
    expect(calculateDamage(20, 1.0, 2)).toBeCloseTo(26.45, 1); // 20 * 1.15^2
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest tests/CombatSystem.test.js
```

- [ ] **Step 3: Implement `CombatSystem`**

```js
// src/systems/CombatSystem.js
const MINION_PRIORITY_RANGE = 150;

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function findTarget(player, boss, minions) {
  const nearMinions = minions.filter(m => dist(player, m) <= MINION_PRIORITY_RANGE);
  if (nearMinions.length === 0) return boss;
  return nearMinions.reduce((closest, m) =>
    dist(player, m) < dist(player, closest) ? m : closest
  );
}

function calculateDamage(baseDamage, weaponMultiplier, damageUpgradeCount) {
  return baseDamage * weaponMultiplier * Math.pow(1.15, damageUpgradeCount);
}

module.exports = { findTarget, calculateDamage, dist };
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest tests/CombatSystem.test.js
```

- [ ] **Step 5: Commit**

```bash
git add src/systems/CombatSystem.js tests/CombatSystem.test.js
git commit -m "feat: CombatSystem targeting and damage calculation"
```

---

## Task 5: Player Entity

**Files:**
- Create: `src/entities/Player.js`

- [ ] **Step 1: Implement `Player.js`**

```js
// src/entities/Player.js
import { CHARACTERS } from '../data/characters.js';
import { WEAPONS } from '../data/weapons.js';
import { dist } from '../systems/CombatSystem.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, playerId, characterId, shopManager) {
    // Use colored rectangle as placeholder sprite
    super(scene, x, y, `player_${characterId}`);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.playerId = playerId;
    this.shopManager = shopManager;
    this.charData = CHARACTERS[characterId];

    // Apply upgrades from shop
    const upgrades = shopManager.getUpgradesForPlayer(playerId);
    const hpBonus = (upgrades.hpUp ?? 0) * 20;
    const speedBonus = Math.pow(1.10, upgrades.speedUp ?? 0);
    const reviveReduction = (upgrades.fastRevive ?? 0) * 1000;

    this.maxHp = this.charData.hp + hpBonus;
    this.hp = this.maxHp;
    this.speed = this.charData.speed * speedBonus;
    this.reviveChannelTime = Math.max(1000, 3000 - reviveReduction); // min 1s
    this.damageUpgradeCount = upgrades.damageUp ?? 0;

    this.weaponId = shopManager.getEquippedWeapon(playerId);
    this.weaponData = WEAPONS[this.weaponId];

    this.isDowned = false;
    this.isReviving = false;
    this.reviveProgress = 0; // ms elapsed
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
    this.reviveProgress = 0;
    this.setAlpha(1);
  }

  update(time, delta, keys, target, minions) {
    if (this.isDowned) return;

    // Movement
    let vx = 0, vy = 0;
    if (keys.left.isDown) vx = -this.speed;
    if (keys.right.isDown) vx = this.speed;
    if (keys.up.isDown) vy = -this.speed;
    if (keys.down.isDown) vy = this.speed;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.setVelocity(vx, vy);

    // Auto-fire
    if (target && time - this._lastFired > this.charData.fireRate * (1 / this.weaponData.fireRateMultiplier)) {
      this._lastFired = time;
      this.emit('fire', this, target);
    }

    // Auto-melee
    if (target && dist(this, target) <= this.charData.meleeRange) {
      if (time - this._lastMelee > this.charData.meleeRate) {
        this._lastMelee = time;
        this.emit('melee', this, target);
      }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/entities/Player.js
git commit -m "feat: Player entity with movement, auto-fire, auto-melee, HP, revive state"
```

---

## Task 6: BaseBoss

**Files:**
- Create: `src/entities/bosses/BaseBoss.js`

- [ ] **Step 1: Implement `BaseBoss.js`**

```js
// src/entities/bosses/BaseBoss.js
export default class BaseBoss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey, config) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.maxHp = config.hp;
    this.hp = config.hp;
    this.phase = 1;
    this._flashTimer = null;

    // HP bar (drawn above split-screen)
    this._createHpBar(scene);

    this.setCollideWorldBounds(true);
  }

  _createHpBar(scene) {
    const barWidth = 600;
    const barX = (1280 - barWidth) / 2;
    const barY = 10;

    this._hpBarBg = scene.add.rectangle(barX + barWidth / 2, barY + 10, barWidth, 20, 0x333333).setScrollFactor(0).setDepth(100);
    this._hpBarFill = scene.add.rectangle(barX + barWidth / 2, barY + 10, barWidth, 20, 0xff4444).setScrollFactor(0).setDepth(101);
    this._hpBarFill.setOrigin(0.5, 0.5);
  }

  _updateHpBar() {
    const ratio = Math.max(0, this.hp / this.maxHp);
    this._hpBarFill.scaleX = ratio;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this._updateHpBar();
    this._checkPhase();
    if (this.hp <= 0) this.emit('defeated');
  }

  _checkPhase() {
    const ratio = this.hp / this.maxHp;
    const newPhase = ratio <= 0.5 ? 2 : 1;
    if (newPhase !== this.phase) {
      this.phase = newPhase;
      this._doPhaseTransition();
    }
  }

  _doPhaseTransition() {
    // Brief flash + pause
    this.scene.cameras.main.flash(300, 255, 255, 255);
    this.scene.time.delayedCall(1000, () => {
      this.onPhaseChange(this.phase);
    });
  }

  // Override in subclass
  onPhaseChange(phase) {}

  // Override in subclass — called every frame
  updateBoss(time, delta, players) {}

  update(time, delta, players) {
    this.updateBoss(time, delta, players);
    this._updateHpBar();
  }

  destroy() {
    this._hpBarBg?.destroy();
    this._hpBarFill?.destroy();
    super.destroy();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/entities/bosses/BaseBoss.js
git commit -m "feat: BaseBoss with HP, phase system, HP bar"
```

---

## Task 7: Boss 1 — King Slime

**Files:**
- Create: `src/entities/bosses/KingSlime.js`

- [ ] **Step 1: Implement `KingSlime.js`**

```js
// src/entities/bosses/KingSlime.js
import BaseBoss from './BaseBoss.js';

export default class KingSlime extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_kingslime', { hp: 600 });
    this.setDisplaySize(80, 80);
    this._slamCooldown = 2500;
    this._lastSlam = 0;
    this._spawnCount = 4;
    this.minions = [];
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      this._slamCooldown = 1500; // faster
      this._spawnCount = 6;
    }
  }

  updateBoss(time, delta, players) {
    // Move slowly toward nearest player
    const nearest = players.reduce((a, b) =>
      Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y) <
      Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y) ? a : b
    );

    this.scene.physics.moveToObject(this, nearest, 60);

    // Slam attack
    if (time - this._lastSlam > this._slamCooldown) {
      this._lastSlam = time;
      this._doSlam(players);
      this._spawnMinislimes();
    }
  }

  _doSlam(players) {
    // AOE damage within 200px
    players.forEach(p => {
      if (!p.isDowned && Phaser.Math.Distance.Between(this.x, this.y, p.x, p.y) < 200) {
        p.takeDamage(25);
      }
    });

    // Visual: expanding circle
    const circle = this.scene.add.circle(this.x, this.y, 10, 0x44ff44, 0.5);
    this.scene.tweens.add({
      targets: circle,
      scaleX: 20, scaleY: 20,
      alpha: 0,
      duration: 400,
      onComplete: () => circle.destroy()
    });
  }

  _spawnMinislimes() {
    // Emit event — BossScene handles actual spawning
    this.emit('spawnMinions', this._spawnCount);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/entities/bosses/KingSlime.js
git commit -m "feat: Boss 1 KingSlime — slam AOE, minion spawning, phase 2"
```

---

## Task 8: BossScene (Core)

**Files:**
- Modify: `src/scenes/BossScene.js`

This is the most complex scene. It wires together: players, boss, split-screen cameras, revive mechanic, minions, and scene transitions.

- [ ] **Step 1: Implement `BossScene.js`**

```js
// src/scenes/BossScene.js
import Player from '../entities/Player.js';
import { BOSS_ORDER } from '../data/bosses.js';
import { findTarget } from '../systems/CombatSystem.js';
import { calculateDamage } from '../systems/CombatSystem.js';

// Lazy boss imports — loaded dynamically based on boss index
const BOSS_CLASSES = {
  KingSlime: () => import('../entities/bosses/KingSlime.js'),
  // Add others as they're implemented
};

export default class BossScene extends Phaser.Scene {
  constructor() { super('BossScene'); }

  async create() {
    const reg = this.registry;
    this.bossIndex = reg.get('bossIndex') ?? 0;
    this.shopManager = reg.get('shopManager');
    const chars = reg.get('selectedCharacters'); // { 1: 'brute', 2: 'scout' }

    // Arena bounds: 1600x1200 centered
    this.physics.world.setBounds(0, 0, 1600, 1200);

    // Background
    this.add.rectangle(800, 600, 1600, 1200, 0x1a1a2e);

    // Players
    this.player1 = new Player(this, 600, 600, 1, chars[1], this.shopManager);
    this.player2 = new Player(this, 1000, 600, 2, chars[2], this.shopManager);
    this.players = [this.player1, this.player2];

    this._p1Keys = this.player1.getKeys(this);
    this._p2Keys = this.player2.getKeys(this);

    // Setup projectiles group
    this.bullets = this.physics.add.group();
    this.bossBullets = this.physics.add.group();

    // Load and spawn boss
    const bossName = BOSS_ORDER[this.bossIndex];
    const { default: BossClass } = await BOSS_CLASSES[bossName]();
    this.boss = new BossClass(this, 800, 300);
    this.boss.on('defeated', this._onBossDefeated, this);
    this.boss.on('spawnMinions', this._spawnMinions, this);

    // Minions group
    this.minions = this.physics.add.group();

    // Player events
    this.players.forEach(p => {
      p.on('downed', this._onPlayerDowned, this);
      p.on('fire', this._onPlayerFire, this);
      p.on('melee', this._onPlayerMelee, this);
    });

    // Bullet vs boss collision
    this.physics.add.overlap(this.bullets, this.boss, (bullet, boss) => {
      if (boss.phase >= 2 && this.boss.constructor.name === 'VoidGod') return; // Void God ranged immunity
      boss.takeDamage(bullet.damage);
      bullet.destroy();
    });

    // Boss bullets vs players
    this.physics.add.overlap(this.bossBullets, this.players, (bullet, player) => {
      player.takeDamage(bullet.damage);
      bullet.destroy();
    });

    // Split-screen cameras
    this._setupCameras();

    // HUD
    this._setupHUD();

    // Timing
    this._bossStartTime = this.time.now;
    this._p1Damage = 0;
    this._p2Damage = 0;
    this._p1Survived = true;
    this._p2Survived = true;
  }

  _setupCameras() {
    // Camera 1: left half follows Player 1
    this.cameras.main.setViewport(0, 0, 640, 720);
    this.cameras.main.setBounds(0, 0, 1600, 1200);
    this.cameras.main.startFollow(this.player1);

    // Camera 2: right half follows Player 2
    this.cam2 = this.cameras.add(640, 0, 640, 720);
    this.cam2.setBounds(0, 0, 1600, 1200);
    this.cam2.startFollow(this.player2);

    // Divider line
    this.add.rectangle(640, 360, 4, 720, 0xffffff).setScrollFactor(0).setDepth(200);
  }

  _setupHUD() {
    // Player HP bars
    this._p1HpBar = this.add.rectangle(120, 680, 200, 16, 0x44ff44).setScrollFactor(0).setDepth(100);
    this._p2HpBar = this.add.rectangle(760, 680, 200, 16, 0x44ff44).setScrollFactor(0).setDepth(100);
    this._p1HpBarBg = this.add.rectangle(120, 680, 200, 16, 0x333333).setScrollFactor(0).setDepth(99);
    this._p2HpBarBg = this.add.rectangle(760, 680, 200, 16, 0x333333).setScrollFactor(0).setDepth(99);
  }

  _updateHUD() {
    const p1r = this.player1.hp / this.player1.maxHp;
    const p2r = this.player2.hp / this.player2.maxHp;
    this._p1HpBar.scaleX = Math.max(0, p1r);
    this._p2HpBar.scaleX = Math.max(0, p2r);
  }

  _onPlayerFire(player, target) {
    const weapon = player.weaponData;
    const angles = this._getBulletAngles(player, target, weapon);
    angles.forEach(angle => {
      const b = this.bullets.create(player.x, player.y, 'bullet');
      b.setDisplaySize(8, 8);
      const dmg = calculateDamage(player.charData.rangedDamage, weapon.damageMultiplier, player.damageUpgradeCount);
      b.damage = dmg;
      this.physics.velocityFromAngle(angle, weapon.bulletSpeed, b.body.velocity);
      // Destroy bullet after range
      this.time.delayedCall(weapon.range / weapon.bulletSpeed * 1000, () => { if (b.active) b.destroy(); });
      // Track damage
      if (player.playerId === 1) this._p1Damage += dmg;
      else this._p2Damage += dmg;
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
    const dmg = calculateDamage(player.charData.meleeDamage, 1.0, player.damageUpgradeCount);
    target.takeDamage(dmg);
    if (player.playerId === 1) this._p1Damage += dmg;
    else this._p2Damage += dmg;
  }

  _spawnMinions(count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const x = this.boss.x + Math.cos(angle) * 120;
      const y = this.boss.y + Math.sin(angle) * 120;
      const m = this.minions.create(x, y, 'minion');
      m.setDisplaySize(24, 24);
      m.hp = 30;
      m.maxHp = 30;
      this.physics.add.overlap(this.bullets, m, (bullet, minion) => {
        minion.hp -= bullet.damage;
        bullet.destroy();
        if (minion.hp <= 0) minion.destroy();
      });
    }
  }

  _onPlayerDowned(player) {
    if (player.playerId === 1) this._p1Survived = false;
    else this._p2Survived = false;

    const other = player.playerId === 1 ? this.player2 : this.player1;
    if (other.isDowned) {
      this.time.delayedCall(500, () => this._gameOver());
      return;
    }
    // Start revive check
    player._reviveTimer = 0;
    player._reviveRing = this.add.graphics();
  }

  _checkRevive(delta) {
    this.players.forEach(downed => {
      if (!downed.isDowned) return;
      const other = this.players.find(p => p !== downed && !p.isDowned);
      if (!other) return;

      const d = Phaser.Math.Distance.Between(downed.x, downed.y, other.x, other.y);
      const inRange = d <= 100;
      const takingDamage = other._takingDamage; // flag set when hit

      if (inRange && !takingDamage) {
        downed._reviveTimer += delta;
        // Draw revive ring
        if (downed._reviveRing) {
          downed._reviveRing.clear();
          const pct = downed._reviveTimer / other.reviveChannelTime;
          downed._reviveRing.lineStyle(4, 0x00ff00);
          downed._reviveRing.strokeCircle(downed.x, downed.y, 40);
          downed._reviveRing.fillStyle(0x00ff00, 0.3 * pct);
          downed._reviveRing.fillCircle(downed.x, downed.y, 40 * pct);
        }
        if (downed._reviveTimer >= other.reviveChannelTime) {
          downed._reviveRing?.destroy();
          downed.revive();
        }
      } else {
        downed._reviveTimer = 0;
        downed._reviveRing?.clear();
      }
    });
  }

  _onBossDefeated() {
    const elapsed = (this.time.now - this._bossStartTime) / 1000;
    const totalDamage = this._p1Damage + this._p2Damage;

    [1, 2].forEach(pid => {
      const damage = pid === 1 ? this._p1Damage : this._p2Damage;
      const survived = pid === 1 ? this._p1Survived : this._p2Survived;
      this.shopManager.awardBossCoins(pid, {
        survived,
        underTime: elapsed < 90,
        mostDamage: totalDamage > 0 && (damage / totalDamage) >= 0.5
      });
    });

    this.registry.set('bossIndex', this.bossIndex + 1);

    if (this.bossIndex + 1 >= BOSS_ORDER.length) {
      this.time.delayedCall(1000, () => this.scene.start('VictoryScene'));
    } else {
      this.time.delayedCall(1000, () => this.scene.start('ShopScene'));
    }
  }

  _gameOver() {
    this.shopManager.reset();
    this.registry.set('bossIndex', 0);
    this.scene.start('GameOverScene');
  }

  update(time, delta) {
    if (!this.boss) return;

    const allMinions = this.minions.getChildren();

    // Update players
    const p1Target = findTarget(this.player1, this.boss, allMinions);
    const p2Target = findTarget(this.player2, this.boss, allMinions);

    if (!this.player1.isDowned) this.player1.update(time, delta, this._p1Keys, p1Target, allMinions);
    if (!this.player2.isDowned) this.player2.update(time, delta, this._p2Keys, p2Target, allMinions);

    // Update boss
    this.boss.update(time, delta, this.players.filter(p => !p.isDowned));

    // Revive checks
    this._checkRevive(delta);

    // HUD
    this._updateHUD();
  }
}
```

- [ ] **Step 2: Update `src/data/bosses.js` to export with import**

```js
// src/data/bosses.js
export const BOSS_ORDER = [
  'KingSlime',
  'PyroSkull',
  'StormEagle',
  'IronGolem',
  'ShadowMimic',
  'Kraken',
  'VoidGod',
];
```

- [ ] **Step 3: Verify Boss 1 works in browser**

- Start game, navigate to BossScene manually (or temporarily set first scene to BossScene)
- Confirm: players move with WASD/arrows, auto-fire toward boss, King Slime moves and slams, HP bars update, boss defeat advances to shop

- [ ] **Step 4: Commit**

```bash
git add src/scenes/BossScene.js src/data/bosses.js
git commit -m "feat: BossScene with split-screen, auto-combat, revive, coin awards"
```

---

## Task 9: BootScene + MenuScene

**Files:**
- Modify: `src/scenes/BootScene.js`
- Modify: `src/scenes/MenuScene.js`

- [ ] **Step 1: Implement `BootScene.js`**

```js
// src/scenes/BootScene.js
export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    // Placeholder: generate colored rectangles as textures
    const playerColors = { brute: 0x4488ff, scout: 0xff8844 };
    Object.entries(playerColors).forEach(([id, color]) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(color); g.fillRect(0, 0, 40, 40);
      g.generateTexture(`player_${id}`, 40, 40);
      g.destroy();
    });

    const entityColors = {
      boss_kingslime: 0x44ff44,
      boss_pyroskull: 0xff4400,
      boss_stormeagle: 0xffff00,
      boss_irongolem: 0x888888,
      boss_shadowmimic: 0x440044,
      boss_kraken: 0x004488,
      boss_voidgod: 0x220022,
      minion: 0x88ff88,
      bullet: 0xffffff,
      boss_bullet: 0xff0000,
    };
    Object.entries(entityColors).forEach(([id, color]) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(color); g.fillRect(0, 0, 20, 20);
      g.generateTexture(id, 20, 20);
      g.destroy();
    });
  }

  create() {
    this.scene.start('MenuScene');
  }
}
```

- [ ] **Step 2: Implement `MenuScene.js`**

```js
// src/scenes/MenuScene.js
export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const cx = 1280 / 2, cy = 720 / 2;
    this.add.text(cx, cy - 150, 'BOSS RUSH', { fontSize: '64px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(cx, cy - 60, '2-Player Co-op', { fontSize: '28px', color: '#aaaaaa' }).setOrigin(0.5);

    const startBtn = this.add.text(cx, cy + 40, '[ PRESS ENTER TO START ]', { fontSize: '28px', color: '#44ff44' }).setOrigin(0.5);
    this.tweens.add({ targets: startBtn, alpha: 0, duration: 600, yoyo: true, repeat: -1 });

    this.add.text(cx, cy + 140, 'Player 1: WASD    Player 2: Arrow Keys', { fontSize: '18px', color: '#888888' }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => {
      // Initialize game state
      const ShopManagerModule = import('../systems/ShopManager.js');
      ShopManagerModule.then(({ ShopManager }) => {
        const sm = new ShopManager();
        this.registry.set('shopManager', sm);
        this.registry.set('bossIndex', 0);
        this.scene.start('CharacterSelectScene');
      });
    });
  }
}
```

> Note: Since ShopManager uses `module.exports` (for Jest), add a dual-export pattern or create a browser-compatible version. Simplest fix: use `export` in ShopManager for the browser and a wrapper for Jest.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/BootScene.js src/scenes/MenuScene.js
git commit -m "feat: BootScene generates placeholder textures, MenuScene with start flow"
```

---

## Task 10: CharacterSelectScene

**Files:**
- Modify: `src/scenes/CharacterSelectScene.js`

- [ ] **Step 1: Implement `CharacterSelectScene.js`**

```js
// src/scenes/CharacterSelectScene.js
import { CHARACTERS } from '../data/characters.js';

export default class CharacterSelectScene extends Phaser.Scene {
  constructor() { super('CharacterSelectScene'); }

  create() {
    this._selections = { 1: null, 2: null };
    this._confirmed = { 1: false, 2: false };
    const chars = Object.values(CHARACTERS);

    this.add.text(640, 40, 'SELECT YOUR CHARACTER', { fontSize: '36px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(320, 90, 'PLAYER 1 (WASD)', { fontSize: '22px', color: '#4488ff' }).setOrigin(0.5);
    this.add.text(960, 90, 'PLAYER 2 (ARROWS)', { fontSize: '22px', color: '#ff8844' }).setOrigin(0.5);

    // Draw character cards
    chars.forEach((char, i) => {
      const x = 220 + i * 240;
      // Player 1 side
      const card1 = this.add.rectangle(x, 360, 180, 220, 0x222244).setInteractive();
      this.add.rectangle(x, 300, 60, 60, char.color);
      this.add.text(x, 370, char.name, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
      this.add.text(x, 400, `HP: ${char.hp}  SPD: ${char.speed}`, { fontSize: '14px', color: '#aaa' }).setOrigin(0.5);
      this.add.text(x, 420, `DMG: ${char.rangedDamage}/${char.meleeDamage}`, { fontSize: '14px', color: '#aaa' }).setOrigin(0.5);

      // Player 2 side (offset right)
      const x2 = 220 + i * 240 + 640;
      this.add.rectangle(x2, 360, 180, 220, 0x442222);
      this.add.rectangle(x2, 300, 60, 60, char.color);
      this.add.text(x2, 370, char.name, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
      this.add.text(x2, 400, `HP: ${char.hp}  SPD: ${char.speed}`, { fontSize: '14px', color: '#aaa' }).setOrigin(0.5);
    });

    this._p1Text = this.add.text(320, 580, 'Press A/D to select, ENTER to confirm', { fontSize: '16px', color: '#4488ff' }).setOrigin(0.5);
    this._p2Text = this.add.text(960, 580, 'Press LEFT/RIGHT to select, SHIFT to confirm', { fontSize: '16px', color: '#ff8844' }).setOrigin(0.5);

    this._p1Index = 0;
    this._p2Index = 1;
    this._p1Cursor = this.add.rectangle(220, 360, 184, 224, 0x4488ff, 0).setStrokeStyle(3, 0x4488ff);
    this._p2Cursor = this.add.rectangle(220 + 240 + 640, 360, 184, 224, 0xff8844, 0).setStrokeStyle(3, 0xff8844);
    this._updateCursors();

    this._setupInput(chars);
  }

  _updateCursors() {
    const chars = Object.values(CHARACTERS);
    this._p1Cursor.setPosition(220 + this._p1Index * 240, 360);
    this._p2Cursor.setPosition(220 + this._p2Index * 240 + 640, 360);
  }

  _setupInput(chars) {
    this.input.keyboard.on('keydown', (e) => {
      if (!this._confirmed[1]) {
        if (e.key === 'a' || e.key === 'A') { this._p1Index = (this._p1Index - 1 + chars.length) % chars.length; this._updateCursors(); }
        if (e.key === 'd' || e.key === 'D') { this._p1Index = (this._p1Index + 1) % chars.length; this._updateCursors(); }
        if (e.key === 'Enter') { this._confirmPlayer(1, chars[this._p1Index].id); }
      }
      if (!this._confirmed[2]) {
        if (e.key === 'ArrowLeft') { this._p2Index = (this._p2Index - 1 + chars.length) % chars.length; this._updateCursors(); }
        if (e.key === 'ArrowRight') { this._p2Index = (this._p2Index + 1) % chars.length; this._updateCursors(); }
        if (e.key === 'Shift') { this._confirmPlayer(2, chars[this._p2Index].id); }
      }
    });
  }

  _confirmPlayer(pid, charId) {
    // Prevent same character
    const otherId = pid === 1 ? this._selections[2] : this._selections[1];
    if (otherId === charId) return;

    this._selections[pid] = charId;
    this._confirmed[pid] = true;

    const label = pid === 1 ? this._p1Text : this._p2Text;
    label.setText(`✓ ${charId.toUpperCase()} CONFIRMED`);

    if (this._confirmed[1] && this._confirmed[2]) {
      this.registry.set('selectedCharacters', this._selections);
      this.time.delayedCall(500, () => this.scene.start('BossScene'));
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/scenes/CharacterSelectScene.js
git commit -m "feat: CharacterSelectScene with cursor selection and conflict prevention"
```

---

## Task 11: ShopScene

**Files:**
- Modify: `src/scenes/ShopScene.js`

- [ ] **Step 1: Implement `ShopScene.js`**

```js
// src/scenes/ShopScene.js
import { WEAPONS } from '../data/weapons.js';

export default class ShopScene extends Phaser.Scene {
  constructor() { super('ShopScene'); }

  create() {
    const sm = this.registry.get('shopManager');
    this._confirmed = { 1: false, 2: false };

    this.add.text(640, 30, 'SHOP', { fontSize: '48px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(320, 80, `PLAYER 1  💰 ${sm.getCoins(1)}`, { fontSize: '22px', color: '#4488ff' }).setOrigin(0.5);
    this.add.text(960, 80, `PLAYER 2  💰 ${sm.getCoins(2)}`, { fontSize: '22px', color: '#ff8844' }).setOrigin(0.5);

    this._buildShopUI(sm);

    // Done buttons
    this.add.text(320, 660, '[ENTER] Done', { fontSize: '20px', color: '#44ff44' }).setOrigin(0.5);
    this.add.text(960, 660, '[SHIFT] Done', { fontSize: '20px', color: '#44ff44' }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => this._confirm(1));
    this.input.keyboard.once('keydown-SHIFT', () => this._confirm(2));
  }

  _buildShopUI(sm) {
    const weapons = Object.values(WEAPONS).filter(w => w.price > 0);
    const upgrades = [
      { id: 'hpUp', name: 'HP Up (+20)', price: 50 },
      { id: 'speedUp', name: 'Speed Up (+10%)', price: 60 },
      { id: 'damageUp', name: 'Damage Up (+15%)', price: 70 },
      { id: 'fastRevive', name: 'Fast Revive (-1s)', price: 80 },
    ];

    // Draw for each player (left = P1, right = P2)
    [1, 2].forEach(pid => {
      const ox = pid === 1 ? 0 : 640;
      let y = 140;

      this.add.text(ox + 320, y, '— WEAPONS —', { fontSize: '16px', color: '#aaa' }).setOrigin(0.5);
      y += 30;

      weapons.forEach(w => {
        const txt = this.add.text(ox + 320, y, `${w.name}  ${w.price}🪙`, { fontSize: '16px', color: '#fff' }).setOrigin(0.5).setInteractive();
        txt.on('pointerdown', () => {
          if (sm.buyWeapon(pid, w.id)) this._refresh();
        });
        y += 30;
      });

      y += 20;
      this.add.text(ox + 320, y, '— UPGRADES —', { fontSize: '16px', color: '#aaa' }).setOrigin(0.5);
      y += 30;

      upgrades.forEach(u => {
        const count = sm.getUpgradeCount(pid, u.id);
        const maxed = count >= 3;
        const label = `${u.name}  ${u.price}🪙  [${count}/3]`;
        const color = maxed ? '#555555' : '#ffffff';
        const txt = this.add.text(ox + 320, y, label, { fontSize: '15px', color }).setOrigin(0.5);
        if (!maxed) {
          txt.setInteractive();
          txt.on('pointerdown', () => {
            if (sm.buyUpgrade(pid, u.id)) this._refresh();
          });
        }
        y += 28;
      });
    });
  }

  _refresh() {
    this.scene.restart();
  }

  _confirm(pid) {
    this._confirmed[pid] = true;
    if (this._confirmed[1] && this._confirmed[2]) {
      this.scene.start('BossScene');
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/scenes/ShopScene.js
git commit -m "feat: ShopScene with weapon and upgrade purchasing"
```

---

## Task 12: GameOverScene + VictoryScene

**Files:**
- Modify: `src/scenes/GameOverScene.js`
- Modify: `src/scenes/VictoryScene.js`

- [ ] **Step 1: Implement both scenes**

```js
// src/scenes/GameOverScene.js
export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }
  create() {
    const cx = 640, cy = 360;
    this.add.text(cx, cy - 80, 'GAME OVER', { fontSize: '72px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(cx, cy + 20, 'Both heroes fell...', { fontSize: '28px', color: '#aaaaaa' }).setOrigin(0.5);
    const retry = this.add.text(cx, cy + 120, '[ ENTER to Retry ]', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    this.tweens.add({ targets: retry, alpha: 0, duration: 600, yoyo: true, repeat: -1 });
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('CharacterSelectScene'));
  }
}

// src/scenes/VictoryScene.js
export default class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }
  create() {
    const cx = 640, cy = 360;
    this.add.text(cx, cy - 80, 'VICTORY!', { fontSize: '72px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(cx, cy + 20, 'The Void God has been defeated!', { fontSize: '26px', color: '#aaaaaa' }).setOrigin(0.5);
    const again = this.add.text(cx, cy + 120, '[ ENTER to Play Again ]', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    this.tweens.add({ targets: again, alpha: 0, duration: 600, yoyo: true, repeat: -1 });
    this.input.keyboard.once('keydown-ENTER', () => {
      this.registry.get('shopManager').reset();
      this.registry.set('bossIndex', 0);
      this.scene.start('CharacterSelectScene');
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/scenes/GameOverScene.js src/scenes/VictoryScene.js
git commit -m "feat: GameOverScene and VictoryScene with retry/replay flow"
```

---

## Task 13: Remaining Bosses (2–7)

Implement each boss following the same pattern as KingSlime. Each file: `src/entities/bosses/<BossName>.js`.

For each boss:
1. Extend `BaseBoss`
2. Set correct `hp` in config
3. Implement `updateBoss(time, delta, players)` — movement + attacks
4. Implement `onPhaseChange(phase)` — intensify attacks
5. Emit `bossBullet` events that BossScene catches to spawn projectiles

- [ ] **Step 1: PyroSkull (Boss 2)**

Key mechanics: `_doFireballPattern(n)` fires n bullets in spread; `_doFireWave()` spawns a rotating ring. Phase 2: 5-way + double-speed wave.

- [ ] **Step 2: StormEagle (Boss 3)**

Key mechanics: `_dive(target)` — rapid dash toward a player; `_lightningStrike(target)` — warn indicator then instant damage. Phase 2: double dive + chain hits both players.

- [ ] **Step 3: IronGolem (Boss 4)**

Key mechanics: `_stomp()` — shockwave ring; `_throwBoulder(target)` — slow projectile. Phase 2: `armorBroken = true` sets `_damageMult = 1.5`; rock orbit (`_createOrbit()`).

- [ ] **Step 4: ShadowMimic (Boss 5)**

Key mechanics: Copy `players[nearest].weaponId` and fire at 70% damage. Phase 2: Split into 2 clone instances each with 40% HP. Track combined HP for bar.

- [ ] **Step 5: Kraken (Boss 6)**

Key mechanics: `_tentacles` array — 4 GameObjects that independently sweep toward players every 2s. `_inkPuddles` — placed under players, 50% slow. Phase 2: +2 tentacles, puddles damage.

- [ ] **Step 6: VoidGod (Boss 7)**

Key mechanics: Phase 1 — spread orbs + homing black holes. Phase 2 (66%) — `rangedImmune = true`. Phase 3 (33%) — spawn void shards orbiting boss. Override `takeDamage` to reject ranged in phase 2+.

- [ ] **Step 7: Update `src/data/bosses.js` with all imports**

```js
import KingSlime from '../entities/bosses/KingSlime.js';
import PyroSkull from '../entities/bosses/PyroSkull.js';
import StormEagle from '../entities/bosses/StormEagle.js';
import IronGolem from '../entities/bosses/IronGolem.js';
import ShadowMimic from '../entities/bosses/ShadowMimic.js';
import Kraken from '../entities/bosses/Kraken.js';
import VoidGod from '../entities/bosses/VoidGod.js';

export const BOSS_CLASSES = {
  KingSlime, PyroSkull, StormEagle, IronGolem, ShadowMimic, Kraken, VoidGod
};
export const BOSS_ORDER = ['KingSlime','PyroSkull','StormEagle','IronGolem','ShadowMimic','Kraken','VoidGod'];
```

- [ ] **Step 8: Update BossScene to use `BOSS_CLASSES` map directly (no dynamic import)**

- [ ] **Step 9: Commit after each boss**

```bash
git add src/entities/bosses/<BossName>.js
git commit -m "feat: Boss N — <BossName> with attacks and phase system"
```

---

## Task 14: ShopManager Dual-Export Fix

The ShopManager uses `module.exports` for Jest but needs `export` for the browser.

- [ ] **Step 1: Add dual-export footer to `ShopManager.js`**

```js
// At the bottom of ShopManager.js, after the class:
if (typeof module !== 'undefined') module.exports = { ShopManager };
export { ShopManager };
```

- [ ] **Step 2: Same for CombatSystem.js**

```js
if (typeof module !== 'undefined') module.exports = { findTarget, calculateDamage, dist };
export { findTarget, calculateDamage, dist };
```

- [ ] **Step 3: Run all tests**

```bash
npx jest
```
Expected: All PASS

- [ ] **Step 4: Commit**

```bash
git add src/systems/ShopManager.js src/systems/CombatSystem.js
git commit -m "fix: dual-export for Jest + ES module compatibility"
```

---

## Task 15: Polish Pass

- [ ] Add screen-shake on boss slam/stomp (`this.cameras.main.shake(200, 0.01)`)
- [ ] Add tween flash on player hit (red tint briefly)
- [ ] Add boss name text displayed briefly at fight start
- [ ] Add coin counter in ShopScene updating live after purchases
- [ ] Verify all 7 bosses reachable by manually setting `bossIndex` in registry
- [ ] Final test: full run from Menu → Boss 7 → Victory
- [ ] Commit

```bash
git add -A
git commit -m "feat: polish — screen shake, hit flash, boss intro text, live coin display"
```

---

## Running the Game

```bash
npm run serve
# Open http://localhost:8080
```

## Running Tests

```bash
npm test
```
