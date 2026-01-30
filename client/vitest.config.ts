/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    // Increase memory limit for workers
    maxWorkers: 2,
    minWorkers: 1,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/__tests__/**',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/**/*.d.ts',
      ],
      thresholds: {
        // Start with warnings, enforce after baseline is established
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },
    // Timeout for async tests
    testTimeout: 10000,
    // Mock timers configuration
    fakeTimers: {
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~components': path.resolve(__dirname, './src/components'),
      '~features': path.resolve(__dirname, './src/features'),
      '~hooks': path.resolve(__dirname, './src/hooks'),
      '~lib': path.resolve(__dirname, './src/lib'),
      '~pages': path.resolve(__dirname, './src/pages'),
      '~stores': path.resolve(__dirname, './src/stores'),
      '~types': path.resolve(__dirname, './src/types'),
    },
  },
})
