import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8001',
      '/webhook': 'http://localhost:8001',
      '/sitemap.xml': 'http://localhost:8001',
      '/robots.txt': 'http://localhost:8001',
    },
  },
})
