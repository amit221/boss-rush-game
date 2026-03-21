# Boss Rush Co-op Game — Design Spec
**Date:** 2026-03-21
**Status:** Approved

---

## Overview

A 2-player local co-op boss rush game built with Phaser.js 3. Two players share the same keyboard on the same computer. Each level is a unique boss fight. Between levels, players visit a shop to buy weapons and upgrade their characters. Visual style inspired by Brawl Stars (top-down, colorful, cartoon).

---

## Tech Stack

- **Engine:** Phaser.js 3 (JavaScript)
- **Multiplayer:** Local only — two players on one keyboard
- **Renderer:** WebGL / Canvas via Phaser
- **Entry point:** `index.html` opened directly in browser (no server required)

---

## Controls

| | Movement | Combat |
|--|--|--|
| Player 1 | WASD | Auto-fire + auto-melee when in range |
| Player 2 | Arrow Keys | Auto-fire + auto-melee when in range |

- Both players shoot automatically toward the nearest boss/enemy
- Melee triggers automatically when within close range
- No manual attack buttons — focus is entirely on movement and dodging

---

## Game Flow

```
Menu → Character Select → Boss Fight → Shop → Boss Fight → ... → Victory / Game Over
```

1. **Menu** — Start game, view controls
2. **Character Select** — Each player picks a character (different stats/style)
3. **Boss Fight** — Defeat the boss to advance
4. **Shop** — Spend coins on weapons and stat upgrades
5. Repeat until all 7 bosses are defeated

---

## Split-Screen

- Phaser 3 multiple camera system
- Left half: Camera follows Player 1
- Right half: Camera follows Player 2
- Both players exist in the same Scene/world
- HP bar for each player displayed in their respective half

---

## Revive Mechanic

- When a player dies, they drop to the ground
- The surviving player can stand next to the body for **3 seconds** to revive them
- Revived player returns with **30% HP**
- If both players die simultaneously → Game Over

---

## Characters

Two playable characters, each with unique base stats and visual style:

| Stat | Character A | Character B |
|--|--|--|
| HP | 150 | 100 |
| Speed | Medium | Fast |
| Damage | High | Medium |
| Range | Short | Long |

Both characters have a ranged auto-attack and a close-range melee auto-attack.

---

## Bosses (7 Total)

Each boss has: unique appearance, unique attack patterns, phase changes at 50% HP, and a large HP bar at the top of the screen.

| # | Name | Appearance | Attacks | Difficulty |
|--|--|--|--|--|
| 1 | King Slime | Giant green jelly with crown | Ground slam, splits into small slimes | ⭐ Easy |
| 2 | Pyro Skull | Flaming skull with arms | Fireball patterns, rotating fire wave | ⭐⭐ Medium |
| 3 | Storm Eagle | Giant eagle with lightning wings | Fast dive, targeted lightning, wind gust | ⭐⭐ Medium |
| 4 | Iron Golem | Iron golem with exposed heart | Earthquake stomp, rock throw, armor breaks in phases | ⭐⭐⭐ Hard |
| 5 | Shadow Mimic | Shadow that copies player silhouettes | Copies player attacks against them, splits into two | ⭐⭐⭐ Hard |
| 6 | Kraken | Giant octopus with surrounding tentacles | Independent tentacle attacks, ink that slows, waves | ⭐⭐⭐⭐ Very Hard |
| 7 | Void God | Dark entity with 3 phases, shifting form | Absorbs bullets, black holes, screen-wide attacks, phase 3 = berserk | ⭐⭐⭐⭐⭐ Final Boss |

### Boss Phase System
- All bosses change behavior at **50% HP** (phase 2)
- Void God has 3 phases (100%, 66%, 33% HP thresholds)
- Phase transitions indicated by visual effect and brief pause

---

## Shop System

Opens between every boss fight. Each player spends their own coins independently.

### Earning Coins
- **Base reward:** 100 coins per player for defeating a boss
- **Performance bonus:** Up to 50 extra coins based on:
  - Damage dealt
  - Number of times died
  - Time to defeat boss

### Weapons (examples)

| Weapon | Description | Price |
|--|--|--|
| Default Gun | Basic ranged attack | Free (starting) |
| Shotgun | 3 bullets in a spread, high close-range damage | 80 |
| Sniper | Piercing bullet, high damage, slow fire rate | 100 |
| Boomerang | Returns to player, hits twice | 90 |
| Flamethrower | Short-range fire stream, continuous damage | 120 |

### Stat Upgrades (max 3 purchases each)

| Upgrade | Effect | Price |
|--|--|--|
| HP Up | +20 max HP | 50 |
| Speed Up | +10% movement speed | 60 |
| Damage Up | +15% damage | 70 |
| Fast Revive | Reduces revive time by 1 second | 80 |

---

## Architecture

### File Structure

```
boss-rush-game/
├── src/
│   ├── scenes/
│   │   ├── BootScene.js          # Asset preloading
│   │   ├── MenuScene.js          # Main menu
│   │   ├── CharacterSelectScene.js
│   │   ├── BossScene.js          # Main combat scene
│   │   ├── ShopScene.js
│   │   └── GameOverScene.js
│   ├── entities/
│   │   ├── Player.js             # Player logic, stats, auto-combat
│   │   └── bosses/
│   │       ├── BaseBoss.js       # Shared boss logic (HP, phases, HP bar)
│   │       ├── KingSlime.js
│   │       ├── PyroSkull.js
│   │       ├── StormEagle.js
│   │       ├── IronGolem.js
│   │       ├── ShadowMimic.js
│   │       ├── Kraken.js
│   │       └── VoidGod.js
│   ├── systems/
│   │   ├── CombatSystem.js       # Auto-fire, auto-melee, damage calculation
│   │   └── ShopManager.js        # Coin tracking, purchases, upgrades
│   ├── data/
│   │   └── bosses.js             # Boss definitions as data objects
│   └── main.js                   # Phaser game config, scene registration
├── assets/
│   ├── sprites/
│   ├── audio/
│   └── tilemaps/
└── index.html
```

### Key Design Decisions

- **Each boss is a separate class** extending `BaseBoss` — adding new bosses requires only a new file and registration in `bosses.js`
- **CombatSystem** handles all auto-targeting logic independently from player/boss classes
- **ShopManager** persists player state (coins, weapons, upgrades) across scenes via Phaser's registry
- **Split-screen** implemented with two Phaser cameras, each rendering to half the viewport

---

## Visual Style

- Inspired by **Brawl Stars**: bold outlines, vibrant colors, chunky cartoon sprites
- Top-down perspective
- Each boss has a visually distinct color palette and silhouette
- UI elements: minimal, clear HP bars, coin counter, split-screen divider line

---

## Out of Scope (v1)

- WiFi / online multiplayer
- More than 2 players
- Story / dialogue
- Procedurally generated bosses
