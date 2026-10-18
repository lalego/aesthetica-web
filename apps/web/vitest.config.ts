import { defineConfig, mergeConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import viteConfig from './vite.config'

const appRoot = dirname(fileURLToPath(import.meta.url))

export default mergeConfig(
  viteConfig,
  defineConfig({
    root: appRoot,
    test: {
      include: ['src/**/*.test.ts'],
      environment: 'node',
      clearMocks: true,
    },
  })
)
