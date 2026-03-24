import { installMemoryLocalStorage } from './memoryLocalStorage.js';
import {
  getSfxMuted,
  setSfxMuted,
  getMusicMuted,
  setMusicMuted,
} from '../src/persistence/audioSettings.js';

const KEY_SFX = 'bossrush_sfxMuted';
const KEY_MUSIC = 'bossrush_musicMuted';

describe('audioSettings', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
  });

  afterEach(() => {
    delete global.localStorage;
  });

  test('SFX starts unmuted', () => {
    expect(getSfxMuted()).toBe(false);
  });

  test('setSfxMuted true stores flag; false removes key', () => {
    setSfxMuted(true);
    expect(global.localStorage.getItem(KEY_SFX)).toBe('1');
    expect(getSfxMuted()).toBe(true);
    setSfxMuted(false);
    expect(global.localStorage.getItem(KEY_SFX)).toBeNull();
    expect(getSfxMuted()).toBe(false);
  });

  test('music starts unmuted', () => {
    expect(getMusicMuted()).toBe(false);
  });

  test('setMusicMuted true stores flag; false removes key', () => {
    setMusicMuted(true);
    expect(global.localStorage.getItem(KEY_MUSIC)).toBe('1');
    expect(getMusicMuted()).toBe(true);
    setMusicMuted(false);
    expect(global.localStorage.getItem(KEY_MUSIC)).toBeNull();
    expect(getMusicMuted()).toBe(false);
  });
});
