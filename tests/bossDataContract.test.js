import {
  BOSS_ORDER,
  BOSS_TEXTURE_KEYS,
  BOSS_LABELS,
} from '../src/data/bossMetadata.js';
import { bossTextures } from '../src/data/graphicsManifest.js';
import { BOSS_AURA_COLORS } from '../src/data/bossAuraColors.js';

describe('boss data contract', () => {
  test('every BOSS_ORDER id is wired (texture key, label, manifest, aura)', () => {
    for (const id of BOSS_ORDER) {
      const texKey = BOSS_TEXTURE_KEYS[id];
      expect(texKey).toBeTruthy();
      expect(BOSS_LABELS[id]).toBeTruthy();
      expect(typeof BOSS_LABELS[id]).toBe('string');

      const manifest = bossTextures[id];
      expect(manifest).toBeTruthy();
      expect(manifest.key).toBe(texKey);
      expect(manifest.file || manifest.procedural).toBeTruthy();

      expect(BOSS_AURA_COLORS[texKey]).toBeDefined();
    }
  });
});
