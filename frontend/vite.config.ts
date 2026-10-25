import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Reads values from frontend/.env.local (a file only on your computer).
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // For local testing only: forward /api requests to your live site's API.
      proxy: env.API_PROXY_TARGET
        ? { '/api': { target: env.API_PROXY_TARGET, changeOrigin: true } }
        : undefined,
    },
  }
})
