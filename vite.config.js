import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // อ่าน .env* (รวม .env.local)
  return defineConfig({
    plugins: [vue()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: {
      proxy: env.VITE_API_URL ? {
        '/api': {
          target: env.VITE_API_URL,     // ใช้ค่าจาก .env.local / Vercel env
          changeOrigin: true,
          rewrite: p => p.replace(/^\/api/, '')
        }
      } : undefined
    }
  })
}
