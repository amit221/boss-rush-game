import { FONT_FAMILY } from '../ui/theme.js';

function createShopManager() {
  return {
    _coins: { 1: 0, 2: 0 },
    _weapons: { 1: 'default', 2: 'default' },
    _upgrades: { 1: {}, 2: {} },
    reset() {
      this._coins = { 1: 0, 2: 0 };
      this._weapons = { 1: 'default', 2: 'default' };
      this._upgrades = { 1: {}, 2: {} };
    },
    getCoins(pid) { return this._coins[pid] ?? 0; },
    addCoins(pid, n) { this._coins[pid] = (this._coins[pid] ?? 0) + n; },
    awardBossCoins(pid, { survived, underTime, mostDamage }) {
      let t = 100;
      if (survived) t += 20;
      if (underTime) t += 15;
      if (mostDamage) t += 15;
      this.addCoins(pid, t);
    },
    getEquippedWeapon(pid) { return this._weapons[pid] ?? 'default'; },
    buyWeapon(pid, wid) {
      const prices = { shotgun: 80, sniper: 100, boomerang: 90, flamethrower: 120 };
      const p = prices[wid];
      if (!p || this._coins[pid] < p) return false;
      this._coins[pid] -= p;
      this._weapons[pid] = wid;
      return true;
    },
    getUpgradeCount(pid, uid) { return this._upgrades[pid][uid] ?? 0; },
    buyUpgrade(pid, uid) {
      const prices = { hpUp: 50, speedUp: 60, damageUp: 70, fastRevive: 80 };
      const p = prices[uid];
      if (!p) return false;
      const c = this.getUpgradeCount(pid, uid);
      if (c >= 3 || this._coins[pid] < p) return false;
      this._coins[pid] -= p;
      this._upgrades[pid][uid] = c + 1;
      return true;
    },
    getUpgradesForPlayer(pid) { return { ...this._upgrades[pid] }; }
  };
}

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const cx = 640, cy = 360;

    this.add.image(cx, cy, 'bg_menu').setDepth(-10).setDisplaySize(1280, 720);
    this.add.rectangle(cx, cy, 1280, 720, 0x050510, 0.45).setDepth(-9);

    this.add.text(cx, cy - 150, 'BOSS RUSH', {
      fontFamily: FONT_FAMILY,
      fontSize: '40px', color: '#ffffff',
      stroke: '#ff4444', strokeThickness: 6,
    }).setOrigin(0.5);

    // Mode selection
    this._playerCount = 2;
    const opt1 = this.add.text(cx - 110, cy - 60, '1 Player',  { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#aaaaaa' }).setOrigin(0.5);
    const opt2 = this.add.text(cx + 110, cy - 60, '2 Players', { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);

    const controlsHint = this.add.text(cx, cy + 130, '', { fontFamily: FONT_FAMILY, fontSize: '11px', color: '#888888' }).setOrigin(0.5);
    this.add.text(cx, cy + 165, 'Auto-fire  •  Auto-melee  •  Revive your teammate', {
      fontFamily: FONT_FAMILY,
      fontSize: '9px', color: '#666666',
    }).setOrigin(0.5);

    const updateMode = () => {
      opt1.setColor(this._playerCount === 1 ? '#ffffff' : '#aaaaaa');
      opt2.setColor(this._playerCount === 2 ? '#ffffff' : '#aaaaaa');
      controlsHint.setText(
        this._playerCount === 1
          ? 'Player 1: WASD'
          : 'Player 1: WASD     Player 2: Arrow Keys'
      );
    };
    updateMode();

    const startBtn = this.add.text(cx, cy + 40, '[ PRESS ENTER TO START ]', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px', color: '#44ff44',
    }).setOrigin(0.5);
    this.tweens.add({ targets: startBtn, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });

    this.input.keyboard.on('keydown-LEFT',  () => { this._playerCount = 1; updateMode(); });
    this.input.keyboard.on('keydown-RIGHT', () => { this._playerCount = 2; updateMode(); });
    this.input.keyboard.once('keydown-ENTER', () => {
      this.registry.set('playerCount', this._playerCount);
      this.registry.set('shopManager', createShopManager());
      this.registry.set('bossIndex', 0);
      this.scene.start('CharacterSelectScene');
    });
  }
}
