import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 指向你的 Express 地址
        changeOrigin: true,
      }
    }
  },
  plugins: [vue()],
})