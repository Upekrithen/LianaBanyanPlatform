import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React + routing — loaded on every page
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI component library — loaded on every page
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-tooltip'],
          // Data layer — loaded when authenticated
          'vendor-data': ['@tanstack/react-query', '@supabase/supabase-js'],
          // Heavy visualization libs — only loaded when needed
          'vendor-viz': ['recharts', 'framer-motion'],
          // Crypto/blockchain — only loaded on Web3 pages
          'vendor-web3': ['viem', 'wagmi'],
          // i18n — loaded on every page but small
          'vendor-i18n': ['i18next', 'react-i18next'],
        },
      },
    },
  },
}));
