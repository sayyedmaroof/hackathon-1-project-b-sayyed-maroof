import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'lib/savings.test.ts',
      'lib/auth/**/*.test.ts',
      'lib/cards/**/*.test.ts',
      'lib/providers/**/*.test.ts',
      'lib/search/**/*.test.ts',
      'lib/booking/**/*.test.ts',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'server-only': path.resolve(__dirname, 'node_modules/server-only/empty.js'),
    },
  },
})
