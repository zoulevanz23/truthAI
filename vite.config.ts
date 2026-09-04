import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/analyze': 'http://localhost:5000',
      '/health': 'http://localhost:5000',
      '/scam-advisories': 'http://localhost:5000',
    },
  }
}) 