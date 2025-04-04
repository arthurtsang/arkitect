import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: path.resolve(__dirname, "./node_modules/@arthurtsang/arkitect/react/main.jsx"),
      output: {
        entryFileNames: "main.js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
      inlineDynamicImports: true, // Allows dynamic imports to be inlined
    },
  },
  css: {
    extract: true
  },
  resolve: {
    alias: {
      "~user": path.resolve(__dirname, "./"),
      "~arkitect": path.resolve(__dirname, "./node_modules/@arthurtsang/arkitect")
    }
  }
});