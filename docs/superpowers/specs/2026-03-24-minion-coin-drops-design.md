# Minion Coin Drops (Boss-Driven) — Design Spec

**Date:** 2026-03-24  
**Status:** Draft (pending human review)

---

## Overview

Increase difficulty and economy depth by keeping **minions boss-driven** (no global wave system): bosses that already emit `spawnMinions` are tuned or extended, and additional bosses may adopt the same pattern. When an eligible minion **dies**, a **coin pickup** spawns at the death position. The **first player to overlap** the pickup receives the coins via `ShopManager.addCoins(characterId, amount)`; the pickup is then destroyed.

**Non-goals:** Global timed minion waves; last-hit attribution; magnet/homing pickups (out of scope unless added later); changing boss-clear `awardBossCoins` formulas in this spec (numeric tuning stays separate).

---

## Constraints & Conventions

- **Engine:** Phaser 3, `BossScene` owns groups and overlaps; `ShopManager` persists per-character coins (`src/systems/ShopManager.js`).
- **Minions:** Existing `this.minions` physics group; bosses signal `this.emit('spawnMinions', count)` and `BossScene._spawnMinions` creates sprites with `hp` / `maxHp`.
- **Targeting:** Kraken **tentacles** are added to `this.minions` for `findTarget` / bullet overlap; they must **not** use the same loot rule as slime-style minions (see Exclusions).

---

## Eligibility: Who Drops Coins

- **Drops:** Minions created through **`_spawnMinions`** (and any future boss-driven spawns that use the same code path) should be marked **loot-eligible** (e.g. boolean `dropsCoins` or equivalent set at spawn time).
- **No drops:** Entities in `minions` for mechanical reasons only — specifically **`isTentacle`** (Kraken limbs) and any similar non-“adds” hazards unless explicitly redesigned later.

---

## Pickup Behavior

1. **Spawn:** On death of a loot-eligible minion, create one pickup at `(minion.x, minion.y)` (after or with existing death FX / `playMinionDie`).
2. **Collection:** Overlap between pickup and each **Player** body that is **not downed** (`!player.isDowned`); downed players **cannot** collect. On first valid overlap → `addCoins` for that player’s **character id** (from registry `selectedCharacters`), destroy pickup, optional short collect SFX/FX.
3. **Concurrency (2P):** If two players could overlap the same pickup in one frame, implementation must be **idempotent** (e.g. destroy pickup immediately or guard with `active` flag) so coins are not awarded twice. If both qualify in the same physics step, **deterministic tie-break:** lower `playerId` wins (P1 before P2) so behavior is stable and testable.
4. **Despawn:** Pickups **expire** after a tunable duration (recommended **10–20 seconds**) if uncollected, to avoid clutter and accidental hoarding. Destroy without awarding coins.
5. **Presentation:** Minimal **static** pickup (small sprite or generated shape + gold tint) with optional **short float-up** tween; no magnet.

---

## Unified Minion Death Path

- **Bullets:** Existing overlap already reduces `hp` and destroys at 0.
- **Melee:** `_onPlayerMelee` can kill minions via `target.hp` without the bullet path’s FX/SFX/coin logic.
- **Requirement:** Both paths funnel through a **single helper** (e.g. `_handleMinionDamaged` / `_onMinionDeath`) so loot, particles, and SFX stay consistent whenever a loot-eligible minion reaches 0 HP.

---

## Boss-Driven Difficulty (Scope)

- **No** new scene-level wave timer in this feature.
- **Yes:** Adjust **spawn counts / cadence / minion HP** per boss script that uses `spawnMinions`, and optionally **add** `spawnMinions` to other bosses where it fits their fantasy. Concrete numbers are **playtest placeholders** in the implementation plan.

---

## Balance (Guidance)

- Boss clear still awards **`awardBossCoins`** (e.g. base ~100 + bonuses); minion drops are **supplementary**.
- Start with a **fixed small value** per eligible kill (e.g. **5–15** coins), **same for all bosses** unless a later pass introduces per-boss scaling; tune so a typical fight’s adds don’t dwarf boss rewards.

---

## Scene Lifecycle

- Leaving `BossScene` (shop, game over, ESC to character select) **destroys the scene**; uncollected pickups need no special persistence. Optional: clear pickup group in `shutdown` for clarity — implementation detail.

---

## Testing & Verification

- **Unit tests (Jest):** Pure helpers if introduced (e.g. constant `MINION_COIN_VALUE`, or “eligible for drop” given spawn metadata) — keep Phaser out of tests. Per-boss coin scaling is **not** required by this spec.
- **Manual:** 1P and 2P — confirm pickup grants coins to the overlapping character only, **downed players never collect**, simultaneous overlap uses P1-before-P2 tie-break, tentacle kills grant none, despawn works, melee and bullet kills both drop once.

---

## Key Files (Implementation Hints)

| Area | Likely touchpoints |
|------|-------------------|
| Spawn / flag | `BossScene._spawnMinions` |
| Death + loot | `BossScene` bullet↔minion overlap, `_onPlayerMelee` |
| Pickups | New group + overlap vs `this.players` in `BossScene` |
| FX/SFX | `src/fx/combatFx.js` / `src/audio/sfx.js` if a collect cue is added |
| Persistence | Existing `ShopManager.addCoins` |

---

## Acceptance Criteria

1. Loot-eligible boss-spawned minions drop a pickup on death from **both** ranged and melee.
2. Kraken tentacles (and other non-add `minions` members) **do not** drop coin pickups.
3. First **non-downed** player to touch pickup gets coins (same-frame 2P: lower `playerId` wins); pickup removed; no double-award.
4. Uncollected pickups despawn after the configured timeout.
5. Boss-driven difficulty changes are limited to **per-boss** `spawnMinions` usage and tuning — no global add wave.
