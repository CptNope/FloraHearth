import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, type Plugin} from 'vite';

/**
 * Tabs are code-split, so the service worker must precache every built chunk
 * on install. Otherwise a tab never opened online would fail offline.
 * Replaces the __BUILD_ASSETS__ marker comment in dist/sw.js with the list.
 */
function precacheBuildAssets(): Plugin {
  let outDir = 'dist';
  let files: string[] = [];
  return {
    name: 'florahearth-precache-build-assets',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    generateBundle(_options, bundle) {
      files = Object.keys(bundle).filter(f => /\.(js|css|woff2?|svg|png|webp)$/.test(f));
    },
    closeBundle() {
      const swPath = path.join(outDir, 'sw.js');
      if (!fs.existsSync(swPath)) return;
      const list = files.map(f => `  './${f}',`).join('\n');
      const sw = fs.readFileSync(swPath, 'utf8').replace('/* __BUILD_ASSETS__ */', list);
      fs.writeFileSync(swPath, sw);
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), precacheBuildAssets()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
