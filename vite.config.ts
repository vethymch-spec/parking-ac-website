import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/client"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/") || id.includes("node_modules/scheduler")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/framer-motion") || id.includes("node_modules/motion")) {
            return "vendor-motion";
          }
          if (id.includes("node_modules/i18next") || id.includes("node_modules/react-i18next")) {
            return "vendor-i18n";
          }
          if (id.includes("node_modules/@tanstack") || id.includes("node_modules/@trpc") || id.includes("node_modules/superjson")) {
            return "vendor-data";
          }
          // UI primitives (Radix) — large but shared across many pages, split out so Home doesn't bundle them
          if (id.includes("node_modules/@radix-ui")) {
            return "vendor-radix";
          }
          // Icon library — pulled by almost every page; isolating lets it cache separately
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
          // Form / validation utilities
          if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/@hookform") || id.includes("node_modules/zod")) {
            return "vendor-forms";
          }
          // wouter routing + small utils
          if (id.includes("node_modules/wouter") || id.includes("node_modules/clsx") || id.includes("node_modules/tailwind-merge") || id.includes("node_modules/class-variance-authority")) {
            return "vendor-utils";
          }
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: [".netlify.app", "localhost", "127.0.0.1"],
  },
});
