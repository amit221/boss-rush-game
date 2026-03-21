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

function calculateDamage(baseDamage, weaponMultiplier, damageUpgradeCount) {
  return baseDamage * weaponMultiplier * Math.pow(1.15, damageUpgradeCount);
}

// CommonJS export for Jest; browser usage handled via a wrapper module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { findTarget, calculateDamage, dist };
}
