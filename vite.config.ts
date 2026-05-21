import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        // App interno Daily Rasch.
        main: path.resolve(__dirname, 'index.html'),
        // Cartão de visita digital — página pública autónoma.
        cartao: path.resolve(__dirname, 'cartao.html'),
      },
    },
  },
})
