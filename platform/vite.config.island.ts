import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    lib: {
      entry: resolve(__dirname, 'src/mnemo-join.tsx'),
      formats: ['es'],
      fileName: () => 'mnemo-join.js',
    },
    outDir: 'dist-island',
    emptyOutDir: true,
    rollupOptions: {
      external: [],
      output: {
        assetFileNames: 'mnemo-join.[ext]',
      },
    },
    cssCodeSplit: false,
  },
});
