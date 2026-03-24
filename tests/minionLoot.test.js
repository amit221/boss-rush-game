import { MINION_COIN_VALUE, MINION_COIN_DESPAWN_MS, minionShouldDropCoins } from '../src/data/minionLoot.js';

describe('minionLoot', () => {
  test('MINION_COIN_VALUE is a positive integer', () => {
    expect(Number.isInteger(MINION_COIN_VALUE)).toBe(true);
    expect(MINION_COIN_VALUE).toBeGreaterThan(0);
  });

  test('MINION_COIN_DESPAWN_MS is positive', () => {
    expect(MINION_COIN_DESPAWN_MS).toBeGreaterThan(0);
  });

  test('minionShouldDropCoins', () => {
    expect(minionShouldDropCoins(null)).toBe(false);
    expect(minionShouldDropCoins({})).toBe(false);
    expect(minionShouldDropCoins({ dropsCoins: true })).toBe(true);
    expect(minionShouldDropCoins({ dropsCoins: true, isTentacle: true })).toBe(false);
    expect(minionShouldDropCoins({ dropsCoins: false })).toBe(false);
  });
});
