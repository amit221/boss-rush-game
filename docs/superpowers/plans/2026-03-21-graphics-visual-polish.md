# Graphics & Visual Polish — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make bosses visually distinct, replace the flat/tiled arena floor with a richer background, show the same character sprites in character select as in combat, and raise overall UI polish (typography, panels, consistency) across menus and interstitial scenes.

**Architecture:** Keep Phaser 3.60 + existing `BootScene` RenderTexture pipeline for gameplay textures. Add a small **graphics manifest** (`src/data/graphicsManifest.js`) that lists raw asset paths and target keys so `BootScene` stays data-driven. Load additional **UI-sized** copies or separate files for `CharacterSelectScene` where larger portraits help. For the arena, use a **full-bleed background image** (or parallax pair) at depth &lt; -1, optionally keep a subtle ground layer; avoid relying on a single 16×16 tile stretched as the whole mood of the level. Source assets from **CC0** packs (Kenney and/or similar) with documented filenames.

**Tech Stack:** Phaser 3.60 (CDN), ES modules, Jest for any data-contract tests, optional Google Fonts via `index.html`

**Related context:** Current gameplay textures and keys live in `src/scenes/BootScene.js`. Character cards use colored rectangles in `src/scenes/CharacterSelectScene.js` (lines 31–36) instead of `player_brute` / `player_scout`. Arena uses `tileSprite` + `floor_tile` in `src/scenes/BossScene.js`. Boss classes already pass distinct texture keys (e.g. `KingSlime` → `'boss_kingslime'` in `src/entities/bosses/KingSlime.js`); if bosses still *look* identical, the fix is **better source art and sizing**, not wiring.

---

## Files

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `docs/superpowers/specs/2026-03-21-graphics-visual-polish-assets.md` | Optional: list every PNG URL/source + license (fill during Task 1) |
| Create | `src/data/graphicsManifest.js` | Single source of truth: boss raw files, player keys, UI portrait keys, background keys, floor overlay |
| Create | `tests/graphicsManifest.test.js` | Contract tests: every `BOSS_ORDER` id has manifest entry; every `CHARACTERS` id has `textureKey` + optional `selectPortraitKey` |
| Modify | `src/scenes/BootScene.js` | Load from manifest; register RenderTextures; preload UI + arena backgrounds |
| Modify | `src/data/characters.js` | Add `textureKey` (and optional `portraitKey`, `subtitle`) per character |
| Modify | `src/scenes/CharacterSelectScene.js` | Replace top color squares with images; optional frame/glow on selection |
| Modify | `src/scenes/BossScene.js` | Layer background image(s); adjust `tileSprite` or remove if full image covers arena |
| Modify | `src/scenes/MenuScene.js` | Background + layout polish (panel, title styling) |
| Modify | `src/scenes/ShopScene.js` | Match menu/arena visual language (background strip, fonts) |
| Modify | `src/scenes/VictoryScene.js` | Same |
| Modify | `src/scenes/GameOverScene.js` | Same |
| Modify | `index.html` | Web font link, optional `body` class for canvas framing |
| Create | `assets/sprites/` (new PNGs) | Distinct boss sprites, portraits, `bg_arena.jpg` or `.png`, optional `bg_menu.png` |

---

## Task 1: Asset pass — distinct bosses + backgrounds

**Files:**
- Create: `docs/superpowers/specs/2026-03-21-graphics-visual-polish-assets.md`
- Create: new files under `assets/sprites/` and optionally `assets/backgrounds/`

- [ ] **Step 1: Bosses — one unique silhouette per boss**

  For each id in `BOSS_ORDER` (`src/data/bosses.js`), pick a **visually distinct** 16×16 (or larger) sprite. Prefer mixing categories so silhouettes differ: blob (slime), skull, flying creature, heavy construct, mimic/chest, aquatic, undead boss.

  Minimum: **7 different PNG files** mapped 1:1 to `boss_kingslime` … `boss_voidgod` (keys unchanged — see `BootScene.js` `SPRITE_MAP`).

  If Kenney Tiny Dungeon alone looks too same-y, add a second CC0 pack (e.g. Kenney *Abstract Platformer* enemies, *Roguelike* characters — still document license in the spec file).

- [ ] **Step 2: Arena background**

  Add at least one **wide** image (e.g. 1280×720 or larger) for the boss arena mood: dungeon cavern, ruins, or stylized pixel backdrop — **not** a single tiny tile repeated as the only layer. Save as e.g. `assets/backgrounds/arena_bg.png` (or under `assets/sprites/` if you prefer one folder).

