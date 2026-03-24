import { getMusicMuted } from '../persistence/audioSettings.js';

/** Mixed for full-length OGG loops (denser than short jingles). */
const VOL_MENU = 0.24;
const VOL_BATTLE = 0.30;

function stopBgm(scene) {
  const g = scene.game.registry;
  const cur = g.get('bgm');
  if (cur) {
    try {
      cur.stop();
      cur.destroy();
    } catch { /* ignore */ }
  }
  g.set('bgm', null);
  g.set('bgmKey', null);
}

/**
 * Loop background music for the current context. Persists across scene changes via SoundManager.
 * @param {'music_menu'|'music_battle'} key
 */
export function ensureBgm(scene, key) {
  const g = scene.game.registry;
  g.set('activeBgmKey', key);

  if (getMusicMuted()) {
    stopBgm(scene);
    return null;
  }

  const cur = g.get('bgm');
  const lastKey = g.get('bgmKey');
  if (cur && lastKey === key && cur.isPlaying) return cur;

  stopBgm(scene);

  if (!scene.cache.audio.exists(key)) return null;

  const vol = key === 'music_battle' ? VOL_BATTLE : VOL_MENU;
  const sound = scene.sound.add(key, { loop: true, volume: vol });
  sound.play();
  g.set('bgm', sound);
  g.set('bgmKey', key);
  return sound;
}

/** Re-apply mute state after user toggles music (uses registry `activeBgmKey`). */
export function refreshBgmFromSettings(scene) {
  const key = scene.game.registry.get('activeBgmKey') || 'music_menu';
  return ensureBgm(scene, key);
}
