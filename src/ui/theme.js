/** Shared typography (matches Google Font in index.html) */
export const FONT_FAMILY = '"Press Start 2P", monospace';

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
