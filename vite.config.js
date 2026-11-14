import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        // The local backend (npm run dev in myacademia-backend). Ports 5000 and 7000 are taken by
        // AirPlay on macOS, so the backend uses 4000. Override with API_PROXY_TARGET.
        target: process.env.API_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
