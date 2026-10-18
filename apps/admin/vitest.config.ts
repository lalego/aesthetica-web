import { defineConfig } from 'vitest/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: appRoot,
  resolve: {
    alias: [
      { find: '@aesthetica/shared', replacement: resolve(appRoot, '../../packages/shared/src/index.ts') },
      { find: '@', replacement: appRoot },
    ],
  },
  test: {
    include: ['lib/**/*.test.ts', 'app/**/*.test.ts'],
    environment: 'node',
    clearMocks: true,
  },
})
