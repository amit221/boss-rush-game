# Boss Rush (מרדף בוסים)

Arcade boss-rush game built with **Phaser 3** (1280×720, 1–2 player local co-op).

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scripts

| Command        | Description                          |
|----------------|--------------------------------------|
| `npm run dev`  | Vite dev server with HMR             |
| `npm run build`| Production output to `dist/`         |
| `npm run preview` | Serve `dist/` locally             |
| `npm test`     | Jest                                 |

## Deploy

- **Vercel:** import this repo; `vercel.json` is already configured. Requires **Node 22+** for the build.
- **Manual:** run `npm run build`, then upload everything inside `dist/`.

Phaser is loaded from a CDN (`index.html`); game code is bundled by Vite.

## Assets

Sprite PNGs under `assets/sprites/` are expected by `src/data/graphicsManifest.js` (see `docs/superpowers/plans/` and Kenney Tiny Dungeon credits in `assets/sprites/CREDITS.txt`).
