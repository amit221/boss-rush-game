import { WEAPONS } from '../data/weapons.js';
import { FONT_FAMILY } from '../ui/theme.js';

const UPGRADES = [
  { id: 'hpUp',      name: 'HP Up (+20)',      price: 50  },
  { id: 'speedUp',   name: 'Speed (+10%)',      price: 60  },
  { id: 'damageUp',  name: 'Damage (+15%)',     price: 70  },
  { id: 'fastRevive',name: 'Fast Revive (-1s)', price: 80  },
];

export default class ShopScene extends Phaser.Scene {
  constructor() { super('ShopScene'); }

  create() {
    this._sm = this.registry.get('shopManager');
    this._playerCount = this.registry.get('playerCount') ?? 2;
    this._confirmed = { 1: false, 2: this._playerCount === 1 };
    this._buildUI();
    this._setupInput();
  }

  _buildUI() {
    const sm = this._sm;
    this.add.rectangle(640, 360, 1280, 720, 0x000000).setDepth(-10);
    this.add.text(640, 30, 'SHOP', { fontFamily: FONT_FAMILY, fontSize: '28px', color: '#ffdd00' }).setOrigin(0.5);

    const pids = this._playerCount === 1 ? [1] : [1, 2];
    pids.forEach(pid => {
      const ox = this._playerCount === 1 ? 320 : (pid === 1 ? 0 : 640);
      const color = pid === 1 ? '#4488ff' : '#ff8844';

      this.add.text(ox + 320, 80, `PLAYER ${pid}`, { fontFamily: FONT_FAMILY, fontSize: '14px', color }).setOrigin(0.5);
      this.add.text(ox + 320, 110, `Coins: ${sm.getCoins(pid)}`, { fontFamily: FONT_FAMILY, fontSize: '12px', color: '#ffdd00' }).setOrigin(0.5);

      // Divider
      this.add.line(ox + 320, 135, 0, 0, 240, 0, 0x444444);

      // Weapons
      this.add.text(ox + 320, 155, '— WEAPONS —', { fontFamily: FONT_FAMILY, fontSize: '9px', color: '#888888' }).setOrigin(0.5);
      let y = 180;
      const shopWeapons = Object.values(WEAPONS).filter(w => w.price > 0);
      shopWeapons.forEach(w => {
        const equipped = sm.getEquippedWeapon(pid) === w.id;
        const canAfford = sm.getCoins(pid) >= w.price;
        const col = equipped ? '#44ff44' : canAfford ? '#ffffff' : '#555555';
        const label = `${w.name}  [${w.price}c]${equipped ? ' ✓' : ''}`;
        const t = this.add.text(ox + 320, y, label, { fontFamily: FONT_FAMILY, fontSize: '14px', color: col }).setOrigin(0.5);
        if (!equipped) {
          t.setInteractive({ useHandCursor: true });
          t.on('pointerdown', () => {
            if (sm.buyWeapon(pid, w.id)) this.scene.restart();
          });
          t.on('pointerover', () => { if (canAfford) t.setColor('#ffff88'); });
          t.on('pointerout', () => t.setColor(col));
        }
        y += 28;
      });

      // Upgrades
      y += 10;
      this.add.text(ox + 320, y, '— UPGRADES —', { fontFamily: FONT_FAMILY, fontSize: '9px', color: '#888888' }).setOrigin(0.5);
      y += 25;
      UPGRADES.forEach(u => {
        const count = sm.getUpgradeCount(pid, u.id);
        const maxed = count >= 3;
        const canAfford = sm.getCoins(pid) >= u.price;
        const col = maxed ? '#555555' : canAfford ? '#ffffff' : '#555555';
        const label = `${u.name}  [${u.price}c]  ${count}/3`;
        const t = this.add.text(ox + 320, y, label, { fontFamily: FONT_FAMILY, fontSize: '14px', color: col }).setOrigin(0.5);
        if (!maxed) {
          t.setInteractive({ useHandCursor: true });
          t.on('pointerdown', () => {
            if (sm.buyUpgrade(pid, u.id)) this.scene.restart();
          });
          t.on('pointerover', () => { if (canAfford) t.setColor('#ffff88'); });
          t.on('pointerout', () => t.setColor(col));
        }
        y += 26;
      });

      // Done button
      const doneColor = this._confirmed?.[pid] ? '#44ff44' : '#ffffff';
      const doneKey = pid === 1 ? 'ENTER' : 'SHIFT';
      this.add.text(ox + 320, 670, `[${doneKey}] Done`, { fontFamily: FONT_FAMILY, fontSize: '12px', color: doneColor }).setOrigin(0.5);
    });

    // Center divider — only in 2P
    if (this._playerCount === 2) {
      this.add.line(640, 360, 0, -360, 0, 360, 0x333333).setLineWidth(2);
    }
  }

  _setupInput() {
    this.input.keyboard.on('keydown-ENTER', () => this._confirm(1));
    this.input.keyboard.on('keydown-SHIFT', () => this._confirm(2));
  }

  _confirm(pid) {
    this._confirmed[pid] = true;
    if (this._confirmed[1] && this._confirmed[2]) {
      this.scene.start('BossScene');
    }
  }
}
