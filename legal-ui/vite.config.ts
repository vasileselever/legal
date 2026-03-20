import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl(), // enables HTTPS on the Vite dev server with a self-signed cert
  ],
  server: {
    port: 5173,
    https: true,
    proxy: {
      // All /api calls are forwarded to the .NET backend over HTTPS
      '/api': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false, // allow self-signed dev cert on backend
      },
    },
  },
})
