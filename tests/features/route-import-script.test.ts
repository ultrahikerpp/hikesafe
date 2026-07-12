import { spawnSync } from 'node:child_process';

import { expect, it } from 'vitest';

it('rejects the launch catalog before opening a database transaction', () => {
  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', 'scripts/import-routes.ts'],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Route catalog rejected before import');
  expect(result.stderr).not.toContain('DATABASE_URL');
});
