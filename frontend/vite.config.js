import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Dev proxy: forwards /api/* calls to the local Flask backend
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Production build target directory
    outDir: 'dist',
    sourcemap: false,
  },
})
