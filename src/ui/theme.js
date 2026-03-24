/** Shared typography (matches Google Font in index.html; Hebrew-capable) */
export const FONT_FAMILY = '"Heebo", "Noto Sans Hebrew", sans-serif';

/** Phaser hex + CSS strings for one coherent “arcade dungeon” look */
export const COLORS = {
  bgDeep: 0x0a0600,
  bgPanel: 0x1a0c00,
  strokeDim: 0x4a2a00,
  strokeBright: 0xcc8822,
  gold: 0xffbb44,
  accentFire: 0xff6622,
  accentAmber: 0xffcc66,
  danger: 0xff3300,
  textMuted: '#8a7055',
  textBright: '#e8d4b0',
};

/**
 * Full-screen gradient behind UI (replaces flat black).
 */
export function addMenuBackdrop(scene, depth = -10) {
  const g = scene.add.graphics();
  g.fillGradientStyle(0x1e0e00, 0x120800, 0x0c0500, 0x080300, 1);
  g.fillRect(0, 0, 1280, 720);
  g.setDepth(depth);
  return g;
}

/**
 * Thin horizontal accent line (gold), for under titles.
 */
export function addTitleUnderline(scene, x, y, width = 280, depth = 0) {
  return scene.add.rectangle(x, y, width, 2, COLORS.gold, 0.92).setOrigin(0.5).setDepth(depth);
}

export function titleText(scene, x, y, str, sizePx = '48px', color = '#ffffff') {
  return scene.add.text(x, y, str, {
    fontFamily: FONT_FAMILY,
    fontSize: sizePx,
    color,
    align: 'center',
  }).setOrigin(0.5);
}

export function bodyText(scene, x, y, str, sizePx = '16px', color = '#cccccc') {
  return scene.add.text(x, y, str, {
    fontFamily: FONT_FAMILY,
    fontSize: sizePx,
    color,
    align: 'center',
  }).setOrigin(0.5);
}
