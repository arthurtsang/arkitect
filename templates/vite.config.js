import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"]
      }
    })
  ],
  build: {
    outDir: "dist",
    target: "esnext",
    minify: false,
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve("~arkitect/react/main.jsx"), // Changed to main.jsx
      output: {
        format: "es",
        entryFileNames: "main.js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name].[ext]"
      }
    }
  },
  resolve: {
    alias: {
      "~arkitect": resolve("node_modules/@arthurtsang/arkitect"),
      "~user": resolve("src")
    }
  }
});