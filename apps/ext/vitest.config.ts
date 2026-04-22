import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  plugins: [tailwindcss()],
  alias: {
    '@': path.resolve(__dirname),
  },
})
