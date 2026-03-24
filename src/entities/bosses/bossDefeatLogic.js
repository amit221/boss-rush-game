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
