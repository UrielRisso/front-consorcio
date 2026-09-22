import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    proxy: {
      // Redirige cualquier petición que empiece con /api hacia tu backend local
      '/api': {
        target: 'https://localhost:7123', // <-- Pon aquí la URL/puerto de tu backend .NET o Go
        changeOrigin: true,
        secure: false,
      },
    },
  },
});