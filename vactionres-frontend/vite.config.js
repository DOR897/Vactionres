import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',            // ✅ Optional if `index.html` is at root
  build: {
    outDir: 'dist',
  },
});
