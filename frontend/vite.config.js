import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Use VITE_BASE_URL from env for GitHub Pages, otherwise default to '/'
  base: process.env.VITE_BASE_URL || '/',
  plugins: [
    react(),
    tailwindcss()
  ],
})
