# Graphics visual polish — asset sources (CC0)

**Policy (feat/visual-polish):** **Kenney Tiny Dungeon only** — one pack, one pixel-art style.

**Backgrounds:** Scenes use **solid black** (`0x000000`) — no full-screen bitmaps (avoids noisy sample art) and **no** repeating floor tile grid.

All assets are **Creative Commons CC0** (public domain). Attribution optional.

## Kenney Tiny Dungeon

- **Source:** [Tiny Dungeon · Kenney](https://kenney.nl/assets/tiny-dungeon)  
- **Mirror used:** OpenGameArt `kenney_tinydungeon.zip` (or Kenney direct download)

### Sprites (`Tiles/*.png` — 16×16)

| File in repo | Source tile | Role |
|--------------|-------------|------|
| `knight.png` | `tile_0097.png` | Player brute |
| `rogue.png` | `tile_0098.png` | Player scout |
| `boss_kingslime.png` | `tile_0108.png` | Slime / blob |
| `boss_pyroskull.png` | `tile_0121.png` | Skull / spectre |
| `boss_stormeagle.png` | `tile_0120.png` | Bat / flyer |
| `boss_irongolem.png` | `tile_0109.png` | Cyclops / heavy |
| `boss_shadowmimic.png` | `tile_0092.png` | Mimic chest |
| `boss_kraken.png` | `tile_0110.png` | Crab / aquatic |
| `boss_voidgod.png` | `tile_0111.png` | Hooded figure |
| `minion.png` | `tile_0123.png` | Small critter |
| `orb.png` | `tile_0113.png` | Player projectile |
| `orb_red.png` | `tile_0115.png` | Boss projectile |

### Rendering

Phaser is configured with **`pixelArt: true`**, **`antialias: false`**, **`roundPixels: true`**, and **nearest-neighbor** texture filters so scaled 16×16 art stays crisp (Kenney-style), not blurry.
