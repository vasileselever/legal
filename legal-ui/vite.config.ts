import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Attempt to load local certs from ./certs (created by mkcert). If not present, fall back to HTTP.
function loadLocalHttps(): { key: Buffer; cert: Buffer } | undefined {
  try {
    const certDir = path.resolve(__dirname, 'certs')
    const keyPath = path.join(certDir, 'localhost+2-key.pem')
    const certPath = path.join(certDir, 'localhost+2.pem')
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    }
  } catch {
    // ignore errors and fall back to undefined
  }
  return undefined
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
        // Use the HTTP port so the proxy works whether VS launches http or https profile.
        // If you always run the https profile, change this to https://localhost:5001
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor packages into separate chunks
          if (id.includes('node_modules/react')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/@headlessui') || id.includes('node_modules/@heroicons')) {
            return 'vendor-ui'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to suppress warning
  },
})
