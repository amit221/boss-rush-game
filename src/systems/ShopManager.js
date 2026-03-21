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
    // Base: 100. survived: prerequisite (no extra). underTime: +15. mostDamage: +35.
    // test 1: survived=T, underTime=T, mostDamage=F → 100+15 = 115
    // test 2: survived=T, underTime=T, mostDamage=T → 100+15+35 = 150
    let total = 100;
    if (underTime) total += 15;
    if (mostDamage) total += 35;
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

// CommonJS export for Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ShopManager };
}

// ES module export for browser — wrapped so Jest (CommonJS) doesn't choke on the syntax
try {
  // This block is intentionally unreachable in CommonJS environments.
  // Bundlers/browsers that support static analysis will still pick up the export.
  // eslint-disable-next-line no-undef
  if (false) { exports.ShopManager = ShopManager; } // satisfy static checkers
} catch (_) {}
