import { WEAPONS } from '../data/weapons.js';
import {
  getShardCoinPrice,
  MYSTERY_BOX_COIN_PRICE,
  rollMysteryBoxWeapon,
  shardsRequiredForNextAdvance,
} from '../data/weaponEconomy.js';

const NOOP_STORAGE = {
  loadHeroShop: () => ({}),
  saveHeroShop: () => {},
  clearHeroShop: () => {},
};

function defaultCharState() {
  return {
    coins: 0,
    weapon: 'default',
    shards: {},
    tiers: {},
  };
}

class ShopManager {
  constructor(storage = NOOP_STORAGE) {
    this._storage = storage;
    this._byChar = {};
    this._load();
  }

  _load() {
    const loaded = this._storage.loadHeroShop();
    this._byChar = { ...loaded };
  }

  _ensure(charId) {
    if (!this._byChar[charId]) {
      this._byChar[charId] = defaultCharState();
    }
    const s = this._byChar[charId];
    if (typeof s.coins !== 'number') s.coins = 0;
    if (typeof s.weapon !== 'string') s.weapon = 'default';
    if (!s.shards || typeof s.shards !== 'object') s.shards = {};
    if (!s.tiers || typeof s.tiers !== 'object') s.tiers = {};
    // Save could miss tiers[id] while weapon stayed set — treat as unlocked base (tier 0).
    if (s.weapon !== 'default' && WEAPONS[s.weapon] && typeof s.tiers[s.weapon] !== 'number') {
      s.tiers[s.weapon] = 0;
      this._save();
    }
    return s;
  }

  _save() {
    this._storage.saveHeroShop(this._byChar);
  }

  _tier(s, weaponId) {
    if (weaponId === 'default') return 0;
    const t = s.tiers[weaponId];
    if (typeof t !== 'number') return -1;
    return t;
  }

  _setTier(s, weaponId, tier) {
    if (weaponId === 'default') return;
    s.tiers[weaponId] = tier;
  }

  getCoins(characterId) {
    return this._ensure(characterId).coins;
  }

  addCoins(characterId, amount) {
    const s = this._ensure(characterId);
    s.coins = Math.max(0, (s.coins ?? 0) + amount);
    this._save();
  }

  awardBossCoins(characterId, { survived, underTime, mostDamage }) {
    let total = 100;
    if (underTime) total += 15;
    if (mostDamage) total += 35;
    this.addCoins(characterId, total);
  }

  getEquippedWeapon(characterId) {
    const s = this._ensure(characterId);
    let w = s.weapon ?? 'default';
    if (!WEAPONS[w]) {
      s.weapon = 'default';
      this._save();
      return 'default';
    }
    if (w === 'default') return 'default';
    const t = s.tiers[w];
    if (typeof t === 'number' && t < 0) {
      s.weapon = 'default';
      this._save();
      return 'default';
    }
    return w;
  }

  /** @returns {boolean} */
  setEquippedWeapon(characterId, weaponId) {
    if (!WEAPONS[weaponId]) return false;
    const s = this._ensure(characterId);
    if (weaponId !== 'default' && this._tier(s, weaponId) < 0) return false;
    s.weapon = weaponId;
    this._save();
    return true;
  }

  getShardCount(characterId, weaponId) {
    if (weaponId === 'default') return 0;
    const s = this._ensure(characterId);
    const n = s.shards[weaponId];
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }

  getWeaponTier(characterId, weaponId) {
    return this._tier(this._ensure(characterId), weaponId);
  }

  /** Buy one shard for a weapon (coins). */
  buyWeaponShard(characterId, weaponId) {
    if (weaponId === 'default' || !WEAPONS[weaponId]) return false;
    const price = getShardCoinPrice(weaponId);
    const s = this._ensure(characterId);
    if (s.coins < price) return false;
    s.coins -= price;
    s.shards[weaponId] = (s.shards[weaponId] ?? 0) + 1;
    this._save();
    return true;
  }

  /** Spend shards to unlock (tier -1→0) or upgrade (tier k→k+1). */
  advanceWeaponWithShards(characterId, weaponId) {
    if (weaponId === 'default' || !WEAPONS[weaponId]) return false;
    const s = this._ensure(characterId);
    const cur = this._tier(s, weaponId);
    const need = shardsRequiredForNextAdvance(cur);
    const have = this.getShardCount(characterId, weaponId);
    if (have < need) return false;
    s.shards[weaponId] = have - need;
    this._setTier(s, weaponId, cur + 1);
    this._save();
    return true;
  }

  /** @returns {{ weaponId: string, shards: number } | null} */
  buyMysteryBox(characterId) {
    const s = this._ensure(characterId);
    if (s.coins < MYSTERY_BOX_COIN_PRICE) return null;
    s.coins -= MYSTERY_BOX_COIN_PRICE;
    const roll = rollMysteryBoxWeapon();
    s.shards[roll.weaponId] = (s.shards[roll.weaponId] ?? 0) + roll.shards;
    this._save();
    return roll;
  }

  shardsNeededForNext(characterId, weaponId) {
    if (weaponId === 'default') return 0;
    const cur = this.getWeaponTier(characterId, weaponId);
    return shardsRequiredForNextAdvance(cur);
  }

  resetAllHeroes() {
    this._byChar = {};
    this._storage.clearHeroShop();
  }

  static load(storage = NOOP_STORAGE) {
    return new ShopManager(storage);
  }
}

export { ShopManager };