- [ ] **Step 3: Menu / shop / interstitial (optional but recommended for “pretty”)**

  One shared or separate static background for `MenuScene` / `ShopScene` / victory / game over (can reuse one asset with different tint via Phaser `setTint` if desired).

- [ ] **Step 4: Document sources**

  In `docs/superpowers/specs/2026-03-21-graphics-visual-polish-assets.md`, list each file, pack name, and license (CC0).

- [ ] **Step 5: Commit**

```bash
git add assets/ docs/superpowers/specs/2026-03-21-graphics-visual-polish-assets.md
git commit -m "chore: add distinct boss sprites and background art assets"
```

---

## Task 2: Graphics manifest + contract tests

**Files:**
- Create: `src/data/graphicsManifest.js`
- Create: `tests/graphicsManifest.test.js`

- [ ] **Step 1: Write failing test — manifest covers bosses and characters**

  Example shape:

```js
import { BOSS_ORDER } from '../src/data/bosses.js';
import { CHARACTERS } from '../src/data/characters.js';
import { bossTextures, characterTextures } from '../src/data/graphicsManifest.js';

describe('graphicsManifest', () => {
  test('every boss in BOSS_ORDER has a texture entry', () => {
    for (const name of BOSS_ORDER) {
      expect(bossTextures[name]).toBeDefined();
      expect(typeof bossTextures[name].file).toBe('string');
    }
  });
  test('every character has textureKey in data and manifest', () => {
    for (const c of Object.values(CHARACTERS)) {
      expect(c.textureKey).toBeDefined();
      expect(characterTextures[c.id]).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest tests/graphicsManifest.test.js --runInBand
```

  Expected: module not found or missing exports.

- [ ] **Step 3: Implement minimal `graphicsManifest.js`**

  Export `bossTextures` keyed by `'KingSlime'` → `{ file: 'assets/sprites/...', key: 'boss_kingslime', w: 80, h: 80 }` (match existing sizes in `BootScene.js` unless you intentionally change balance).

  Export `characterTextures` for `brute` / `scout` with `file` paths and `key` matching `Player` usage (`player_brute`, `player_scout`).

- [ ] **Step 4: Extend `src/data/characters.js`**

  Add `textureKey: 'player_brute'` and `textureKey: 'player_scout'` to each entry (and optional `selectScale: 1.2` later).

- [ ] **Step 5: Run tests — expect PASS**

```bash
npx jest --runInBand
```

- [ ] **Step 6: Commit**

```bash
git add src/data/graphicsManifest.js src/data/characters.js tests/graphicsManifest.test.js
git commit -m "feat: add graphics manifest and data contract tests"
```

---

## Task 3: BootScene — load from manifest + UI preload

**Files:**
- Modify: `src/scenes/BootScene.js`

- [ ] **Step 1: Replace hardcoded `SPRITE_MAP` with loops over `graphicsManifest`**

  Keep `scaleSprite()` as today. For each boss entry, `load.image('_raw_' + key, file)` then `scaleSprite` to `finalKey` (e.g. `boss_kingslime`).

- [ ] **Step 2: Preload background keys**

  `this.load.image('bg_arena', 'assets/backgrounds/arena_bg.png')` (adjust path to match Task 1).

  Optionally `this.load.image('bg_menu', ...)` for menus.

- [ ] **Step 3: Run full test suite**

```bash
npx jest --runInBand
```

  Expected: all pass.

- [ ] **Step 4: Manual smoke — game boots**

```bash
npm run serve
```

  Open `http://localhost:8080`, confirm no 404 on new assets and no Phaser texture key warnings.

- [ ] **Step 5: Commit**

```bash
git add src/scenes/BootScene.js
git commit -m "feat: drive BootScene loads from graphicsManifest + preload backgrounds"
```

---

## Task 4: BossScene — background image instead of ugly tile grid

**Files:**
- Modify: `src/scenes/BossScene.js` (arena section ~lines 35–40)

- [ ] **Step 1: Add full background image at depth -2**

```js
  this.add.image(800, 600, 'bg_arena')
    .setDisplaySize(1600, 1200)
    .setOrigin(0.5)
    .setDepth(-2);
```

  Center at world center `(800, 600)` for 1600×1200 bounds (same as current `setBounds`).

- [ ] **Step 2: Optional ground layer**

  Either remove `tileSprite` entirely if the background covers the playfield, **or** keep a **subtle** `tileSprite` at depth `-1` with a **stone floor** tile (not the old flat color tile) and lower alpha:

```js
  const tile = this.add.tileSprite(0, 0, 1600, 1200, 'floor_tile')
    .setOrigin(0, 0)
    .setDepth(-1);
  tile.setAlpha(0.35);
```

  Choose one coherent look; document in commit message.

