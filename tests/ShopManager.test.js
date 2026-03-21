const { ShopManager } = require('../src/systems/ShopManager.js');

describe('ShopManager', () => {
  let shop;
  beforeEach(() => { shop = new ShopManager(); });

  test('starts with 0 coins', () => {
    expect(shop.getCoins(1)).toBe(0);
    expect(shop.getCoins(2)).toBe(0);
  });

  test('awards coins after boss defeat', () => {
    shop.awardBossCoins(1, { survived: true, underTime: true, mostDamage: false });
    expect(shop.getCoins(1)).toBe(115); // 100 + 20 + 15
  });

  test('awards full bonus when all criteria met', () => {
    shop.awardBossCoins(1, { survived: true, underTime: true, mostDamage: true });
    expect(shop.getCoins(1)).toBe(150); // 100 + 20 + 15 + 15
  });

  test('can buy weapon if enough coins', () => {
    shop.addCoins(1, 100);
    const result = shop.buyWeapon(1, 'sniper'); // costs 100
    expect(result).toBe(true);
    expect(shop.getCoins(1)).toBe(0);
    expect(shop.getEquippedWeapon(1)).toBe('sniper');
  });

  test('cannot buy weapon if insufficient coins', () => {
    shop.addCoins(1, 50);
    const result = shop.buyWeapon(1, 'sniper'); // costs 100
    expect(result).toBe(false);
    expect(shop.getCoins(1)).toBe(50);
  });

  test('stat upgrade capped at 3 per run', () => {
    shop.addCoins(1, 1000);
    shop.buyUpgrade(1, 'damageUp');
    shop.buyUpgrade(1, 'damageUp');
    shop.buyUpgrade(1, 'damageUp');
    const result = shop.buyUpgrade(1, 'damageUp'); // 4th purchase
    expect(result).toBe(false);
  });

  test('getUpgradeCount returns correct count', () => {
    shop.addCoins(1, 200);
    shop.buyUpgrade(1, 'hpUp');
    shop.buyUpgrade(1, 'hpUp');
    expect(shop.getUpgradeCount(1, 'hpUp')).toBe(2);
  });

  test('reset clears all state', () => {
    shop.addCoins(1, 200);
    shop.buyUpgrade(1, 'hpUp');
    shop.reset();
    expect(shop.getCoins(1)).toBe(0);
    expect(shop.getUpgradeCount(1, 'hpUp')).toBe(0);
  });
});
