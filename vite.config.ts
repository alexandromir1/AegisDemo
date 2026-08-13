import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project URL: https://alexandromir1.github.io/AegisDemo/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/AegisDemo/' : '/',
}))
