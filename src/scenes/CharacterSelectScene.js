import { CHARACTERS } from '../data/characters.js';
import { FONT_FAMILY, addMenuBackdrop } from '../ui/theme.js';
import { T } from '../i18n/hebrew.js';
import { playUiConfirm, playUiNav, playUiBack } from '../audio/sfx.js';
import { ensureBgm } from '../audio/music.js';
import { createAudioControls } from '../ui/audioControls.js';

export default class CharacterSelectScene extends Phaser.Scene {
  constructor() { super('CharacterSelectScene'); }

  create() {
    const chars = Object.values(CHARACTERS);
    this._p1Index = 0;
    this._p2Index = 1;
    this._confirmed = { 1: false, 2: false };
    this._playerCount = this.registry.get('playerCount') ?? 1;
    this._p2Els = [];

    addMenuBackdrop(this);
    this.add.rectangle(640, 360, 1240, 680, 0x000000, 0.15).setDepth(-9);

    this.add.text(640, 35, T.selectCharacter, {
      fontFamily: FONT_FAMILY,
      fontSize: '22px', color: '#ffcc44',
      stroke: '#441100', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(1);

    this.add.text(320, 90, T.player1Wasd, { fontFamily: FONT_FAMILY, fontSize: '12px', color: '#4488ff' }).setOrigin(0.5);
    this._p2Els.push(
      this.add.text(960, 90, T.player2Arrows, { fontFamily: FONT_FAMILY, fontSize: '12px', color: '#ff8844' }).setOrigin(0.5)
    );

    // Draw character cards for both sides
    this._cards1 = [];
    this._cards2 = [];
    chars.forEach((char, i) => {
      const x1 = 180 + i * 260;
      const x2 = x1 + 640;
      const y = 360;

      // P1 card
      const bg1 = this.add.rectangle(x1, y, 200, 240, 0x1a0c00);
      bg1.setStrokeStyle(2, 0xcc8822);
      this.add.rectangle(x1, y - 60, 78, 78, char.color, 0.35);
      this.add.circle(x1, y - 60, 42, 0xff8800, 0.2);
      this.add.image(x1, y - 60, char.textureKey).setDisplaySize(72, 72);
      this.add.text(x1, y + 10, char.name, { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
      this.add.text(x1, y + 45, T.statHp(char.hp), { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#aaaaaa' }).setOrigin(0.5);
      this.add.text(x1, y + 65, T.statSpd(char.speed), { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#aaaaaa' }).setOrigin(0.5);
      this.add.text(x1, y + 85, T.statDmg(char.rangedDamage, char.meleeDamage), { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#aaaaaa' }).setOrigin(0.5);
      this._cards1.push(bg1);

      // P2 card — collect all elements for hiding
      const bg2     = this.add.rectangle(x2, y, 200, 240, 0x150900);
      bg2.setStrokeStyle(2, 0xff6600);
      const color2  = this.add.rectangle(x2, y - 60, 78, 78, char.color, 0.35);
      const glow2 = this.add.circle(x2, y - 60, 42, 0xff8800, 0.2);
      const img2    = this.add.image(x2, y - 60, char.textureKey).setDisplaySize(72, 72);
      const name2   = this.add.text(x2, y + 10, char.name, { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
      const hp2     = this.add.text(x2, y + 45, T.statHp(char.hp), { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#aaaaaa' }).setOrigin(0.5);
      const spd2    = this.add.text(x2, y + 65, T.statSpd(char.speed), { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#aaaaaa' }).setOrigin(0.5);
      const dmg2    = this.add.text(x2, y + 85, T.statDmg(char.rangedDamage, char.meleeDamage), { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#aaaaaa' }).setOrigin(0.5);
      this._cards2.push(bg2);
      this._p2Els.push(bg2, color2, glow2, img2, name2, hp2, spd2, dmg2);
    });

    // Cursor outlines
    this._cursor1 = this.add.rectangle(0, 360, 204, 244, 0x4488ff, 0).setStrokeStyle(3, 0x4488ff);
    this._cursor2 = this.add.rectangle(0, 360, 204, 244, 0xff8844, 0).setStrokeStyle(3, 0xff8844);
    this._p2Els.push(this._cursor2);

    // Status texts
    this._status1 = this.add.text(320, 590, T.charSelectHintP1, { fontFamily: FONT_FAMILY, fontSize: '8px', color: '#4488ff' }).setOrigin(0.5);
    this._status2 = this.add.text(960, 590, T.charSelectHintP2, { fontFamily: FONT_FAMILY, fontSize: '8px', color: '#ff8844' }).setOrigin(0.5);
    this._p2Els.push(this._status2);

    if (this._playerCount === 1) {
      this._p2Els.forEach(el => el.setVisible(false));
      this._confirmed[2] = true;
    }

    this._updateCursors(chars);
    this._setupInput(chars);

    ensureBgm(this, 'music_menu');
    createAudioControls(this);
  }

  _updateCursors(chars) {
    const x1 = 180 + this._p1Index * 260;
    const x2 = 180 + 640 + this._p2Index * 260;
    this._cursor1.setPosition(x1, 360);
    this._cursor2.setPosition(x2, 360);
  }

  _setupInput(chars) {
    this.input.keyboard.on('keydown', (e) => {
      if (e.key === 'Escape') {
        playUiBack(this);
        this.scene.start('BossSelectScene');
        return;
      }
      if (!this._confirmed[1]) {
        if (e.key === 'a' || e.key === 'A') {
          playUiNav(this);
          this._p1Index = (this._p1Index - 1 + chars.length) % chars.length;
          this._updateCursors(chars);
        }
        if (e.key === 'd' || e.key === 'D') {
          playUiNav(this);
          this._p1Index = (this._p1Index + 1) % chars.length;
          this._updateCursors(chars);
        }
        if (e.key === 'Enter') {
          this._confirmPlayer(1, chars[this._p1Index].id, chars);
        }
      }
      if (!this._confirmed[2]) {
        if (e.key === 'ArrowLeft') {
          playUiNav(this);
          this._p2Index = (this._p2Index - 1 + chars.length) % chars.length;
          this._updateCursors(chars);
        }
        if (e.key === 'ArrowRight') {
          playUiNav(this);
          this._p2Index = (this._p2Index + 1) % chars.length;
          this._updateCursors(chars);
        }
        if (e.key === 'Shift') {
          this._confirmPlayer(2, chars[this._p2Index].id, chars);
        }
      }
    });
  }

  _confirmPlayer(pid, charId, chars) {
    // In 2P mode, prevent both players picking the same character
    if (this._playerCount === 2) {
      const otherId = pid === 1 ? chars[this._p2Index]?.id : chars[this._p1Index]?.id;
      if (otherId === charId) return;
    }

    this._confirmed[pid] = true;
    playUiConfirm(this);
    const label = pid === 1 ? this._status1 : this._status2;
    const picked = chars.find((c) => c.id === charId);
    label.setText(T.characterConfirmed(picked?.name ?? charId)).setColor('#44ff44');

    if (this._confirmed[1] && this._confirmed[2]) {
      this.registry.set('selectedCharacters', {
        1: chars[this._p1Index].id,
        2: this._playerCount === 1 ? 'scout' : chars[this._p2Index].id
      });
      this.time.delayedCall(400, () => this.scene.start('BossScene'));
    }
  }
}
