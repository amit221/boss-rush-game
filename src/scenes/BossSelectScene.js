import { BOSS_ORDER, BOSS_TEXTURE_KEYS, BOSS_LABELS } from '../data/bosses.js';
import { T } from '../i18n/hebrew.js';
import { getMaxUnlockedStartIndex } from '../persistence/bossUnlocks.js';
import { FONT_FAMILY, addMenuBackdrop, COLORS } from '../ui/theme.js';
import { playUiConfirm, playUiNav, playUiBack } from '../audio/sfx.js';
import { ensureBgm } from '../audio/music.js';
import { createAudioControls } from '../ui/audioControls.js';

const CARDS_PER_PAGE = 6;

export default class BossSelectScene extends Phaser.Scene {
  constructor() { super('BossSelectScene'); }

  create() {
    this._cursorIndex = 0;
    this._maxUnlocked = getMaxUnlockedStartIndex();
    this._page = 0;

    addMenuBackdrop(this);
    this.add.rectangle(640, 360, 1240, 680, 0x000000, 0.2).setDepth(-9);

    this.add.text(640, 35, T.selectBoss, {
      fontFamily: FONT_FAMILY,
      fontSize: '22px', color: '#fff8f0',
      stroke: '#1a1020', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(640, 75, T.bossSelectHint, {
      fontFamily: FONT_FAMILY,
      fontSize: '9px', color: '#888888',
    }).setOrigin(0.5);

    const maxPage = Math.max(0, Math.ceil(BOSS_ORDER.length / CARDS_PER_PAGE) - 1);
    this._pageText = this.add.text(640, 108, T.bossSelectPage(1, maxPage + 1), {
      fontFamily: FONT_FAMILY,
      fontSize: '10px', color: '#ccaa66',
    }).setOrigin(0.5);

    const cardW = 140;
    const cardH = 180;
    const spacing = 155;
    const y = 360;

    this._cardW = cardW;
    this._cardH = cardH;
    this._spacing = spacing;
    this._y = y;

    this._slots = [];
    for (let s = 0; s < CARDS_PER_PAGE; s++) {
      const bg = this.add.rectangle(0, y, cardW, cardH, 0x14141c);
      bg.setStrokeStyle(2, 0x333344);
      const sprite = this.add.image(0, y - 50, BOSS_TEXTURE_KEYS[BOSS_ORDER[0]]).setDisplaySize(64, 64);
      const label = this.add.text(0, y + 25, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '8px', color: '#ffffff',
      }).setOrigin(0.5);
      const lockText = this.add.text(0, y + 50, T.locked, {
        fontFamily: FONT_FAMILY,
        fontSize: '8px', color: '#ff4444',
      }).setOrigin(0.5);

      bg.setInteractive({ useHandCursor: true });
      const slotIndex = s;
      bg.on('pointerdown', () => {
        const g = this._page * CARDS_PER_PAGE + slotIndex;
        if (g < BOSS_ORDER.length && g <= this._maxUnlocked) {
          this._selectAndConfirm(g);
        }
      });
      bg.on('pointerover', () => {
        const g = this._page * CARDS_PER_PAGE + slotIndex;
        if (g >= BOSS_ORDER.length || g > this._maxUnlocked) return;
        if (this._cursorIndex !== g) playUiNav(this);
        this._cursorIndex = g;
        this._page = Math.floor(this._cursorIndex / CARDS_PER_PAGE);
        this._refreshSlots();
        this._updateCursor();
      });

      this._slots.push({ bg, sprite, label, lockText });
    }

    this._cursor = this.add.rectangle(0, y, cardW + 10, cardH + 10, 0, 0)
      .setStrokeStyle(3, COLORS.gold);

    this._refreshSlots();
    this._updateCursor();

    this.input.keyboard.on('keydown', (e) => {
      if (e.key === 'Escape') {
        playUiBack(this);
        this.scene.start('MenuScene');
        return;
      }
      const maxPageIdx = Math.max(0, Math.ceil(BOSS_ORDER.length / CARDS_PER_PAGE) - 1);

      if (e.key === 'q' || e.key === 'Q') {
        if (this._page > 0) {
          playUiNav(this);
          this._page -= 1;
          this._cursorIndex = this._page * CARDS_PER_PAGE;
          this._refreshSlots();
          this._updateCursor();
        }
        return;
      }
      if (e.key === 'e' || e.key === 'E') {
        if (this._page < maxPageIdx) {
          playUiNav(this);
          this._page += 1;
          this._cursorIndex = Math.min(this._page * CARDS_PER_PAGE, BOSS_ORDER.length - 1);
          this._refreshSlots();
          this._updateCursor();
        }
        return;
      }

      if (e.key === 'a' || e.key === 'A') {
        if (this._cursorIndex <= 0) return;
        const next = this._cursorIndex - 1;
        playUiNav(this);
        this._cursorIndex = next;
        this._page = Math.floor(this._cursorIndex / CARDS_PER_PAGE);
        this._refreshSlots();
        this._updateCursor();
      }
      if (e.key === 'd' || e.key === 'D') {
        if (this._cursorIndex >= BOSS_ORDER.length - 1) return;
        const next = this._cursorIndex + 1;
        playUiNav(this);
        this._cursorIndex = next;
        this._page = Math.floor(this._cursorIndex / CARDS_PER_PAGE);
        this._refreshSlots();
        this._updateCursor();
      }
      if (e.key === 'Enter') {
        if (this._cursorIndex <= this._maxUnlocked) {
          this._selectAndConfirm(this._cursorIndex);
        }
      }
    });

    ensureBgm(this, 'music_menu');
    createAudioControls(this);
  }

  _refreshSlots() {
    const maxPage = Math.max(0, Math.ceil(BOSS_ORDER.length / CARDS_PER_PAGE) - 1);
    this._pageText.setText(T.bossSelectPage(this._page + 1, maxPage + 1));

    const countOnPage = Math.min(
      CARDS_PER_PAGE,
      BOSS_ORDER.length - this._page * CARDS_PER_PAGE
    );
    const totalW = (countOnPage - 1) * this._spacing + this._cardW;
    const startX = (1280 - totalW) / 2 + this._cardW / 2;

    this._slots.forEach((slot, s) => {
      const globalIdx = this._page * CARDS_PER_PAGE + s;
      const x = startX + s * this._spacing;

      if (globalIdx >= BOSS_ORDER.length) {
        slot.bg.setVisible(false);
        slot.sprite.setVisible(false);
        slot.label.setVisible(false);
        slot.lockText.setVisible(false);
        slot.bg.disableInteractive();
        return;
      }

      const bossId = BOSS_ORDER[globalIdx];
      const unlocked = globalIdx <= this._maxUnlocked;

      slot.bg.setVisible(true).setPosition(x, this._y);
      slot.bg.setFillStyle(unlocked ? 0x252538 : 0x14141c);
      slot.bg.setStrokeStyle(2, unlocked ? COLORS.strokeBright : 0x333344);
      if (unlocked) {
        slot.bg.setInteractive({ useHandCursor: true });
      } else {
        slot.bg.disableInteractive();
      }

      slot.sprite.setVisible(true).setPosition(x, this._y - 50);
      slot.sprite.setTexture(BOSS_TEXTURE_KEYS[bossId]);

      slot.label.setVisible(true).setPosition(x, this._y + 25);
      slot.label.setText(BOSS_LABELS[bossId]);
      slot.label.setColor(unlocked ? '#ffffff' : '#555555');

      slot.lockText.setVisible(true).setPosition(x, this._y + 50);
      slot.lockText.setVisible(!unlocked);
    });
  }

  _updateCursor() {
    const local = this._cursorIndex - this._page * CARDS_PER_PAGE;
    const countOnPage = Math.min(
      CARDS_PER_PAGE,
      BOSS_ORDER.length - this._page * CARDS_PER_PAGE
    );
    const totalW = (countOnPage - 1) * this._spacing + this._cardW;
    const startX = (1280 - totalW) / 2 + this._cardW / 2;
    const x = startX + local * this._spacing;
    this._cursor.setPosition(x, this._y);
    this._cursor.setVisible(local >= 0 && local < countOnPage);
  }

  _selectAndConfirm(index) {
    playUiConfirm(this);
    this.registry.set('bossIndex', index);
    this.scene.start('CharacterSelectScene');
  }
}
