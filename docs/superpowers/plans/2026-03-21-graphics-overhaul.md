# Graphics Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all placeholder colored-rectangle graphics with Kenney Tiny Dungeon pixel art sprites across players, bosses, minions, projectiles, and background.

**Architecture:** BootScene.js loads 13 sprites under `_raw_*` keys, then creates scaled RenderTextures saved under the original game keys. All downstream code is unchanged because texture keys are preserved. BossScene.js replaces its dark rectangle background with a tiled dungeon floor sprite at depth -1.

**Tech Stack:** Phaser 3.60.0 (CDN), Kenney Tiny Dungeon (CC0 pixel art, 16×16 individual PNGs), Jest (existing test suite)

**Spec:** `docs/superpowers/specs/2026-03-21-graphics-overhaul-design.md`

---

## Files

| Action | Path | Responsibility |
|---|---|---|
| Create | `assets/sprites/` | Holds the 13 PNG sprite files from Kenney Tiny Dungeon |
| Modify | `src/scenes/BootScene.js` | Load sprites, scale into RenderTextures under original game keys |
| Modify | `src/scenes/BossScene.js` | Replace dark bg rectangle with tileSprite at depth -1 |

---

## Task 1: Download Kenney Tiny Dungeon and place sprites

> **This task requires manual action.** The implementer (human or agent with browser access) must download the pack. The game cannot boot with sprites until this task is complete.

**Files:**
- Create: `assets/sprites/` (directory with 13 PNG files)

- [ ] **Step 1: Download the pack**

  Go to: `https://kenney.nl/assets/tiny-dungeon`

  Click "Download" (free, no account required). Extract the ZIP.

- [ ] **Step 2: Locate the individual PNG files**

  Inside the extracted folder, look for a subfolder called `Tilemap/`, `PNG/`, or similar. It contains individual 16×16 PNG files — one per sprite.

  List the files and identify the best match for each mapping below. If an exact match doesn't exist, use the fallback.

  | Game Key | Look for | Fallback |
  |---|---|---|
  | `player_brute` | Armored knight / warrior hero | Any humanoid with armor |
  | `player_scout` | Hooded rogue / archer | Any hero without heavy armor |
  | `boss_kingslime` | Slime creature | Any blob/ooze |
  | `boss_pyroskull` | Skull or fire skull | Any skull shape |
  | `boss_stormeagle` | Harpy or winged beast | Any bird/flying creature |
  | `boss_irongolem` | Stone or iron golem | Any large armored construct |
  | `boss_shadowmimic` | Mimic chest or dark ghost | Any ghost or dark creature |
  | `boss_kraken` | Sea creature (crab, fish, tentacle) | Any aquatic creature |
  | `boss_voidgod` | Lich, dark wraith, or demon | Any undead/demon |
  | `minion` | Goblin, rat, or imp | Any small enemy creature |
  | `bullet` | Small orb or arrow | Smallest available projectile |
  | `boss_bullet` | Red or dark orb | Any projectile different from bullet |
  | `floor_tile` | Dungeon floor tile | Any simple ground tile |

  **Rule:** If 3 or more sprites have no reasonable match, stop and report to the human before continuing.

- [ ] **Step 3: Create the assets/sprites directory**

  ```bash
  mkdir -p assets/sprites
  ```

