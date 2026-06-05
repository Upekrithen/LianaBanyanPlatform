import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Bundle analyzer — generates dist/stats.html; only in analyze mode.
    // Run: ANALYZE=true npm run build  OR  npm run analyze
    mode === "analyze" &&
      visualizer({
        open: false,
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }),
  ].filter(Boolean),
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
    // Warn when any chunk exceeds 500 kB (gzip-before threshold)
    chunkSizeWarningLimit: 500,
    // Source maps for production error tracking (hidden — no public exposure)
    sourcemap: false,
    // Minification via esbuild (default with SWC plugin)
    minify: "esbuild",
    rollupOptions: {
      output: {
        // Wave 17 — manualChunks: group by load-time necessity to minimize
        // critical-path JS. Each bucket is only downloaded when first needed.
        manualChunks: (id) => {
          // ── Tier 0: Core shell — React, router, i18n (always loaded) ──
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/") ||
            id.includes("node_modules/@remix-run/")
          ) return "vendor-react";

          if (
            id.includes("node_modules/i18next") ||
            id.includes("node_modules/react-i18next")
          ) return "vendor-i18n";

          // ── Tier 1: UI primitives — Radix + Tailwind utilities ──
          if (id.includes("node_modules/@radix-ui/")) return "vendor-radix";

          if (
            id.includes("node_modules/class-variance-authority") ||
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/tailwind-merge") ||
            id.includes("node_modules/tailwindcss-animate") ||
            id.includes("node_modules/lucide-react") ||
            id.includes("node_modules/cmdk") ||
            id.includes("node_modules/vaul") ||
            id.includes("node_modules/sonner") ||
            id.includes("node_modules/next-themes") ||
            id.includes("node_modules/embla-carousel")
          ) return "vendor-ui";

          // ── Tier 2: Data layer — only loaded when authenticated ──
          if (
            id.includes("node_modules/@tanstack/react-query") ||
            id.includes("node_modules/@supabase/")
          ) return "vendor-data";

          // ── Tier 3: Forms + validation ──
          if (
            id.includes("node_modules/react-hook-form") ||
            id.includes("node_modules/@hookform/") ||
            id.includes("node_modules/zod")
          ) return "vendor-forms";

          // ── Tier 4: Visualization / animation (dashboard pages only) ──
          if (id.includes("node_modules/recharts")) return "vendor-charts";
          if (id.includes("node_modules/framer-motion")) return "vendor-motion";

          // ── Tier 5: 3D / WebGL — only HexIsle pages ──
          if (
            id.includes("node_modules/three") ||
            id.includes("node_modules/@react-three/")
          ) return "vendor-three";

          // ── Tier 6: Calendar — FullCalendar pages only ──
          if (id.includes("node_modules/@fullcalendar/")) return "vendor-calendar";

          // ── Tier 7: PDF + canvas export — on-demand ──
          if (
            id.includes("node_modules/jspdf") ||
            id.includes("node_modules/html2canvas")
          ) return "vendor-pdf";

          // ── Tier 8: Markdown rendering ──
          if (
            id.includes("node_modules/react-markdown") ||
            id.includes("node_modules/remark") ||
            id.includes("node_modules/micromark") ||
            id.includes("node_modules/unified") ||
            id.includes("node_modules/mdast") ||
            id.includes("node_modules/hast") ||
            id.includes("node_modules/vfile")
          ) return "vendor-markdown";

          // ── Tier 9: Mermaid diagrams — only diagram pages ──
          if (id.includes("node_modules/mermaid")) return "vendor-mermaid";

          // ── Tier 10: Spreadsheet parsing ──
          if (id.includes("node_modules/xlsx")) return "vendor-xlsx";

          // ── Tier 11: QR code generation ──
          if (
            id.includes("node_modules/qrcode") ||
            id.includes("node_modules/qrcode.react")
          ) return "vendor-qr";

          // ── Tier 12: Web3 / crypto — only Web3-gated pages ──
          if (
            id.includes("node_modules/viem") ||
            id.includes("node_modules/wagmi") ||
            id.includes("node_modules/@rainbow-me/")
          ) return "vendor-web3";

          // ── Tier 13: Stripe ──
          if (id.includes("node_modules/@stripe/")) return "vendor-stripe";

          // ── Tier 14: Date utilities ──
          if (
            id.includes("node_modules/date-fns") ||
            id.includes("node_modules/react-day-picker") ||
            id.includes("node_modules/rrule")
          ) return "vendor-dates";
        },
      },
    },
  },
}));
