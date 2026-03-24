import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

/** Relative base so the built game works on any host path (static upload, subfolders). */
export default defineConfig({
  base: './',
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'assets/**/*',
          dest: 'assets',
          rename: { stripBase: 1 },
        },
      ],
    }),
  ],
  build: {
    outDir: 'dist',
    /** Keep Phaser manifest paths as `assets/audio`, `assets/sprites` without clashing with Vite's hashed JS. */
    assetsDir: '_vite',
    emptyOutDir: true,
  },
});
