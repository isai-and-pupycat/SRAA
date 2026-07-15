import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Permite servir el build con `vite preview` en cualquier dominio (ej. Railway).
  preview: {
    allowedHosts: true,
  },
})
