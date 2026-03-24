const {
  shouldBossBeDefeated,
  isNegligibleBossHp,
  normalizeBossHp,
} = require('../src/entities/bosses/bossDefeatLogic.js');

describe('isNegligibleBossHp', () => {
  test('true for 0, negative, NaN', () => {
    expect(isNegligibleBossHp(0, 1500)).toBe(true);
    expect(isNegligibleBossHp(-1, 1500)).toBe(true);
    expect(isNegligibleBossHp(NaN, 1500)).toBe(true);
  });

  test('true for tiny residue that looks empty on bar (boss 4 scale)', () => {
    expect(isNegligibleBossHp(0.015, 1500)).toBe(true);
    expect(isNegligibleBossHp(0.5, 1500)).toBe(true);
    expect(isNegligibleBossHp(0.99, 1500)).toBe(true);
  });

  test('false for meaningful HP', () => {
    expect(isNegligibleBossHp(50, 1500)).toBe(false);
    expect(isNegligibleBossHp(2, 1500)).toBe(false);
  });
});

describe('normalizeBossHp', () => {
  test('snaps residue to 0', () => {
    expect(normalizeBossHp(0.02, 1500)).toBe(0);
    expect(normalizeBossHp(100, 1500)).toBe(100);
  });
});

describe('shouldBossBeDefeated', () => {
  test('true when hp negligible and not yet defeated', () => {
    expect(shouldBossBeDefeated(0, false, 1500)).toBe(true);
    expect(shouldBossBeDefeated(0.01, false, 1500)).toBe(true);
  });

  test('false when already defeated', () => {
    expect(shouldBossBeDefeated(0, true, 1500)).toBe(false);
  });

  test('false when hp still meaningful', () => {
    expect(shouldBossBeDefeated(100, false, 1500)).toBe(false);
  });
});
