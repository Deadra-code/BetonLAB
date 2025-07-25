import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Secara eksplisit memberitahu plugin React untuk menyertakan
      // semua file .js dan .jsx untuk transformasi JSX.
      include: "**/*.{jsx,js}",
    })
  ],
  server: {
    port: 3000
  },
  build: {
    outDir: 'build'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
