/**
 * Return to main menu and clear the current run (coins, upgrades, boss progress in registry).
 */
export function abandonRunToMenu(scene) {
  scene.registry.set('bossIndex', 0);
  scene.scene.start('MenuScene');
}
