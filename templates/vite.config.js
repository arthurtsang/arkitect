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
        format: 'es', // Output as ES module
        entryFileNames: 'main.js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
      external: [], // No external dependencies; bundle everything
    },
  },
  resolve: {
    alias: {
      '~arkitect': resolve('node_modules/@arthurtsang/arkitect'),
      'react-router-dom': resolve('node_modules/react-router-dom'), // Ensure react-router-dom resolves correctly
      '~user': resolve('src'), // Correct alias to point to the `src` directory
    },
  },
});