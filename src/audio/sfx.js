import { getSfxMuted } from '../persistence/audioSettings.js';

/**
 * Play a one-shot sound if loaded. Safe if audio missing or blocked by browser.
 */
export function playSfx(scene, key, opts = {}) {
  if (getSfxMuted()) return;
  if (!scene.sound || !scene.cache.audio.exists(key)) return;
  const { volume = 0.45, rate = 1 } = opts;
  try {
    scene.sound.play(key, { volume, rate });
  } catch {
    // ignore
  }
}

export function playUiConfirm(scene) { playSfx(scene, 'sfx_ui_confirm', { volume: 0.5 }); }
export function playUiNav(scene) { playSfx(scene, 'sfx_ui_nav', { volume: 0.35 }); }
export function playUiBack(scene) { playSfx(scene, 'sfx_ui_back', { volume: 0.4 }); }
export function playUiBuy(scene) { playSfx(scene, 'sfx_ui_buy', { volume: 0.45 }); }