- [ ] **Step 3: Manual check**

  Enter a boss fight: background should read as an environment, not a harsh green/tan micro-grid.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/BossScene.js
git commit -m "feat: arena full-bleed background image (replace flat tile look)"
```

---

## Task 5: Character select — show real sprites

**Files:**
- Modify: `src/scenes/CharacterSelectScene.js`

- [ ] **Step 1: In the card loop, replace `char.color` square with sprite**

  After creating the card `bg1`, add:

```js
      const portrait1 = this.add.image(x1, y - 60, CHARACTERS[char.id].textureKey)
        .setDisplaySize(72, 72);
```

  Use `CHARACTERS[char.id]` or `char.textureKey` once `characters.js` is updated.

  Mirror for P2 (`color2` replacement with second `image`).

- [ ] **Step 2: Keep a thin colored rim if desired**

  `this.add.rectangle(x1, y - 60, 76, 76, char.color, 0.15)` behind the image, or `setTint` on the image for P1/P2 accent.

- [ ] **Step 3: Manual check**

  Sprites on cards should match in-game appearance (scale may differ).

- [ ] **Step 4: Commit**

```bash
git add src/scenes/CharacterSelectScene.js
git commit -m "feat: character select shows player sprites from BootScene textures"
```

---

## Task 6: Global polish — menu, shop, victory, game over

**Files:**
- Modify: `src/scenes/MenuScene.js`, `src/scenes/ShopScene.js`, `src/scenes/VictoryScene.js`, `src/scenes/GameOverScene.js`
- Modify: `index.html`

- [ ] **Step 1: Add font link in `index.html`**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
```

  (Use any distinctive font; avoid default Inter-only if you want “game” feel.)

- [ ] **Step 2: Shared helper (optional small module)**

  Create `src/ui/theme.js`:

```js
export const FAMILY = '"Press Start 2P", monospace';
export const titleStyle = { fontFamily: FAMILY, fontSize: '48px', color: '#fff' };
```

  Import in scenes to avoid copy-paste drift.

- [ ] **Step 3: MenuScene — background image + title**

  Use `this.add.image(640, 360, 'bg_menu').setDepth(-10)` and `setDisplaySize(1280, 720, true)` if the asset is large enough.

- [ ] **Step 4: ShopScene / VictoryScene / GameOverScene**

  Apply same font family to main titles; add dimmed `bg_menu` or `rectangle` gradient overlay for readability.

- [ ] **Step 5: Run tests**

```bash
npx jest --runInBand
```

- [ ] **Step 6: Commit**

```bash
git add index.html src/ui/theme.js src/scenes/MenuScene.js src/scenes/ShopScene.js src/scenes/VictoryScene.js src/scenes/GameOverScene.js
git commit -m "feat: shared UI theme, fonts, and backgrounds on menu flows"
```

---

## Task 7: Visual QA checklist (manual)

- [ ] **Bosses:** Fight or skip through each boss in `BOSS_ORDER` — **silhouettes clearly differ** at a glance.
- [ ] **Arena:** Background reads as intentional art; floor is not an eye-searing micro-pattern.
- [ ] **Character select:** Both portraits match combat sprites; selection cursor still readable.
- [ ] **Menus:** Text readable on backgrounds; no font 404 in network tab.
- [ ] **Regression:** Jest still green; no console texture errors.

---

## Task 8: Plan review (required by writing-plans skill)

- [ ] **Dispatch** the plan-document reviewer (see `plan-document-reviewer-prompt.md` in your Superpowers repo, if present) with:
  - Plan path: `docs/superpowers/plans/2026-03-21-graphics-visual-polish.md`
  - Spec path: `docs/superpowers/specs/2026-03-21-graphics-visual-polish-assets.md`
- [ ] If issues: fix plan/spec, re-run reviewer (max 3 loops; then ask human).

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-03-21-graphics-visual-polish.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration — use **superpowers:subagent-driven-development**.

**2. Inline Execution** — Execute tasks in this session using **superpowers:executing-plans**, batch execution with checkpoints.

**Which approach?**

---

## Notes

- **Why bosses looked the same:** Tiny Dungeon tiles are same style; several were “substitute” picks. Fixing it is **art + manifest**, not changing `BaseBoss`’s constructor pattern.
- **“Green grid”:** Likely the scaled tile `floor_tile` or monitor gamma; full-bleed `bg_arena` + optional faint tile overlay fixes the cheap look.
- **Scope control:** If time-boxed, ship Tasks 1–5 first (gameplay-visible); Task 6 can be a follow-up.
