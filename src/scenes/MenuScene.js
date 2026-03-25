import { FONT_FAMILY, addMenuBackdrop, addTitleUnderline } from '../ui/theme.js';
import { T } from '../i18n/hebrew.js';
import { playUiConfirm, playUiNav } from '../audio/sfx.js';
import { ensureBgm } from '../audio/music.js';
import { createAudioControls } from '../ui/audioControls.js';
import { ShopManager } from '../systems/ShopManager.js';
import * as heroShop from '../persistence/heroShop.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const cx = 640, cy = 360;

    this.registry.set('shopWeaponPages', null);

    addMenuBackdrop(this);
    this.add.rectangle(cx, cy, 1240, 680, 0x000000, 0.25).setDepth(-9);

    const frame = this.add.graphics().setDepth(-8);
    frame.lineStyle(3, 0x6a4010, 1);
    frame.strokeRect(cx - 280, cy - 235, 560, 470);
    frame.fillStyle(0x8a5520, 1);
    frame.fillRect(cx - 285, cy - 240, 12, 12);
    frame.fillRect(cx + 273, cy - 240, 12, 12);
    frame.fillRect(cx - 285, cy + 228, 12, 12);
    frame.fillRect(cx + 273, cy + 228, 12, 12);

    const titleText = this.add.text(cx, cy - 150, T.gameTitle, {
      fontFamily: FONT_FAMILY,
      fontSize: '40px', color: '#ffcc44',
      stroke: '#441100', strokeThickness: 8,
      shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 2, fill: true },
    }).setOrigin(0.5);
    this.tweens.add({ targets: titleText, alpha: { from: 0.85, to: 1.0 }, duration: 300, yoyo: true, repeat: -1 });
    addTitleUnderline(this, cx, cy - 108, 320);

    [cx - 200, cx + 200].forEach(tx => {
      this.add.particles(tx, cy - 150, 'orb', {
        speed: { min: 15, max: 45 },
        angle: { min: 250, max: 290 },
        scale: { start: 0.25, end: 0 },
        alpha: { start: 0.9, end: 0 },
        lifespan: 600,
        frequency: 70,
        quantity: 2,
        tint: [0xff8800, 0xffcc44, 0xff4400],
        blendMode: 'ADD',
        depth: 5,
      });
    });

    this.add.particles(cx, 720, 'orb', {
      speed: { min: 15, max: 40 },
      angle: { min: 265, max: 275 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: { min: 2000, max: 5000 },
      frequency: 500,
      quantity: 1,
      tint: [0xff8800, 0xffcc44],
      blendMode: 'ADD',
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(-600, 0, 1200, 1)
      },
      depth: 5,
    });

    // Mode selection (default: 1 player)
    this._playerCount = 1;
    const opt1 = this.add.text(cx - 110, cy - 60, T.onePlayer,  { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#aaaaaa' }).setOrigin(0.5);
    const opt2 = this.add.text(cx + 110, cy - 60, T.twoPlayers, { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);

    const controlsHint = this.add.text(cx, cy + 130, '', { fontFamily: FONT_FAMILY, fontSize: '11px', color: '#888888' }).setOrigin(0.5);
    this.add.text(cx, cy + 165, T.gameplayHint, {
      fontFamily: FONT_FAMILY,
      fontSize: '9px', color: '#666666',
    }).setOrigin(0.5);

    const updateMode = () => {
      opt1.setColor(this._playerCount === 1 ? '#ffffff' : '#aaaaaa');
      opt2.setColor(this._playerCount === 2 ? '#ffffff' : '#aaaaaa');
      controlsHint.setText(
        this._playerCount === 1
          ? T.controlsP1Only
          : T.controlsP1P2
      );
    };
    updateMode();

    const startBtn = this.add.text(cx, cy + 40, T.pressEnterStart, {
      fontFamily: FONT_FAMILY,
      fontSize: '14px', color: '#66ffaa',
      stroke: '#114422', strokeThickness: 3,
    }).setOrigin(0.5);
    this.tweens.add({ targets: startBtn, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });

    const shopBtn = this.add.text(cx, cy + 90, T.shopFromMenu, {
      fontFamily: FONT_FAMILY,
      fontSize: '12px', color: '#ffbb44',
      stroke: '#4a3510', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    shopBtn.on('pointerover', () => shopBtn.setColor('#ffeeaa'));
    shopBtn.on('pointerout',  () => shopBtn.setColor('#ffbb44'));
    shopBtn.on('pointerdown', () => this._openShop());

    this._resetConfirming = false;
    this._resetPromptText = null;
    const resetHint = this.add.text(cx, cy + 195, T.resetProgressHint, {
      fontFamily: FONT_FAMILY,
      fontSize: '8px', color: '#555555',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-LEFT',  () => { playUiNav(this); this._playerCount = 1; updateMode(); });
    this.input.keyboard.on('keydown-RIGHT', () => { playUiNav(this); this._playerCount = 2; updateMode(); });
    this.input.keyboard.on('keydown-R', () => {
      if (this._resetConfirming) return;
      this._resetConfirming = true;
      playUiNav(this);
      if (this._resetPromptText) this._resetPromptText.destroy();
      this._resetPromptText = this.add.text(cx, cy + 225, T.resetConfirmPrompt, {
        fontFamily: FONT_FAMILY,
        fontSize: '10px', color: '#ffaa44',
      }).setOrigin(0.5);
    });
    this.input.keyboard.on('keydown-Y', () => {
      if (!this._resetConfirming) return;
      heroShop.clearHeroShop();
      playUiConfirm(this);
      if (this._resetPromptText) this._resetPromptText.destroy();
      this._resetPromptText = this.add.text(cx, cy + 225, T.resetDone, {
        fontFamily: FONT_FAMILY,
        fontSize: '10px', color: '#44ff44',
      }).setOrigin(0.5);
      this._resetConfirming = false;
      this.time.delayedCall(1500, () => {
        if (this._resetPromptText) { this._resetPromptText.destroy(); this._resetPromptText = null; }
      });
    });
    this.input.keyboard.on('keydown-N', () => {
      if (!this._resetConfirming) return;
      this._resetConfirming = false;
      if (this._resetPromptText) this._resetPromptText.destroy();
      this._resetPromptText = null;
    });
    this.input.keyboard.on('keydown-S', () => {
      if (this._resetConfirming) return;
      this._openShop();
    });
    this.input.keyboard.on('keydown-ENTER', () => {
      if (this._resetConfirming) return;
      playUiConfirm(this);
      this.registry.set('playerCount', this._playerCount);
      this.registry.set('shopManager', ShopManager.load(heroShop));
      this.scene.start('BossSelectScene');
    });

    ensureBgm(this, 'music_menu');
    createAudioControls(this);
  }

  _openShop() {
    playUiConfirm(this);
    this.registry.set('playerCount', this._playerCount);
    this.registry.set('shopManager', ShopManager.load(heroShop));
    const chars = this._playerCount === 1
      ? { 1: 'brute' }
      : { 1: 'brute', 2: 'scout' };
    this.registry.set('selectedCharacters', chars);
    this.scene.start('ShopScene');
  }
}
