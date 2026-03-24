# Ten Post–Void God Bosses — Design Spec

**Date:** 2026-03-24  
**Status:** Draft (pending human review)

---

## Overview

Extend the main boss ladder from **7 to 17** fights by appending **10 new bosses after `VoidGod`**. Each new boss must be **mechanically distinct** (recognizably different movement, threats, and phase-two escalation). Between-fight flow stays **unchanged**: **shop after every boss**, same coin rules as today (numeric tuning deferred to playtest).

**Non-goals:** Optional side bosses, reordering the first seven fights, or reducing shop frequency for the extension.

---

## Constraints & Conventions

- **Engine / patterns:** Phaser 3, `BaseBoss` subclasses in `src/entities/bosses/`, registration in `src/data/bosses.js` (`BOSS_CLASSES`, `BOSS_ORDER`, `BOSS_TEXTURE_KEYS`, `BOSS_LABELS`).
- **Art:** Follow `graphicsManifest.js` — **Kenney Tiny Dungeon** gameplay sprites only; each new boss needs a **new** (or newly composed) sprite file under `assets/sprites/` plus `bossTextures` entry (key, path, frame size).
- **Display names:** Existing `BOSS_LABELS` use **Hebrew** strings; new bosses must include **Hebrew** labels in the same style (exact wording decided at implementation time).
- **Phases:** Default **two phases** with transition at **50% HP**, matching most current bosses. **`VoidGod` keeps its existing multi-phase behavior**; individual new bosses may deviate only if called out in the implementation plan (exception, not the rule).
- **Aura:** Add `BOSS_AURA_COLORS` entries in `BaseBoss.js` for each new texture key (distinct colors, readable against dark arena).

---

## Architecture

### Data & loading

- Append **10** identifiers to `BOSS_ORDER` after `'VoidGod'`.
- For each id: `BOSS_CLASSES`, `BOSS_TEXTURE_KEYS`, `BOSS_LABELS`, and `bossTextures` in `graphicsManifest.js`.
- `BootScene` continues to load boss textures from the manifest; no parallel loading path.

### Shared code (“boss kit”)

Introduce **small, optional helpers** under e.g. `src/entities/bosses/lib/` (exact folder name in implementation plan) for repeated glue **without** a generic “scripted boss” engine:

- Examples: timed bullet bursts, aim-at-player shots, safe minion spawn positioning, phase transition helpers.
- **Requirement:** Each boss class remains the authority for its fight; helpers are **opt-in** and must not force homogenous behavior.

### Scenes & persistence

- **`BossScene`:** Already selects class via `BOSS_ORDER[this.bossIndex]` and sends **`VictoryScene`** when `nextIndex >= BOSS_ORDER.length` — **no change** to win condition logic beyond longer runs.
- **`bossUnlocks.js`:** Clamps saved index to `BOSS_ORDER.length - 1`; **existing saves remain valid** when the array grows (no migration required).
- **`BossSelectScene`:** **Must be redesigned** — see below.

---

## Boss Select UI (blocking)

Current layout assumes a **single horizontal row** of cards with fixed spacing (`spacing = 155`, viewport **1280** wide). With **17** bosses, total width **far exceeds** the screen; cards will overlap or clip.

**Requirement:** Implement one of:

1. **Horizontal scroll** (camera mask or scrollable container) with clear scroll hints; or  
2. **Pagination** (e.g. 6–8 cards per page, Prev/Next); or  
3. **Multi-row grid** with adjusted card size and keyboard-friendly navigation.

**Scheduling:** The redesigned boss select ships **with the first implementation wave** (as soon as `BOSS_ORDER.length` exceeds what fits in one row at 1280×720). No wave may ship a layout that clips or overlaps boss cards.

**Acceptance:** All **17** bosses visible/selectable without overlap; unlocked/locked styling and cursor remain clear; **keyboard** (A/D, Enter, ESC) stays usable or is extended consistently; **mouse** (existing card `pointerdown` / hover behavior) remains coherent with the new layout (e.g. scroll areas or pagination controls remain clickable). Any **new player-visible strings** (hints, page labels) go through `src/i18n/hebrew.js` and the `T.*` pattern used elsewhere. **Gamepad:** out of scope unless `BossSelectScene` gains gamepad support in the same change set — if it does, all three layout options must behave consistently with that support.

---

## Balance & economy (guidance)

- **Seventeen** shops substantially increase total coins and upgrade opportunities relative to the original **7**-boss design.
- **Spec-level expectation:** Implementation includes **placeholder HP/damage** per boss, then **playtest pass** to steepen late-game stats or adjust shop prices/rewards if runs become trivial.
- No mandatory formula in this spec; tuning tasks belong in the implementation plan’s verification section.

---

## Roster (implementation naming)

This spec does **not** fix final thematic names or attack tables. The implementation plan should include a **concrete table** of 10 bosses: internal id, Hebrew label, HP targets, mechanic summary, phase-2 twist, and asset notes. Silhouettes should remain **visually distinct** from each other and from bosses 1–7 (per existing art direction).

---

## Testing & verification

- **Contract:** Every `BOSS_ORDER` entry has matching keys in `BOSS_CLASSES`, `BOSS_TEXTURE_KEYS`, `BOSS_LABELS`, and `bossTextures`; every `BOSS_TEXTURE_KEYS` value used in `BOSS_ORDER` has a corresponding **`BOSS_AURA_COLORS`** entry in `BaseBoss.js` (or documented fallback behavior if a key is intentionally shared — default should be explicit aura per boss texture key).
- **Manual:** Full run from boss 1 through **final** boss; boss select at max unlock; verify victory only after **last** boss; verify shop appears **10** additional times in an end-to-end clear.
- **Regression:** 1P and 2P split-screen; revive and game-over flows unchanged.

---

## Error handling & edge cases

- **localStorage:** Continue to ignore write failures; unlock index stays bounded by `BOSS_ORDER.length`.
- **Missing texture / class:** Development mistake — caught by contract tests and BootScene load failures; not a runtime user-facing branch.

---

## Implementation phasing (recommended)

Deliver in **waves** (e.g. 3 + 3 + 4 bosses) so the game stays playable and testable mid-project. **Wave 1** includes the **BossSelectScene** redesign (see above) alongside the first batch of new boss ids so the select screen never ships in a broken state. Later waves add: classes, assets, manifest, aura colors, and labels for remaining bosses.

---

## Open items (for implementation plan)

1. Final **10×** mechanic write-ups and Hebrew display names.  
2. **Boss select** layout choice (scroll vs pages vs grid).  
3. **Economy tuning** criteria (target run length / difficulty for bosses 8–17).  
4. Optional **SFX** additions per boss (reuse existing library where possible).

---

## Explicit non-goals & follow-ups (v1)

- **Per-boss BGM** and **mobile-first / responsive** layouts — not required by this spec; desktop 1280×720 remains the reference viewport.  
- **Accessibility pass** (beyond existing UI patterns): deferred; new attacks should still use visible telegraphs where feasible, not color-only cues.  
- **Migrating** existing hardcoded English in `BossSelectScene` to `T.*` is optional unless that file is touched for layout; **new** copy must use `hebrew.js`.
