const STORAGE_KEY = 'bossRush_heroShop';
const STORAGE_VERSION = 2;

function sanitizeShards(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [k, v] of Object.entries(raw)) {
    if (typeof k !== 'string') continue;
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) out[k] = Math.floor(n);
  }
  return out;
}

function sanitizeTiers(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [k, v] of Object.entries(raw)) {
    if (typeof k !== 'string') continue;
    const n = Number(v);
    if (Number.isFinite(n)) out[k] = Math.floor(n);
  }
  return out;
}

function migrateV1ToV2(raw) {
  const byChar = {};
  const old = raw.byChar ?? {};
  for (const [charId, s] of Object.entries(old)) {
    if (typeof charId !== 'string' || !s || typeof s !== 'object') continue;
    const coins = Number.isFinite(s.coins) ? Math.max(0, Math.floor(s.coins)) : 0;
    const weapon = typeof s.weapon === 'string' ? s.weapon : 'default';
    const tiers = {};
    if (weapon !== 'default') tiers[weapon] = 0;
    byChar[charId] = {
      coins,
      weapon,
      shards: {},
      tiers,
    };
  }
  return { version: STORAGE_VERSION, byChar };
}

export function loadHeroShop() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === null) return {};
    const parsed = JSON.parse(v);
    if (!parsed || typeof parsed !== 'object') return {};

    let payload = parsed;
    if (parsed.version === 1) {
      payload = migrateV1ToV2(parsed);
      saveHeroShop(payload.byChar);
    } else if (parsed.version !== STORAGE_VERSION) {
      return {};
    }

    const byChar = payload.byChar ?? {};
    const result = {};
    for (const [charId, raw] of Object.entries(byChar)) {
      if (typeof charId !== 'string' || !raw || typeof raw !== 'object') continue;
      const weapon = typeof raw.weapon === 'string' ? raw.weapon : 'default';
      result[charId] = {
        coins: Number.isFinite(raw.coins) ? Math.max(0, Math.floor(raw.coins)) : 0,
        weapon,
        shards: sanitizeShards(raw.shards),
        tiers: sanitizeTiers(raw.tiers),
      };
    }
    return result;
  } catch {
    return {};
  }
}

export function saveHeroShop(byChar) {
  try {
    const payload = { version: STORAGE_VERSION, byChar };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
}

export function clearHeroShop() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
