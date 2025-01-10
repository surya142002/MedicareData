import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default Vite port
    proxy: {
      '/api': {
        target: 'http://localhost:5452', // Backend URL
        changeOrigin: true,
      },
    },
    hmr: {
      clientPort: 5173,
    },
  },
});


