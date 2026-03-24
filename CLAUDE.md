# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm test          # Run Jest test suite
npm run dev       # Vite dev server (HMR)
npm run build     # Production bundle → `dist/` (upload this folder)
npm run preview   # Serve `dist/` locally to verify the build
npm run serve     # live-server on port 8080 (no bundler)
```

Run a single test file:
```bash
npx jest tests/ShopManager.test.js
```

**Deploy:** After `npm run build`, upload the contents of `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, S3, GitHub Pages, etc.). **Vercel:** connect the repo (or `vercel` CLI); `vercel.json` sets the Vite build and `dist` output. Node 22+ is required for the static-copy plugin (`engines` in `package.json`). The build uses a relative `base` (`./`) so deep links work on most hosts. For a **GitHub Pages project site** (`https://user.github.io/repo-name/`), run `npm run build -- --base=/repo-name/` (use your real repo path).

Phaser 3 stays on the CDN in `index.html`; game code is bundled by Vite.

## Architecture

**Boss-rush arcade game** built with Phaser 3 (1280×720, arcade physics). Two playable characters (Brute, Scout), 7 bosses, 1–2 player local co-op.

### Scene Flow

```
BootScene → MenuScene → BossSelectScene → CharacterSelectScene → BossScene → ShopScene → GameOverScene / VictoryScene
```

- **BootScene** — Loads all assets (sprites, audio), generates bullet graphics, applies pixel-art filters
- **BossScene** — Main gameplay arena (1600×1200 world). Split-screen cameras in 2P mode. Auto-fire, melee, boss phases, minion spawning, revive mechanic
- **ShopScene** — Post-boss shop; persistent `ShopManager` instance lives on `scene.registry` across scenes

### Session State (Phaser Registry)

`playerCount`, `bossIndex`, `selectedCharacters` `{ 1: 'brute', 2: 'scout' }`, `shopManager`

### Key Entities

- **`Player`** (`src/entities/Player.js`) — Extends `Phaser.Physics.Arcade.Sprite`. Auto-fires and auto-melees toward nearest target (minions within 150px get priority over boss). Emits `'hurt'` and `'down'` events.
- **`BaseBoss`** (`src/entities/bosses/BaseBoss.js`) — Base class with HP bar, 2-phase system, and event emissions (`'defeated'`, `'spawnMinions'`, `'spawnBossBullet'`, `'clonesSpawned'`). Concrete subclasses override `updateBoss()` and `onPhaseChange()`.

### Data Layer (`src/data/`)

- `bosses.js` — `BOSS_CLASSES`, `BOSS_ORDER`, `BOSS_TEXTURE_KEYS`, `BOSS_LABELS`
- `weapons.js` — 5 weapons with price, bullet spread, damage/fire-rate multipliers
- `characters.js` — Brute and Scout stats
- `graphicsManifest.js` / `audioManifest.js` — Asset paths consumed by BootScene

### Systems

- **`ShopManager`** (`src/systems/ShopManager.js`) — Manages coins, weapon equips, and stat upgrades per character. Accepts an optional storage adapter; `heroShop` module is passed in from MenuScene for persistence.
- **Persistence** (`src/persistence/`) — `heroShop.js` (localStorage, per-character coins/weapon/upgrades) and `bossUnlocks.js` (max unlocked boss index).
- **`navigation.js`** — `abandonRunToMenu(scene)` resets `bossIndex` and returns to MenuScene.

### UI / Audio

- **`src/ui/theme.js`** — Shared color scheme (deep purple/black, gold accents) and font ("Press Start 2P"). Provides `addMenuBackdrop()`, `addTitleUnderline()`, and text-creator helpers used across all scenes.
- **`src/audio/`** — `music.js` (looping BGM), `sfx.js` (combat/UI sounds), `audioControls.js` (toggle button).

### Testing

Tests live in `tests/`. Jest is configured with Babel (`babel.config.cjs`) to handle ES module imports in Node. Phaser classes are not available in the test environment — boss/player logic that needs testing is extracted into plain modules (e.g., `src/entities/bosses/bossDefeatLogic.js`).
