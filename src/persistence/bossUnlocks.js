import { BOSS_ORDER } from '../data/bossMetadata.js';

const STORAGE_KEY = 'bossRush_maxUnlockedStartIndex';

export function getMaxUnlockedStartIndex() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === null) return 0;
    const n = parseInt(v, 10);
    const max = BOSS_ORDER.length - 1;
    return Number.isFinite(n) ? Math.min(Math.max(0, n), max) : 0;
  } catch {
    return 0;
  }
}

export function recordBossDefeated(defeatedIndex) {
  const next = Math.min(defeatedIndex + 1, BOSS_ORDER.length - 1);
  const current = getMaxUnlockedStartIndex();
  if (next > current) {
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore storage errors
    }
  }
}
