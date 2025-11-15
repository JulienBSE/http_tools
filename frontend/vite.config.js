import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuration du serveur de développement
  server: {
    // Proxy pour rediriger les requêtes API vers le backend
    // Cela permet d'utiliser '/api' au lieu de 'http://localhost:3000' dans le code
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
