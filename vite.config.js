// vite.config.js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 3000,   // you can change the dev server port here
    open: true    // opens the browser on server start
  },
  build: {
    outDir: 'dist',  // output directory
    emptyOutDir: true
  }
})