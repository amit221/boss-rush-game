const {
  shouldBossBeDefeated,
  isNegligibleBossHp,
  normalizeBossHp,
  applyBossDamage,
  finalizeBossDefeatIfDead,
  attachBossDefeatEmitter,
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
    // Integer 1 HP on high-HP bosses must not soft-lock defeat
    expect(isNegligibleBossHp(1, 1500)).toBe(true);
    expect(isNegligibleBossHp(1, 4000)).toBe(true);
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
    expect(shouldBossBeDefeated(1, false, 3000)).toBe(true);
  });

  test('false when already defeated', () => {
    expect(shouldBossBeDefeated(0, true, 1500)).toBe(false);
  });

  test('false when hp still meaningful', () => {
    expect(shouldBossBeDefeated(100, false, 1500)).toBe(false);
  });
});

describe('applyBossDamage + finalizeBossDefeatIfDead', () => {
  test('applyBossDamage subtracts and normalizes', () => {
    const boss = { hp: 100, maxHp: 1500 };
    applyBossDamage(boss, 50);
    expect(boss.hp).toBe(50);
    applyBossDamage(boss, 9999);
    expect(boss.hp).toBe(0);
  });

  test('finalizeBossDefeatIfDead emits once', () => {
    const boss = { hp: 1, maxHp: 1500, _defeatedEmitted: false };
    const calls = [];
    boss.emit = (ev) => {
      if (ev === 'defeated') calls.push(1);
    };
    finalizeBossDefeatIfDead(boss);
    expect(calls.length).toBe(1);
    finalizeBossDefeatIfDead(boss);
    expect(calls.length).toBe(1);
  });

  test('attachBossDefeatEmitter wires on/emit', () => {
    const rect = { hp: 0, maxHp: 300, _defeatedEmitted: false };
    attachBossDefeatEmitter(rect);
    const seen = [];
    rect.on('defeated', () => seen.push('x'));
    applyBossDamage(rect, 1);
    finalizeBossDefeatIfDead(rect);
    expect(seen).toEqual(['x']);
  });
});
