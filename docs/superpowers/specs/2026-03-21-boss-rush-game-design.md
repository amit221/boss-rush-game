# Boss Rush Co-op Game — Design Spec
**Date:** 2026-03-21
**Status:** Approved

---

## Overview

A 2-player local co-op boss rush game built with Phaser.js 3. Two players share the same keyboard on the same computer. Each level is a unique boss fight. Between levels, players visit a shop to buy weapons and upgrade their characters. Visual style inspired by Brawl Stars (top-down, colorful, cartoon). There are exactly 7 levels — each level is one boss fight.

---

## Tech Stack

- **Engine:** Phaser.js 3 (JavaScript)
- **Physics:** Phaser Arcade Physics (lightweight, sufficient for top-down 2D)
- **Multiplayer:** Local only — two players on one keyboard
- **Renderer:** WebGL / Canvas via Phaser
- **Entry point:** `index.html` opened directly in browser (no server required)

---

## Controls

| | Movement | Combat |
|--|--|--|
| Player 1 | WASD | Auto-fire + auto-melee when in range |
| Player 2 | Arrow Keys | Auto-fire + auto-melee when in range |

- Both players shoot automatically toward the **nearest entity** (minions take priority over boss only when within 150px; otherwise always target boss)
- Melee triggers automatically when within **80px** of an enemy
- No manual attack buttons — focus is entirely on movement and dodging

---

## Game Flow

```
Menu → Character Select → Boss Fight → Shop → Boss Fight → ... → Victory / Game Over
```

1. **Menu** — Start game, view controls
2. **Character Select** — Each player picks a character. Players may NOT pick the same character.
3. **Boss Fight** — Defeat the boss to advance
4. **Shop** — Each player spends their own coins independently
5. Repeat for all 7 bosses → Victory screen

---

## Scenes

| Scene | Purpose |
|--|--|
| `BootScene` | Preload all assets |
| `MenuScene` | Main menu, controls reference |
| `CharacterSelectScene` | Both players choose characters |
| `BossScene` | Main combat scene (reused for all 7 bosses) |
| `ShopScene` | Between-boss shop |
| `GameOverScene` | Shown on full party wipe |
| `VictoryScene` | Shown after defeating Void God |

---

## Split-Screen

- Phaser 3 multiple camera system
- Left half of viewport: camera follows Player 1
- Right half of viewport: camera follows Player 2
- Both players exist in the same Scene/world
- **Arena size:** Each boss arena is fixed at **1600×1200px** — large enough to give players independent camera views, small enough that players can reach each other for revival
- A thin divider line separates the two screen halves
- Each player's HP bar is displayed in their own half

---

## Characters

Two playable characters. Players cannot pick the same one. Both have a ranged auto-attack and a close-range melee auto-attack.

| Stat | **Brute** | **Scout** |
|--|--|--|
| Appearance | Stocky, heavily armored, blue | Slim, hooded, orange |
| HP | 150 | 100 |
| Speed | 180 px/s | 260 px/s |
| Ranged Damage | 20 per shot | 14 per shot |
| Melee Damage | 40 per swing | 22 per swing |
| Fire Rate | 1 shot / 0.8s | 1 shot / 0.5s |
| Melee Range | 80px | 80px |

---

## Revive Mechanic

- When a player's HP reaches 0, they become a downed body on the ground
- The surviving player must **stand within 100px** of the body and remain there for **3 seconds** to revive
- A visible radial progress indicator appears on screen during the revive channel
- If the surviving player moves outside 100px during the channel, the timer **resets to 0**
- If the surviving player takes damage during the channel, the timer **pauses** (does not reset) until they stop taking damage
- Revived player returns with **30% max HP**
- If both players are downed simultaneously → **Game Over**
- If the surviving player is killed while the other is already downed → **Game Over**

---

## Bosses (7 Total)

All bosses share:
- A large HP bar displayed at the **top center** of the screen (above the split-screen divider)
- Phase transition at **50% HP** (attack patterns intensify), indicated by a screen flash and brief 1-second pause
- Void God has **3 phases** (transitions at 66% and 33% HP)

### Boss Stats & Attacks

| # | Name | HP | Phase 1 Attacks | Phase 2 Changes | Difficulty |
|--|--|--|--|--|--|
| 1 | **King Slime** | 600 | Ground slam (AOE 200px), spawns 4 mini-slimes | Slams faster, spawns 6 mini-slimes | ⭐ Easy |
| 2 | **Pyro Skull** | 900 | 3-way fireball, rotating fire wave | 5-way fireball, double-speed fire wave | ⭐⭐ Medium |
| 3 | **Storm Eagle** | 1100 | Dive at a player (360px/s), lightning strike on player position | Dives twice, chain lightning hitting both players | ⭐⭐ Medium |
| 4 | **Iron Golem** | 1500 | Earthquake stomp (shockwave ring), hurls boulder | Armor shatters exposing weak point (+50% damage taken), adds spinning rock orbit | ⭐⭐⭐ Hard |
| 5 | **Shadow Mimic** | 1300 | Copies the weapon of the nearest player and fires it back | Splits into two weaker clones (each 40% HP of original); must defeat both | ⭐⭐⭐ Hard |
| 6 | **Kraken** | 1800 | 4 independent tentacle attacks, ink puddles that slow players by 50% | Adds 2 more tentacles, ink puddles deal damage over time | ⭐⭐⭐⭐ Very Hard |
| 7 | **Void God** | 2400 | Orb volleys, homing black holes | (66% HP) Immune to ranged — melee only, gravity wells pull players | ⭐⭐⭐⭐⭐ Final Boss |

