import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import dotenv from 'dotenv'
dotenv.config()

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: process.env.VITE_FRONTEND_IP,
    port: Number(process.env.VITE_FRONTEND_PORT),
  },
})