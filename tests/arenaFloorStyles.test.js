import { BOSS_ORDER } from '../src/data/bossMetadata.js';
import { ARENA_FLOOR_STYLES, getArenaFloorStyle } from '../src/data/arenaFloorStyles.js';

describe('arenaFloorStyles', () => {
  it('defines a theme for every boss in the ladder', () => {
    BOSS_ORDER.forEach((name) => {
      expect(ARENA_FLOOR_STYLES[name]).toBeDefined();
      expect(typeof ARENA_FLOOR_STYLES[name].floorTint).toBe('number');
    });
  });

  it('getArenaFloorStyle falls back for unknown bosses', () => {
    const s = getArenaFloorStyle('NonexistentBoss');
    expect(s.floorTint).toBeDefined();
    expect(s.wallFill).toBeDefined();
  });
});
