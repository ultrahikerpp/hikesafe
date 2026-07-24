import { describe, expect, it, vi } from 'vitest';

import { runDeployMigration } from '@/src/db/deploy-migration';

const silentLogger = { info: vi.fn() };

describe('runDeployMigration', () => {
  it('skips migrations when VERCEL_ENV is unset (local build)', async () => {
    const runMigrations = vi.fn();
    await expect(runDeployMigration({
      vercelEnv: undefined, databaseUrl: 'postgres://x', runMigrations, logger: silentLogger,
    })).resolves.toBe('skipped');
    expect(runMigrations).not.toHaveBeenCalled();
  });

  it('skips migrations on preview deploys so preview builds never touch the production database', async () => {
    const runMigrations = vi.fn();
    await expect(runDeployMigration({
      vercelEnv: 'preview', databaseUrl: 'postgres://x', runMigrations, logger: silentLogger,
    })).resolves.toBe('skipped');
    expect(runMigrations).not.toHaveBeenCalled();
  });

  it('applies migrations against the production database on production deploys', async () => {
    const runMigrations = vi.fn().mockResolvedValue(undefined);
    await expect(runDeployMigration({
      vercelEnv: 'production', databaseUrl: 'postgres://prod', runMigrations, logger: silentLogger,
    })).resolves.toBe('applied');
    expect(runMigrations).toHaveBeenCalledWith('postgres://prod');
  });

  it('throws without connecting when production is missing DATABASE_URL', async () => {
    const runMigrations = vi.fn();
    await expect(runDeployMigration({
      vercelEnv: 'production', databaseUrl: undefined, runMigrations, logger: silentLogger,
    })).rejects.toThrow('DATABASE_URL');
    expect(runMigrations).not.toHaveBeenCalled();
  });

  it('propagates a migration failure so the caller can fail the build', async () => {
    const runMigrations = vi.fn().mockRejectedValue(new Error('checksum mismatch'));
    await expect(runDeployMigration({
      vercelEnv: 'production', databaseUrl: 'postgres://prod', runMigrations, logger: silentLogger,
    })).rejects.toThrow('checksum mismatch');
  });
});
