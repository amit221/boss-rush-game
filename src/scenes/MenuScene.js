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

    this.add.text(cx, cy - 150, 'BOSS RUSH', {
      fontSize: '72px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#ff4444', strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(cx, cy - 60, '2-Player Co-op', {
      fontSize: '28px', color: '#aaaaaa'
    }).setOrigin(0.5);

    const startBtn = this.add.text(cx, cy + 40, '[ PRESS ENTER TO START ]', {
      fontSize: '28px', color: '#44ff44'
    }).setOrigin(0.5);
    this.tweens.add({ targets: startBtn, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });

    this.add.text(cx, cy + 130, 'Player 1: WASD     Player 2: Arrow Keys', {
      fontSize: '18px', color: '#888888'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 165, 'Auto-fire  •  Auto-melee  •  Revive your teammate', {
      fontSize: '16px', color: '#666666'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => {
      this.registry.set('shopManager', createShopManager());
      this.registry.set('bossIndex', 0);
      this.scene.start('CharacterSelectScene');
    });
  }
}
