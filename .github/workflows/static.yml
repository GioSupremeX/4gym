import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // 1. Tells Vite your index.html and source files are inside /client
  root: 'client',
  
  plugins: [react()],
  
  // 2. Adjusts paths so your imports (like @/components) don't break
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },

  // 3. Tells Vite to output the final compiled code back to the root /dist directory
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
