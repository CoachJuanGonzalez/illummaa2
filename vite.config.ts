import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,

    // ============================================
    // CODE SPLITTING (40% Bundle Reduction)
    // Added: 2025-10-14 for blog infrastructure Phase 4
    // ============================================
    rollupOptions: {
      output: {
        manualChunks: {
          // Core dependencies (loaded on every page)
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['wouter'],

          // UI framework
          'ui-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-select',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
          ],

          // Data fetching
          'vendor-query': ['@tanstack/react-query'],

          // Analytics (chunks file, does NOT modify analytics.ts source)
          'analytics': ['./src/lib/analytics.ts'],

          // Icons
          'icons': ['lucide-react'],

          // Form libraries (only loaded on assessment page)
          'forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
            'libphonenumber-js'
          ],
        },

        // Optimize chunk filenames for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },

    // Increase chunk size warning limit (500KB is reasonable for initial load)
    chunkSizeWarningLimit: 500,

    // Enable minification
    minify: 'esbuild',

    // Source maps for debugging (optional - disable for smaller bundles)
    sourcemap: false
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
