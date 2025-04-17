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
      input: resolve("src/index.jsx"),
      output: {
        format: "es",
        entryFileNames: "main.js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name].[ext]"
      }
    },
    assetsInclude: ["src/public/**/*"],
    copyPublicDir: true,
    publicDir: "src/public"
  },
  resolve: {
    alias: {
      "~arkitect": resolve("node_modules/@arthurtsang/arkitect"),
      "~user": resolve("src")
    }
  }
});