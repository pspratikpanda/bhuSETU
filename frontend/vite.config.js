import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      // Socket.IO WebSocket proxy — ws: true enables WebSocket upgrade forwarding
      '/socket.io': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});

