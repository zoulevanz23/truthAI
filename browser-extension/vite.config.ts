import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Output as IIFE for extension scripts
        inlineDynamicImports: true,
      },
    },
  },
})