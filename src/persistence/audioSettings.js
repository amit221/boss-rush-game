const KEY_SFX = 'bossrush_sfxMuted';
const KEY_MUSIC = 'bossrush_musicMuted';

export function getSfxMuted() {
  try {
    return localStorage.getItem(KEY_SFX) === '1';
  } catch {
    return false;
  }
}

export function setSfxMuted(v) {
  try {
    if (v) localStorage.setItem(KEY_SFX, '1');
    else localStorage.removeItem(KEY_SFX);
  } catch { /* ignore */ }
}

export function getMusicMuted() {
  try {
    return localStorage.getItem(KEY_MUSIC) === '1';
  } catch {
    return false;
  }
}

export function setMusicMuted(v) {
  try {
    if (v) localStorage.setItem(KEY_MUSIC, '1');
    else localStorage.removeItem(KEY_MUSIC);
  } catch { /* ignore */ }
}