- [ ] **Step 4: Copy chosen sprites into assets/sprites/**

  Copy each chosen sprite file into `assets/sprites/`. Rename them to simple, descriptive names — no spaces, lowercase. For example:

  ```
  assets/sprites/knight.png
  assets/sprites/rogue.png
  assets/sprites/slime.png
  assets/sprites/skull.png
  assets/sprites/harpy.png
  assets/sprites/golem.png
  assets/sprites/ghost.png
  assets/sprites/crab.png
  assets/sprites/lich.png
  assets/sprites/goblin.png
  assets/sprites/orb.png
  assets/sprites/orb_red.png
  assets/sprites/floor.png
  ```

  Rename files if needed to match these descriptive names.

- [ ] **Step 5: Document any substitutions**

  If you used a fallback for any sprite, note it. You'll add this as a comment in BootScene.js in the next task.

---

## Task 2: Rewrite BootScene.js

**Files:**
- Modify: `src/scenes/BootScene.js`

- [ ] **Step 1: Note your exact filenames from Task 1**

  Before editing, confirm the exact filename you placed in `assets/sprites/` for each key. Adjust the `file` values in the code below to match what you actually named the files.

- [ ] **Step 2: Replace the entire contents of src/scenes/BootScene.js**

  Replace the file with the following. Fill in the correct `file` value for each sprite based on your Task 1 filenames:

  ```js
  // SPRITE SUBSTITUTIONS (if any, document here):
  // e.g. boss_kraken uses crab.png — no tentacle sprite in pack

  function scaleSprite(scene, rawKey, finalKey, w, h) {
    // Create RenderTexture at exact target display size
    const rt = scene.add.renderTexture(0, 0, w, h).setVisible(false);
    // Temp image at world origin, sized to fill the RT exactly
    const img = scene.add.image(0, 0, rawKey)
      .setDisplaySize(w, h)
      .setOrigin(0, 0)
      .setVisible(false);
    // Draw scaled image into RT at local position (0,0)
    rt.draw(img, 0, 0);
    // Register RT canvas as a named texture — sufficient in Phaser 3.60+
    rt.saveTexture(finalKey);
    // Destroy temp objects; saved texture persists independently
    img.destroy();
    rt.destroy();
  }

  export default class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
      // Load each sprite under a _raw_ prefixed key to avoid collision
      // with the final game keys registered in create()
      this.load.image('_raw_player_brute',     'assets/sprites/knight.png');
      this.load.image('_raw_player_scout',     'assets/sprites/rogue.png');
      this.load.image('_raw_boss_kingslime',   'assets/sprites/slime.png');
      this.load.image('_raw_boss_pyroskull',   'assets/sprites/skull.png');
      this.load.image('_raw_boss_stormeagle',  'assets/sprites/harpy.png');
      this.load.image('_raw_boss_irongolem',   'assets/sprites/golem.png');
      this.load.image('_raw_boss_shadowmimic', 'assets/sprites/ghost.png');
      this.load.image('_raw_boss_kraken',      'assets/sprites/crab.png');
      this.load.image('_raw_boss_voidgod',     'assets/sprites/lich.png');
      this.load.image('_raw_minion',           'assets/sprites/goblin.png');
      this.load.image('_raw_bullet',           'assets/sprites/orb.png');
      this.load.image('_raw_boss_bullet',      'assets/sprites/orb_red.png');
      this.load.image('_raw_floor_tile',       'assets/sprites/floor.png');
    }

    create() {
      // Scale each raw 16×16 sprite into a RenderTexture at game display size.
      // The final texture key matches exactly what the rest of the codebase expects.
      const SPRITE_MAP = [
        { raw: '_raw_player_brute',     key: 'player_brute',     w: 48, h: 48 },
        { raw: '_raw_player_scout',     key: 'player_scout',     w: 48, h: 48 },
        { raw: '_raw_boss_kingslime',   key: 'boss_kingslime',   w: 80, h: 80 },
        { raw: '_raw_boss_pyroskull',   key: 'boss_pyroskull',   w: 80, h: 80 },
        { raw: '_raw_boss_stormeagle',  key: 'boss_stormeagle',  w: 80, h: 80 },
        { raw: '_raw_boss_irongolem',   key: 'boss_irongolem',   w: 96, h: 96 },
        { raw: '_raw_boss_shadowmimic', key: 'boss_shadowmimic', w: 80, h: 80 },
        { raw: '_raw_boss_kraken',      key: 'boss_kraken',      w: 96, h: 96 },
        { raw: '_raw_boss_voidgod',     key: 'boss_voidgod',     w: 96, h: 96 },
        { raw: '_raw_minion',           key: 'minion',           w: 32, h: 32 },
        { raw: '_raw_bullet',           key: 'bullet',           w: 32, h: 32 },
        { raw: '_raw_boss_bullet',      key: 'boss_bullet',      w: 32, h: 32 },
        { raw: '_raw_floor_tile',       key: 'floor_tile',       w: 48, h: 48 },
      ];

      SPRITE_MAP.forEach(({ raw, key, w, h }) => scaleSprite(this, raw, key, w, h));

      this.scene.start('MenuScene');
    }
  }
  ```

  > **Note:** The `file` values in `preload()` (e.g. `knight.png`) must exactly match the filenames you placed in `assets/sprites/` in Task 1. If you used different names, update them here.

- [ ] **Step 3: Start the game and check the browser console**

  ```bash
  npx live-server --port=8080
  ```

  Open `http://localhost:8080` in a browser. Open DevTools (F12) → Console.

  Expected: No red errors. No Phaser texture warnings ("key already in use", "file not found").

  If you see `404` errors for sprite files: check that the filename in `preload()` matches exactly what's in `assets/sprites/` (case-sensitive on some systems).

  If you see `key already in use` warnings: the `_raw_` prefix on load keys and plain names on `saveTexture` calls should prevent this — double-check the key strings in `preload()` vs `SPRITE_MAP`.

- [ ] **Step 4: Commit**

  ```bash
  git add assets/sprites/ src/scenes/BootScene.js
  git commit -m "feat: replace placeholder textures with Kenney Tiny Dungeon sprites"
  ```

---

## Task 3: Update BossScene.js background

**Files:**
- Modify: `src/scenes/BossScene.js` (lines 31–32)

- [ ] **Step 1: Replace the dark background rectangle with a tiled floor sprite**

  In `src/scenes/BossScene.js`, find this code in the `create()` method (around line 31):

  ```js
  // Arena
  this.physics.world.setBounds(0, 0, 1600, 1200);
  this.add.rectangle(800, 600, 1600, 1200, 0x1a1a2e);
  ```

  Replace it with:

  ```js
  // Arena
  this.physics.world.setBounds(0, 0, 1600, 1200);
  // Dungeon floor tile — covers full world bounds, depth -1 so all entities render on top
  this.add.tileSprite(0, 0, 1600, 1200, 'floor_tile')
    .setOrigin(0, 0)
    .setDepth(-1);
  ```

- [ ] **Step 2: Reload the game and confirm the background**

  With live-server still running (`http://localhost:8080`), start a game and enter a boss fight.

  Expected: Dungeon floor tile pattern visible as the arena background, behind players and boss.

  If the background appears on top of entities: ensure no other entities are accidentally set to `setDepth(-2)` or lower. All game entities default to depth 0, which is above depth -1.

  If the arena looks completely black (no tile): the `floor_tile` texture key wasn't registered — check BootScene Task 2 Step 3 for console errors first.

- [ ] **Step 3: Commit**

  ```bash
  git add src/scenes/BossScene.js
  git commit -m "feat: add tiled dungeon floor background to BossScene"
  ```

---

## Task 4: Visual Verification

> **This task requires manual play-testing.** Start the game, play through to a boss fight, and check each item.

- [ ] **Step 1: Run the game**

  ```bash
  npx live-server --port=8080
  ```

  Open `http://localhost:8080`, select characters, and start a boss fight.

- [ ] **Step 2: Walk the visual checklist**

  - [ ] **player_brute** — Player 1 renders as an armored knight sprite (not a blue box)
  - [ ] **player_scout** — Player 2 renders as a rogue/hooded sprite (not an orange box), visually distinct from Player 1
  - [ ] **boss_kingslime** — KingSlime renders as a slime sprite, visibly larger than both players
  - [ ] **boss_pyroskull** — PyroSkull renders as a skull sprite, visibly larger than both players
  - [ ] **boss_stormeagle** — StormEagle renders as a winged creature, visibly larger than both players
  - [ ] **boss_irongolem** — IronGolem renders as a golem sprite, 96×96 (largest boss tier)
  - [ ] **boss_shadowmimic** — ShadowMimic renders as a ghost/mimic, visibly larger than both players
  - [ ] **boss_kraken** — Kraken renders as a sea creature, 96×96 (largest boss tier)
  - [ ] **boss_voidgod** — VoidGod renders as a dark wraith/lich, 96×96 (largest boss tier)
  - [ ] **minion** — Minions render visibly smaller than both players
  - [ ] **bullet** — Player projectiles render as small orbs or arrows (not white boxes)
  - [ ] **boss_bullet** — Boss projectiles render as a visually distinct color/shape from player bullets (not red boxes)
  - [ ] **background** — Dungeon floor tile visible behind all entities; no colored rectangles visible anywhere

- [ ] **Step 3: Fix any failing items**

  Common issues:
  - Wrong sprite for a key → go back to Task 1 and replace the PNG in `assets/sprites/`, then update the filename in BootScene.js `preload()`
  - Bullet looks too large → change `bullet` entry in SPRITE_MAP from `w: 32, h: 32` to `w: 16, h: 16`
  - Background covers entities → change tileSprite depth from `-1` to `-2`, or verify no entity has a negative depth

- [ ] **Step 4: Final commit if any fixes were made**

  ```bash
  git add assets/sprites/ src/scenes/BootScene.js src/scenes/BossScene.js
  git commit -m "fix: adjust sprite sizes and background depth after visual verification"
  ```

---

## Notes

- **Phaser version:** 3.60.0 (from CDN in `index.html`). `rt.saveTexture()` is confirmed sufficient for this version.
- **World size vs viewport:** The arena is 1600×1200 world space; viewport is 1280×720 with optional split-screen. The `tileSprite` covers the full 1600×1200 so the tile repeats across the whole scrollable arena.
- **Bullet size tuning:** The spec allows bullet to be 16×16 if 32×32 looks too large. Trust your eyes during visual verification.
- **No other files change:** Player.js, all boss files, CombatSystem.js, ShopManager.js, and all scene files except BossScene.js are untouched. The texture keys are the integration point — preserve them exactly.
