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
