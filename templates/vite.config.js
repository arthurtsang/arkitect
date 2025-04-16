import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2022',
    minify: false,
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve('src/index.jsx'),
      output: {
        format: 'es',
        entryFileNames: 'main.js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      },
      external: []
    }
  },
  resolve: {
    alias: {
      "react": "https://esm.sh/react@19.1.0",
      "react-dom": "https://esm.sh/react-dom@19.1.0/client",
      '~arkitect': resolve('node_modules/@arthurtsang/arkitect'),
      '~user': resolve('src')
    }
  }
});