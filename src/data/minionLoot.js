/** Coins awarded per loot-eligible minion kill (v1 constant; tune 5–15 band in playtest). */
export const MINION_COIN_VALUE = 10;

/** Uncollected coin pickups despawn after this many ms. */
export const MINION_COIN_DESPAWN_MS = 15000;

export function minionShouldDropCoins(minion) {
  if (!minion || minion.isTentacle) return false;
  return minion.dropsCoins === true;
}
