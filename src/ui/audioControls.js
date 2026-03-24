import { COLORS } from './theme.js';
import {
  getSfxMuted,
  setSfxMuted,
  getMusicMuted,
  setMusicMuted,
} from '../persistence/audioSettings.js';
import { refreshBgmFromSettings } from '../audio/music.js';

const BTN = 42;
const GAP = 6;
const PAD = 12;
const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", sans-serif';

/**
 * Top-right music + SFX mute toggles (persists via localStorage).
 */
export function createAudioControls(scene, depth = 1000) {
  const right = 1280 - PAD - BTN / 2;
  const y = PAD + BTN / 2;

  const musicBg = scene.add.rectangle(right - BTN - GAP, y, BTN, BTN, COLORS.bgPanel, 0.92)
    .setStrokeStyle(2, COLORS.strokeDim)
    .setScrollFactor(0)
    .setDepth(depth)
    .setInteractive({ useHandCursor: true });

  const musicIcon = scene.add.text(right - BTN - GAP, y, '🎵', {
    fontFamily: EMOJI_FONT,
    fontSize: '22px',
    align: 'center',
  }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

  const sfxBg = scene.add.rectangle(right, y, BTN, BTN, COLORS.bgPanel, 0.92)
    .setStrokeStyle(2, COLORS.strokeDim)
    .setScrollFactor(0)
    .setDepth(depth)
    .setInteractive({ useHandCursor: true });

  const sfxIcon = scene.add.text(right, y, '🔊', {
    fontFamily: EMOJI_FONT,
    fontSize: '22px',
    align: 'center',
  }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

  function paintMusic() {
    const off = getMusicMuted();
    musicIcon.setText('🎵');
    musicBg.setFillStyle(off ? 0x2a2030 : COLORS.bgPanel, 0.92);
    musicIcon.setAlpha(off ? 0.45 : 1);
  }

  function paintSfx() {
    const off = getSfxMuted();
    sfxIcon.setText(off ? '🔇' : '🔊');
    sfxBg.setFillStyle(off ? 0x2a2030 : COLORS.bgPanel, 0.92);
    sfxIcon.setAlpha(off ? 0.55 : 1);
  }

  musicBg.on('pointerover', () => musicBg.setStrokeStyle(2, COLORS.strokeBright));
  musicBg.on('pointerout', () => musicBg.setStrokeStyle(2, COLORS.strokeDim));
  musicBg.on('pointerdown', () => {
    setMusicMuted(!getMusicMuted());
    refreshBgmFromSettings(scene);
    paintMusic();
  });

  sfxBg.on('pointerover', () => sfxBg.setStrokeStyle(2, COLORS.strokeBright));
  sfxBg.on('pointerout', () => sfxBg.setStrokeStyle(2, COLORS.strokeDim));
  sfxBg.on('pointerdown', () => {
    setSfxMuted(!getSfxMuted());
    paintSfx();
  });

  paintMusic();
  paintSfx();

  return { paintMusic, paintSfx };
}
