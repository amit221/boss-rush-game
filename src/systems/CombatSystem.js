const MINION_PRIORITY_RANGE = 150;

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function findTarget(player, boss, minions) {
  const nearMinions = minions.filter(m => dist(player, m) <= MINION_PRIORITY_RANGE);
  if (nearMinions.length === 0) return boss;
  return nearMinions.reduce((closest, m) =>
    dist(player, m) < dist(player, closest) ? m : closest
  );
}

/** @param {number} weaponTier Shard upgrade tier (0 = unlocked base only). */
function calculateDamage(baseDamage, weaponMultiplier, weaponTier) {
  const t = Number.isFinite(weaponTier) && weaponTier > 0 ? Math.floor(weaponTier) : 0;
  return baseDamage * weaponMultiplier * Math.pow(1.09, t);
}

// CommonJS export for Jest; browser usage handled via a wrapper module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { findTarget, calculateDamage, dist };
}
