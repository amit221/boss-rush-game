import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  BOSS_ORDER,
  BOSS_TEXTURE_KEYS,
  BOSS_LABELS,
} from '../src/data/bossMetadata.js';
import { bossTextures } from '../src/data/graphicsManifest.js';
import { BOSS_AURA_COLORS } from '../src/data/bossAuraColors.js';

/** Jest runs with cwd at repo root */
const repoRoot = process.cwd();

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
      expect(manifest.file).toBeTruthy();

      expect(BOSS_AURA_COLORS[texKey]).toBeDefined();
    }
  });

  test('boss sprite PNGs are pairwise distinct (no accidental duplicate files)', () => {
    const hashes = new Map();
    for (const id of BOSS_ORDER) {
      const { file } = bossTextures[id];
      const abs = join(repoRoot, file);
      const buf = readFileSync(abs);
      const h = createHash('sha256').update(buf).digest('hex');
      expect(hashes.has(h)).toBe(false);
      hashes.set(h, id);
    }
  });
});
