import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: './src/renderer',
  base: './',
  // BP087 P0 fix: envDir must point to repo root because root is set to ./src/renderer.
  // Without this, Vite looks for .env inside src/renderer/ and never finds VITE_SUPABASE_*.
  envDir: resolve(__dirname, '.'),
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: true,
  },
});
