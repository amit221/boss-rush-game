/**
 * Single defeat threshold for all boss HP: BaseBoss subclasses, ShadowMimic clones,
 * BossScene placeholder boss, and BossScene’s `shouldBossBeDefeated` safety check.
 * True when remaining HP is effectively zero (float residue or invisible on the bar).
 * Bosses use large maxHp (900+); integer 1 HP after damage must still count as dead.
 */
export function isNegligibleBossHp(hp, maxHp) {
  if (!Number.isFinite(hp)) return true;
  if (hp <= 0) return true;
  if (!Number.isFinite(maxHp) || maxHp <= 0) return hp < 1;
  // At least 2 absolute HP so integer 1 left after damage still counts as dead (bar is empty).
  const absCap = Math.max(2, maxHp * 1e-5);
  return hp < absCap || hp / maxHp < 1e-4;
}

/** Exported for unit tests and BossScene safety check */
export function shouldBossBeDefeated(hp, defeatedEmitted, maxHp = Infinity) {
  if (defeatedEmitted) return false;
  return isNegligibleBossHp(hp, maxHp);
}

/** Snap near-zero residue to 0 after damage so HP bar and defeat stay in sync */
export function normalizeBossHp(hp, maxHp) {
  if (!Number.isFinite(hp)) return 0;
  if (hp <= 0) return 0;
  if (isNegligibleBossHp(hp, maxHp)) return 0;
  return hp;
}

function bossMaxHp(boss) {
  const m = boss?.maxHp;
  return Number.isFinite(m) && m > 0 ? m : Infinity;
}

/**
 * Subtract damage and normalize HP — single pipeline for every boss-like entity.
 * Does not run phase UI or emit defeat; call finalizeBossDefeatIfDead after bar/phase hooks if needed.
 */
export function applyBossDamage(boss, amount) {
  if (!boss) return;
  const raw = Number(amount);
  const dmg = Number.isFinite(raw) && raw >= 0 ? raw : 0;
  const hp0 = Number.isFinite(boss.hp) ? boss.hp : 0;
  boss.hp = normalizeBossHp(Math.max(0, hp0 - dmg), bossMaxHp(boss));
}

/**
 * One defeat gate for all bosses: normalize HP, then emit "defeated" at most once.
 * Phaser boss sprites already implement emit/on; use attachBossDefeatEmitter for plain objects.
 */
export function finalizeBossDefeatIfDead(boss) {
  if (!boss) return;
  const maxHp = bossMaxHp(boss);
  boss.hp = normalizeBossHp(Number.isFinite(boss.hp) ? boss.hp : 0, maxHp);
  if (boss._defeatedEmitted) return;
  if (!shouldBossBeDefeated(boss.hp, false, maxHp)) return;
  boss._defeatedEmitted = true;
  if (typeof boss.emit === 'function') {
    boss.emit('defeated');
  }
}

/** Minimal event surface so placeholder bosses can share finalizeBossDefeatIfDead with BaseBoss */
export function attachBossDefeatEmitter(target) {
  const listeners = [];
  target.on = (event, fn, context) => {
    if (event !== 'defeated' || typeof fn !== 'function') return;
    listeners.push({ fn, context });
  };
  target.emit = (event, ...args) => {
    if (event !== 'defeated') return;
    listeners.slice().forEach(({ fn, context }) => {
      fn.apply(context, args);
    });
  };
}
