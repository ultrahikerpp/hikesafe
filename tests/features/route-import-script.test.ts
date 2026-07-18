import { spawnSync } from 'node:child_process';

import { expect, it } from 'vitest';

it('accepts the partial catalog before requiring a database connection', () => {
  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', 'scripts/import-routes.ts'],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  expect(result.status).toBe(1);
  expect(result.stderr).not.toContain('Route catalog rejected before import');
  expect(result.stderr).toContain('DATABASE_URL');
});
