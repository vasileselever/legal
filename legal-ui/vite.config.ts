import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Attempt to load local certs from ./certs (created by mkcert). If not present, fall back to HTTP.
function loadLocalHttps() {
  try {
    const certDir = path.resolve(__dirname, 'certs')
    const keyPath = path.join(certDir, 'localhost-key.pem')
    const certPath = path.join(certDir, 'localhost.pem')
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    }
  } catch {
    // ignore errors and fall back to false
  }
  return false
}

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 5173,
    https: loadLocalHttps(),
    proxy: {
      '/api': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
