import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    // Keep vitest out of stale git worktrees (gitignored), which otherwise run a duplicate test tree.
    exclude: [...configDefaults.exclude, '**/.worktrees/**'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
});
