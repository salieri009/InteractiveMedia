/**
 * Vite build configuration — Interactive Media Assignment v2.0.0
 *
 * Key decisions:
 * - vite-plugin-checker shows TypeScript errors as browser overlay during dev
 * - p5.js and ml5.js are NOT bundled (CDN globals), so they are not imported
 * - terser minifies production output; sourcemaps are off for smaller bundles
 * - Legacy plugin ensures compatibility with browsers that lack ES2020 support
 */
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    /* Transpile for older browsers (IE11 excluded) */
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    /* Surface TypeScript errors in the browser overlay during development */
    checker({
      typescript: true,
    }),
  ],

  server: {
    port: 3000,
    open: true,
    cors: true,
    strictPort: false,
  },

  preview: {
    port: 4000,
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      input: 'index.html',
      output: {
        /* Content-hash filenames enable long-term browser caching */
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
  },

  define: {
    /* Prevent Vite from injecting undefined process.env at runtime */
    'process.env.NODE_ENV': JSON.stringify(process.env['NODE_ENV'] ?? 'production'),
  },
});