### Void God Phase Details
- **Phase 1 (100%–66% HP):** Fires spread orb volleys (5 orbs), spawns 2 homing black holes that chase players
- **Phase 2 (66%–33% HP):** Immune to ranged attacks (absorbs bullets — only melee deals damage). Spawns gravity wells that pull players toward hazard zones. Black holes fire 2x faster.
- **Phase 3 (33%–0% HP):** Ranged immunity continues. Enters berserk — all attacks 40% faster. Spawns orbiting void shards that orbit the boss and damage players on contact. The only win condition is sustained melee pressure.

### Shadow Mimic Clone Rules
- When split into 2 clones, each clone has 40% of the boss's max HP (520 HP each)
- Both clones must be defeated — fight ends when the second clone dies
- If one clone dies, the other does **not** regain HP
- Boss HP bar tracks the total remaining HP across both clones combined
- Auto-targeting treats each clone as an independent enemy

### Shadow Mimic Weapon Copy Rule
- Mimic targets the nearest player and copies their currently equipped weapon
- Fires at 70% of that weapon's damage (to avoid trivial one-shots)
- If both players have the same weapon distance, Mimic copies Player 1's weapon

### Auto-Targeting Priority
- Players always target the **boss** unless a minion (mini-slime, tentacle, clone) is within **150px**
- Within 150px: nearest minion takes priority
- Melee auto-attacks hit the nearest entity regardless of type

---

## Shop System

Opens after every boss fight (except after Void God). Each player has their own coin wallet. Coins do **not** carry over on Game Over — a fresh run starts with 0 coins. If Game Over occurs mid-fight, go **directly to GameOverScene** (no shop visit).

### Earning Coins

- **Base reward:** 100 coins per player for defeating a boss
- **Performance bonus** (up to 50 extra coins):
  - Survived without dying: +20 coins
  - Defeated boss in under 90 seconds: +15 coins
  - Dealt more than 50% of total boss damage: +15 coins

### Starting Coins

Both players start with **0 coins**. Each player receives their coins independently after each boss.

### Weapons

| Weapon | Description | Price |
|--|--|--|
| Default Gun | 1 bullet forward, base stats | Free (starting) |
| Shotgun | 3 bullets in 30° spread, 1.5× melee damage | 80 |
| Sniper | Piercing bullet, 2× damage, 0.6× fire rate | 100 |
| Boomerang | Returns to player, hits on the way out and back | 90 |
| Flamethrower | Short-range fire stream (120px), continuous 8 damage/tick | 120 |

- Buying a new weapon **replaces** the current one (no dual-wielding)
- Each player equips independently

### Stat Upgrades (max 3 purchases each per run)

| Upgrade | Effect per purchase | Price |
|--|--|--|
| HP Up | +20 max HP (heals 20 immediately) | 50 |
| Speed Up | +10% movement speed | 60 |
| Damage Up | +15% to all damage | 70 |
| Fast Revive | −1 second from revive channel time (minimum 1 second floor) | 80 |

---

## Architecture

### File Structure

```
boss-rush-game/
├── src/
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── MenuScene.js
│   │   ├── CharacterSelectScene.js
│   │   ├── BossScene.js           # Reused for all 7 boss fights
│   │   ├── ShopScene.js
│   │   ├── GameOverScene.js
│   │   └── VictoryScene.js
│   ├── entities/
│   │   ├── Player.js              # Player logic, stats, auto-combat
│   │   └── bosses/
│   │       ├── BaseBoss.js        # Shared: HP, phases, HP bar, phase flash
│   │       ├── KingSlime.js
│   │       ├── PyroSkull.js
│   │       ├── StormEagle.js
│   │       ├── IronGolem.js
│   │       ├── ShadowMimic.js
│   │       ├── Kraken.js
│   │       └── VoidGod.js
│   ├── systems/
│   │   ├── CombatSystem.js        # Auto-fire, auto-melee, targeting, damage
│   │   └── ShopManager.js         # Coin tracking, purchases, upgrade caps
│   ├── data/
│   │   └── bosses.js              # Ordered boss list — determines level sequence
│   └── main.js                    # Phaser config, scene registration
├── assets/
│   ├── sprites/
│   ├── audio/
│   └── tilemaps/
└── index.html
```

### Key Design Decisions

- **BossScene is reused** for all 7 bosses. It reads the current boss index from the game registry and instantiates the correct boss class.
- **Each boss extends BaseBoss** — adding a new boss requires only a new file and an entry in `bosses.js`.
- **CombatSystem** handles all auto-targeting and damage logic, decoupled from Player and Boss classes.
- **ShopManager** stores each player's coins, equipped weapon, and upgrade counts in Phaser's global registry. Cleared on Game Over, persisted across scenes during a run.
- **Split-screen** uses two Phaser cameras bounded to left/right halves of the viewport.
- **Arena size** is fixed at 1600×1200px per boss. Players cannot leave the arena (invisible walls).

---

## Visual Style

- Inspired by **Brawl Stars**: bold black outlines, vibrant saturated colors, chunky cartoon sprites
- Top-down perspective, no z-axis
- Each boss has a visually distinct color palette and silhouette
- UI: minimal — HP bars, coin counter, split divider line, revive progress ring

---

## Out of Scope (v1)

- WiFi / online multiplayer
- More than 2 players
- Story / dialogue / cutscenes
- Procedurally generated bosses
- Save files / persistent progression across sessions
