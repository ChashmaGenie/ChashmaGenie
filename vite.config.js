import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url));
const apiTarget = "http://localhost:8788";

const emitNotFoundShell = () => ({
  name: "emit-not-found-shell",
  apply: "build",
  closeBundle() {
    const outDir = fromRoot("./dist");
    copyFileSync(`${outDir}/index.html`, `${outDir}/404.html`);
  },
});

export default defineConfig({
  plugins: [react(), emitNotFoundShell()],
  resolve: {
    alias: {
      "@shared": fromRoot("./shared"),
      "@functions": fromRoot("./functions"),
      "@": fromRoot("./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": apiTarget,
      "/sitemap.xml": apiTarget,
      "/robots.txt": apiTarget,
    },
  },
});
