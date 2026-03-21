import { CHARACTERS } from '../data/characters.js';
import { FONT_FAMILY } from '../ui/theme.js';

export default class CharacterSelectScene extends Phaser.Scene {
  constructor() { super('CharacterSelectScene'); }

  create() {
    const chars = Object.values(CHARACTERS);
    this._p1Index = 0;
    this._p2Index = 1;
    this._confirmed = { 1: false, 2: false };
    this._playerCount = this.registry.get('playerCount') ?? 2;
    this._p2Els = [];

    this.add.image(640, 360, 'bg_menu').setDepth(-10).setDisplaySize(1280, 720);
    this.add.rectangle(640, 360, 1280, 720, 0x0a0a18, 0.55).setDepth(-9);

    this.add.text(640, 35, 'SELECT YOUR CHARACTER', {
      fontFamily: FONT_FAMILY,
      fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(1);

    this.add.text(320, 90, 'PLAYER 1  (WASD)', { fontFamily: FONT_FAMILY, fontSize: '12px', color: '#4488ff' }).setOrigin(0.5);
    this._p2Els.push(
      this.add.text(960, 90, 'PLAYER 2  (ARROWS)', { fontFamily: FONT_FAMILY, fontSize: '12px', color: '#ff8844' }).setOrigin(0.5)
    );

    // Draw character cards for both sides
    this._cards1 = [];
    this._cards2 = [];
    chars.forEach((char, i) => {
      const x1 = 180 + i * 260;
      const x2 = x1 + 640;
      const y = 360;

      // P1 card
      const bg1 = this.add.rectangle(x1, y, 200, 240, 0x222244);
      this.add.rectangle(x1, y - 60, 78, 78, char.color, 0.35);
      this.add.image(x1, y - 60, char.textureKey).setDisplaySize(72, 72);
      this.add.text(x1, y + 10, char.name, { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
      this.add.text(x1, y + 45, `HP: ${char.hp}`, { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#aaaaaa' }).setOrigin(0.5);
      this.add.text(x1, y + 65, `SPD: ${char.speed}`, { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#aaaaaa' }).setOrigin(0.5);
      this.add.text(x1, y + 85, `DMG: ${char.rangedDamage}/${char.meleeDamage}`, { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#aaaaaa' }).setOrigin(0.5);
      this._cards1.push(bg1);

      // P2 card — collect all elements for hiding
      const bg2     = this.add.rectangle(x2, y, 200, 240, 0x442222);
      const color2  = this.add.rectangle(x2, y - 60, 78, 78, char.color, 0.35);
      const img2    = this.add.image(x2, y - 60, char.textureKey).setDisplaySize(72, 72);
      const name2   = this.add.text(x2, y + 10, char.name, { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
      const hp2     = this.add.text(x2, y + 45, `HP: ${char.hp}`, { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#aaaaaa' }).setOrigin(0.5);
      const spd2    = this.add.text(x2, y + 65, `SPD: ${char.speed}`, { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#aaaaaa' }).setOrigin(0.5);
      const dmg2    = this.add.text(x2, y + 85, `DMG: ${char.rangedDamage}/${char.meleeDamage}`, { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#aaaaaa' }).setOrigin(0.5);
      this._cards2.push(bg2);
      this._p2Els.push(bg2, color2, img2, name2, hp2, spd2, dmg2);
    });

    // Cursor outlines
    this._cursor1 = this.add.rectangle(0, 360, 204, 244, 0x4488ff, 0).setStrokeStyle(3, 0x4488ff);
    this._cursor2 = this.add.rectangle(0, 360, 204, 244, 0xff8844, 0).setStrokeStyle(3, 0xff8844);
    this._p2Els.push(this._cursor2);

    // Status texts
    this._status1 = this.add.text(320, 590, 'A/D to select  •  ENTER to confirm', { fontFamily: FONT_FAMILY, fontSize: '9px', color: '#4488ff' }).setOrigin(0.5);
    this._status2 = this.add.text(960, 590, 'LEFT/RIGHT to select  •  SHIFT to confirm', { fontFamily: FONT_FAMILY, fontSize: '9px', color: '#ff8844' }).setOrigin(0.5);
    this._p2Els.push(this._status2);

    if (this._playerCount === 1) {
      this._p2Els.forEach(el => el.setVisible(false));
      this._confirmed[2] = true;
    }

    this._updateCursors(chars);
    this._setupInput(chars);
  }

  _updateCursors(chars) {
    const x1 = 180 + this._p1Index * 260;
    const x2 = 180 + 640 + this._p2Index * 260;
    this._cursor1.setPosition(x1, 360);
    this._cursor2.setPosition(x2, 360);
  }

  _setupInput(chars) {
    this.input.keyboard.on('keydown', (e) => {
      if (!this._confirmed[1]) {
        if (e.key === 'a' || e.key === 'A') {
          this._p1Index = (this._p1Index - 1 + chars.length) % chars.length;
          this._updateCursors(chars);
        }
        if (e.key === 'd' || e.key === 'D') {
          this._p1Index = (this._p1Index + 1) % chars.length;
          this._updateCursors(chars);
        }
        if (e.key === 'Enter') {
          this._confirmPlayer(1, chars[this._p1Index].id, chars);
        }
      }
      if (!this._confirmed[2]) {
        if (e.key === 'ArrowLeft') {
          this._p2Index = (this._p2Index - 1 + chars.length) % chars.length;
          this._updateCursors(chars);
        }
        if (e.key === 'ArrowRight') {
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
    const label = pid === 1 ? this._status1 : this._status2;
    label.setText(`✓ ${charId.toUpperCase()} CONFIRMED`).setColor('#44ff44');

    if (this._confirmed[1] && this._confirmed[2]) {
      this.registry.set('selectedCharacters', {
        1: chars[this._p1Index].id,
        2: this._playerCount === 1 ? 'scout' : chars[this._p2Index].id
      });
      this.time.delayedCall(400, () => this.scene.start('BossScene'));
    }
  }
}
