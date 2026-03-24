import { installMemoryLocalStorage } from './memoryLocalStorage.js';
import { BOSS_ORDER } from '../src/data/bossMetadata.js';
import {
  getMaxUnlockedStartIndex,
  recordBossDefeated,
} from '../src/persistence/bossUnlocks.js';

const STORAGE_KEY = 'bossRush_maxUnlockedStartIndex';

describe('bossUnlocks', () => {
  const maxIndex = BOSS_ORDER.length - 1;

  beforeEach(() => {
    installMemoryLocalStorage();
  });

  afterEach(() => {
    delete global.localStorage;
  });

  test('getMaxUnlockedStartIndex is 0 when key missing', () => {
    expect(getMaxUnlockedStartIndex()).toBe(0);
  });

  test('getMaxUnlockedStartIndex clamps negative and above max', () => {
    global.localStorage.setItem(STORAGE_KEY, '-5');
    expect(getMaxUnlockedStartIndex()).toBe(0);
    global.localStorage.setItem(STORAGE_KEY, String(maxIndex + 100));
    expect(getMaxUnlockedStartIndex()).toBe(maxIndex);
  });

  test('getMaxUnlockedStartIndex returns 0 for non-numeric stored value', () => {
    global.localStorage.setItem(STORAGE_KEY, 'abc');
    expect(getMaxUnlockedStartIndex()).toBe(0);
  });

  test('recordBossDefeated increases stored index when next beats current', () => {
    expect(getMaxUnlockedStartIndex()).toBe(0);
    recordBossDefeated(0);
    expect(getMaxUnlockedStartIndex()).toBe(1);
    recordBossDefeated(1);
    expect(getMaxUnlockedStartIndex()).toBe(2);
  });

  test('recordBossDefeated does not decrease stored index', () => {
    global.localStorage.setItem(STORAGE_KEY, '5');
    recordBossDefeated(0);
    expect(getMaxUnlockedStartIndex()).toBe(5);
  });

  test('recordBossDefeated caps at last boss index', () => {
    global.localStorage.setItem(STORAGE_KEY, String(maxIndex));
    recordBossDefeated(maxIndex);
    expect(getMaxUnlockedStartIndex()).toBe(maxIndex);
  });

  test('defeating last boss sets next to max index', () => {
    global.localStorage.removeItem(STORAGE_KEY);
    recordBossDefeated(maxIndex - 1);
    expect(getMaxUnlockedStartIndex()).toBe(maxIndex);
  });
});
