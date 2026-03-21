# Graphics Overhaul Design

**Date:** 2026-03-21
**Game:** Boss Rush (Phaser.js)
**Scope:** Full visual replacement — players, bosses, minions, projectiles, background

---

## Problem

All game graphics are programmatically generated colored rectangles (`fillRect`). The game has no real sprites or art assets.

---

## Goal

Replace all colored-rectangle textures with real pixel art sprites from a single cohesive free asset pack, making the game look polished without any cost.

---

## Asset Source

**Kenney Tiny Dungeon**
- URL: https://kenney.nl/assets/tiny-dungeon
- License: CC0 (public domain, no attribution required)
- Distribution: Ships as individual 16×16 PNG files inside a `Tilemap/` or `PNG/` subfolder AND as a combined spritesheet. We use the **individual PNG files** (not the spritesheet) so each can be loaded with `this.load.image()`.
- All source sprites are exactly 16×16 pixels.

### Filenames

The Kenney Tiny Dungeon pack must be downloaded before implementation begins. The first step of the implementation plan is to open the pack's PNG folder, identify the sprite that best matches each description below, and record the exact filename. The mapping table uses descriptive names only; exact filenames are the responsibility of the implementation plan.

| Game Texture Key | Sprite Description | Fallback if Not Found |
|---|---|---|
| `player_brute` | Armored knight / warrior hero | Any humanoid hero with armor |
| `player_scout` | Hooded rogue / archer hero | Any humanoid hero without heavy armor |
| `boss_kingslime` | Slime creature | Any blob/ooze creature |
| `boss_pyroskull` | Skull or flaming skull | Any skull-shaped sprite |
| `boss_stormeagle` | Harpy or winged beast | Any bird/flying creature |
| `boss_irongolem` | Stone or iron golem | Any large armored construct |
| `boss_shadowmimic` | Mimic chest or dark ghost | Any ghost or dark creature |
| `boss_kraken` | Sea creature (crab, fish, or tentacle) | Any aquatic creature |
| `boss_voidgod` | Lich, dark wraith, or demon | Any undead or demon sprite |
| `minion` | Small creature (goblin, rat, or imp) | Any small enemy creature |
| `bullet` | Small orb or arrow | Smallest available projectile sprite |
| `boss_bullet` | Red or dark orb | Any projectile sprite different from `bullet` |
| `floor_tile` | Dungeon floor tile | Any simple floor/ground tile |

### Fallback Strategy

If no exact match exists in the pack for a given sprite, use the closest thematic fit (e.g., if no Kraken exists, use a crab or fish). Document any substitutions in a comment at the top of `BootScene.js`. If fewer than 3 sprites are missing, proceed with substitutes. If 3 or more are missing, report to the human before proceeding.

---

## Sprite Mapping and Display Sizes

All source sprites are 16×16. Display sizes are exact (not approximate) because the scale is a fixed integer multiplier applied to the known 16×16 source size.

| Game Texture Key | Scale | Exact Display Size |
|---|---|---|
| `player_brute` | 3× | 48×48px |
| `player_scout` | 3× | 48×48px |
| `boss_kingslime` | 5× | 80×80px |
| `boss_pyroskull` | 5× | 80×80px |
| `boss_stormeagle` | 5× | 80×80px |
| `boss_irongolem` | 6× | 96×96px |
| `boss_shadowmimic` | 5× | 80×80px |
| `boss_kraken` | 6× | 96×96px |
| `boss_voidgod` | 6× | 96×96px |
| `minion` | 2× | 32×32px |
| `bullet` | 2× | 32×32px (or 16×16 if it looks too large) |
| `boss_bullet` | 2× | 32×32px |

---

## Code Changes

### Files Changed

1. **`assets/sprites/`** (new directory) — individual PNG files downloaded from Kenney Tiny Dungeon
2. **`src/scenes/BootScene.js`** — load sprites and create scaled textures
3. **`src/scenes/BossScene.js`** — add tiled dungeon floor background

### Files Unchanged

All other files — `Player.js`, all boss files, `CombatSystem.js`, `ShopScene.js`, etc. The final texture keys remain identical so no references break.

---

