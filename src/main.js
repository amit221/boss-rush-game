import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import BossScene from './scenes/BossScene.js';
import ShopScene from './scenes/ShopScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#000000',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [BootScene, MenuScene, CharacterSelectScene, BossScene, ShopScene, GameOverScene, VictoryScene]
};

new Phaser.Game(config);
