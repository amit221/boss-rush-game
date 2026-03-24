import { installMemoryLocalStorage } from './memoryLocalStorage.js';
import {
  loadHeroShop,
  saveHeroShop,
  clearHeroShop,
} from '../src/persistence/heroShop.js';

const STORAGE_KEY = 'bossRush_heroShop';

describe('heroShop', () => {
  let ls;

  beforeEach(() => {
    ls = installMemoryLocalStorage();
  });

  afterEach(() => {
    delete global.localStorage;
  });

  test('loadHeroShop returns {} when key missing', () => {
    expect(loadHeroShop()).toEqual({});
  });

  test('loadHeroShop returns {} on invalid JSON', () => {
    ls.setItem(STORAGE_KEY, 'not-json{');
    expect(loadHeroShop()).toEqual({});
  });

  test('loadHeroShop returns {} when parsed is not an object', () => {
    ls.setItem(STORAGE_KEY, JSON.stringify(null));
    expect(loadHeroShop()).toEqual({});
  });

  test('loadHeroShop returns {} when version unknown', () => {
    ls.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 0, byChar: { brute: { coins: 99 } } }),
    );
    expect(loadHeroShop()).toEqual({});
  });

  test('loadHeroShop migrates v1 to v2 shape', () => {
    ls.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        byChar: {
          brute: {
            coins: 12,
            weapon: 'sniper',
            upgrades: { hpUp: 1 },
          },
        },
      }),
    );
    expect(loadHeroShop()).toEqual({
      brute: {
        coins: 12,
        weapon: 'sniper',
        shards: {},
        tiers: { sniper: 0 },
      },
    });
  });

  test('loadHeroShop sanitizes v2 per-character fields', () => {
    ls.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        byChar: {
          brute: {
            coins: 12.7,
            weapon: 'shotgun',
            shards: { shotgun: 3.2, bad: 'x' },
            tiers: { shotgun: 1 },
          },
          scout: {
            coins: NaN,
            weapon: 123,
            shards: null,
            tiers: null,
          },
        },
      }),
    );
    expect(loadHeroShop()).toEqual({
      brute: {
        coins: 12,
        weapon: 'shotgun',
        shards: { shotgun: 3 },
        tiers: { shotgun: 1 },
      },
      scout: {
        coins: 0,
        weapon: 'default',
        shards: {},
        tiers: {},
      },
    });
  });

  test('loadHeroShop floors coins and clamps negatives to 0', () => {
    ls.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        byChar: {
          brute: { coins: -3.2, weapon: 'default', shards: {}, tiers: {} },
        },
      }),
    );
    expect(loadHeroShop().brute.coins).toBe(0);
  });

  test('saveHeroShop round-trips through loadHeroShop', () => {
    const byChar = {
      brute: {
        coins: 40,
        weapon: 'shotgun',
        shards: { sniper: 2 },
        tiers: { shotgun: 0, sniper: -1 },
      },
    };
    saveHeroShop(byChar);
    expect(loadHeroShop()).toEqual(byChar);
    const raw = JSON.parse(ls.getItem(STORAGE_KEY));
    expect(raw.version).toBe(2);
    expect(raw.byChar).toEqual(byChar);
  });

  test('clearHeroShop removes storage key', () => {
    saveHeroShop({
      brute: { coins: 1, weapon: 'default', shards: {}, tiers: {} },
    });
    expect(ls.getItem(STORAGE_KEY)).toBeTruthy();
    clearHeroShop();
    expect(ls.getItem(STORAGE_KEY)).toBeNull();
    expect(loadHeroShop()).toEqual({});
  });
});