## BootScene.js Implementation Strategy

### Key Naming Convention

To avoid texture key collision, raw loaded images use a `_raw_` prefix. The final game-ready textures retain the original key names.

- Load as: `_raw_player_brute`
- Final texture key: `player_brute`

### preload()

```js
// Load each sprite as a raw key
this.load.image('_raw_player_brute', 'assets/sprites/knight.png');
this.load.image('_raw_boss_kingslime', 'assets/sprites/slime.png');
// ... etc for all sprites
```

### create()

For each sprite, create a RenderTexture at the target display size, draw the scaled source sprite into it, and save the texture under the final game key:

```js
function scaleSprite(scene, rawKey, finalKey, w, h) {
  // Create RenderTexture at exact target display size
  const rt = scene.add.renderTexture(0, 0, w, h).setVisible(false);
  // Create a temp image at origin (0,0) in world space, sized to fill the RT
  const img = scene.add.image(0, 0, rawKey)
    .setDisplaySize(w, h)
    .setOrigin(0, 0)
    .setVisible(false);
  // Draw the temp image into the RT at local position (0,0)
  rt.draw(img, 0, 0);
  // Register the RT's canvas as a named texture in Phaser's TextureManager
  // rt.saveTexture() is sufficient in Phaser 3.60+ — no manual TextureManager.add() needed
  rt.saveTexture(finalKey);
  // Clean up temp objects; the saved texture persists independently
  img.destroy();
  rt.destroy();
}
```

This saves the scaled texture under `finalKey` in Phaser's texture manager. All existing sprite constructors using that key continue to work without modification.

---

## Background Strategy

In `BossScene.js` `create()`, before adding any entities:

```js
// Dungeon floor tile — covers full canvas, depth 0
this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'floor_tile')
  .setOrigin(0, 0)
  .setDepth(0);
```

The `floor_tile` key is loaded in BootScene using the same `scaleSprite` approach, scaled 3× to 48×48px, so the tiled pattern looks appropriately chunky.

All existing entities must render above the background. Depth is enforced in `BossScene.js` `create()` by calling `this.children.each(child => { if (child.depth === 0 && child !== backgroundTile) child.setDepth(1); })` after all entities are created, or by explicitly setting `setDepth(1)` on each entity group/container at creation time.

---

## Out of Scope

- Animations / sprite sheets (static sprites only)
- UI / HUD graphics
- Menu scene backgrounds
- Sound / audio

---

## Success Criteria

### Functional
- Game runs without errors or Phaser texture warnings after the change
- All 12 texture keys resolve to pixel art sprites (not colored boxes)
- No gameplay changes — hitboxes, speeds, damage values unchanged
- Background tile visible in BossScene behind all entities
- All 13 visual checklist items pass

### Visual Verification Checklist (manual — 13 checks)

Start a game, reach the boss fight, and confirm each item:

- [ ] **player_brute** — Player 1 renders as an armored knight sprite (not a blue box)
- [ ] **player_scout** — Player 2 renders as a rogue/hooded sprite (not an orange box), visually distinct from player_brute
- [ ] **boss_kingslime** — KingSlime renders as a slime sprite, larger than both players
- [ ] **boss_pyroskull** — PyroSkull renders as a skull sprite, larger than both players
- [ ] **boss_stormeagle** — StormEagle renders as a winged creature, larger than both players
- [ ] **boss_irongolem** — IronGolem renders as a golem sprite, 96×96 (visibly the largest boss tier)
- [ ] **boss_shadowmimic** — ShadowMimic renders as a ghost/mimic sprite, larger than both players
- [ ] **boss_kraken** — Kraken renders as a sea creature, 96×96 (visibly the largest boss tier)
- [ ] **boss_voidgod** — VoidGod renders as a dark wraith/lich, 96×96 (visibly the largest boss tier)
- [ ] **minion** — Minions render visibly smaller than both players
- [ ] **bullet** — Player projectiles render as small orbs or arrows (not white boxes)
- [ ] **boss_bullet** — Boss projectiles render as a different color/style from player bullets (not red boxes)
- [ ] **background** — Dungeon floor tile visible behind all entities in BossScene; no colored rectangles visible anywhere
