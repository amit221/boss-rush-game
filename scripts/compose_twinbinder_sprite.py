"""One-off: build boss_twinbinder.png from two Kenney Tiny Dungeon tiles (CC0)."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
KENNEY = ROOT / ".kenney-tmp" / "extracted" / "Tiles"
OUT = ROOT / "assets" / "sprites" / "boss_twinbinder.png"
# Twin green slimes side by side (tile_0066) — reads as “paired” without reusing hero tiles.
TILE = KENNEY / "tile_0066.png"


def main() -> None:
    a = Image.open(TILE).convert("RGBA")
    gap = 2
    w, h = a.size
    canvas = Image.new("RGBA", (w * 2 + gap, h), (0, 0, 0, 0))
    canvas.paste(a, (0, 0))
    canvas.paste(a, (w + gap, 0))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT)
    print("Wrote", OUT)


if __name__ == "__main__":
    main()
