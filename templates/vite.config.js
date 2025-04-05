import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    target: "es2022",
    rollupOptions: {
      input: path.resolve(__dirname, "./node_modules/@arthurtsang/arkitect/react/main.jsx"),
      output: {
        entryFileNames: "main.js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  css: {
    extract: true
  },
  resolve: {
    alias: {
      "~arkitect": path.resolve(__dirname, "node_modules/@arthurtsang/arkitect"),
      "~user": path.resolve(__dirname)
    }
  }
});