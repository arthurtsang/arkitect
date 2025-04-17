import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"]
      }
    }),
    nodeResolve({jsnext: true})
  ],
  build: {
    outDir: "dist",
    target: "esnext",
    minify: false,
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, "node_modules/@arthurtsang/arkitect/react/main.jsx"), // Changed to main.jsx
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
      "~arkitect": resolve(__dirname, "node_modules/@arthurtsang/arkitect"),
      "~user": resolve(__dirname, "src")
    }
  }
});