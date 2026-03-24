const { ShopManager } = require('../src/systems/ShopManager.js');

describe('ShopManager', () => {
  let shop;
  beforeEach(() => { shop = new ShopManager(); });

  test('starts with 0 coins', () => {
    expect(shop.getCoins('brute')).toBe(0);
    expect(shop.getCoins('scout')).toBe(0);
  });

  test('awards coins after boss defeat', () => {
    shop.awardBossCoins('brute', { survived: true, underTime: true, mostDamage: false });
    expect(shop.getCoins('brute')).toBe(115);
  });

  test('awards full bonus when all criteria met', () => {
    shop.awardBossCoins('brute', { survived: true, underTime: true, mostDamage: true });
    expect(shop.getCoins('brute')).toBe(150);
  });

  test('buyWeaponShard adds shard and spends coins', () => {
    shop.addCoins('brute', 100);
    const ok = shop.buyWeaponShard('brute', 'sniper');
    expect(ok).toBe(true);
    expect(shop.getShardCount('brute', 'sniper')).toBe(1);
    expect(shop.getCoins('brute')).toBe(65);
  });

  test('advanceWeaponWithShards unlocks with first shard', () => {
    shop.addCoins('brute', 500);
    shop.buyWeaponShard('brute', 'shotgun');
    expect(shop.getWeaponTier('brute', 'shotgun')).toBe(-1);
    expect(shop.advanceWeaponWithShards('brute', 'shotgun')).toBe(true);
    expect(shop.getWeaponTier('brute', 'shotgun')).toBe(0);
    expect(shop.getShardCount('brute', 'shotgun')).toBe(0);
  });

  test('advanceWeaponWithShards upgrade costs double shards', () => {
    shop.addCoins('brute', 2000);
    shop.buyWeaponShard('brute', 'shotgun');
    shop.advanceWeaponWithShards('brute', 'shotgun');
    shop.buyWeaponShard('brute', 'shotgun');
    shop.buyWeaponShard('brute', 'shotgun');
    expect(shop.advanceWeaponWithShards('brute', 'shotgun')).toBe(true);
    expect(shop.getWeaponTier('brute', 'shotgun')).toBe(1);
    expect(shop.getShardCount('brute', 'shotgun')).toBe(0);
  });

  test('setEquippedWeapon requires unlock', () => {
    expect(shop.setEquippedWeapon('brute', 'sniper')).toBe(false);
    shop.addCoins('brute', 500);
    shop.buyWeaponShard('brute', 'sniper');
    shop.advanceWeaponWithShards('brute', 'sniper');
    expect(shop.setEquippedWeapon('brute', 'sniper')).toBe(true);
    expect(shop.getEquippedWeapon('brute')).toBe('sniper');
  });

  test('buyMysteryBox spends coins and grants shards', () => {
    shop.addCoins('brute', 200);
    const roll = shop.buyMysteryBox('brute');
    expect(roll).toBeTruthy();
    expect(roll.weaponId).toBeTruthy();
    expect(roll.shards).toBe(2);
    expect(shop.getCoins('brute')).toBe(160);
    expect(shop.getShardCount('brute', roll.weaponId)).toBe(2);
  });

  test('repairs equipped weapon when tier key missing from storage', () => {
    const mem = {
      loadHeroShop: () => ({
        brute: {
          coins: 10,
          weapon: 'shotgun',
          shards: { shotgun: 2 },
          tiers: {},
        },
      }),
      saveHeroShop: jest.fn(),
      clearHeroShop: () => {},
    };
    const s = new ShopManager(mem);
    expect(s.getEquippedWeapon('brute')).toBe('shotgun');
    expect(s.getWeaponTier('brute', 'shotgun')).toBe(0);
    expect(mem.saveHeroShop).toHaveBeenCalled();
  });

  test('resetAllHeroes clears all state', () => {
    shop.addCoins('brute', 200);
    shop.buyWeaponShard('brute', 'shotgun');
    shop.resetAllHeroes();
    expect(shop.getCoins('brute')).toBe(0);
    expect(shop.getShardCount('brute', 'shotgun')).toBe(0);
  });
});
