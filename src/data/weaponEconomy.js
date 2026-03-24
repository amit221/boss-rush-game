import { WEAPONS } from './weapons.js';

/** Coins per single weapon-specific shard purchase in shop. */
export function getShardCoinPrice(weaponId) {
  const w = WEAPONS[weaponId];
  if (!w || weaponId === 'default') return 0;
  return Math.max(1, Math.floor(w.shardCoinPrice ?? 25));
}

/** Shards granted by one mystery box (fixed bundle, one random weapon type). */
export const MYSTERY_BOX_SHARD_COUNT = 2;
export const MYSTERY_BOX_COIN_PRICE = 40;

/**
 * Tier -1 = locked. Tier 0 = unlocked, no upgrades. Tier 1+ = upgrade levels.
 * Cost to go from tier t to t+1: t === -1 → 1 shard; else 2^(t+1) shards.
 */
export function shardsRequiredForNextAdvance(currentTier) {
  if (currentTier < -1) return Infinity;
  if (currentTier === -1) return 1;
  return 2 ** (currentTier + 1);
}

/** @returns {{ weaponId: string, shards: number }} */
export function rollMysteryBoxWeapon() {
  const pool = Object.values(WEAPONS).filter((w) => w.id !== 'default' && (w.mysteryWeight ?? 0) > 0);
  if (pool.length === 0) return { weaponId: 'shotgun', shards: MYSTERY_BOX_SHARD_COUNT };
  let total = 0;
  for (const w of pool) total += w.mysteryWeight;
  let r = Math.random() * total;
  for (const w of pool) {
    r -= w.mysteryWeight;
    if (r <= 0) return { weaponId: w.id, shards: MYSTERY_BOX_SHARD_COUNT };
  }
  return { weaponId: pool[pool.length - 1].id, shards: MYSTERY_BOX_SHARD_COUNT };
}
