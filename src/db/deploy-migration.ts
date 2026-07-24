export interface DeployMigrationDeps {
  vercelEnv: string | undefined;
  databaseUrl: string | undefined;
  runMigrations: (databaseUrl: string) => Promise<void>;
  logger?: { info: (message: string) => void };
}

export type DeployMigrationResult = 'skipped' | 'applied';

// Runs pending migrations at build time, but only on production deploys, so that a
// production build always ships with a schema at least as new as the code that uses it.
// Preview and local builds skip it — they must never mutate the production database.
export const runDeployMigration = async ({
  vercelEnv,
  databaseUrl,
  runMigrations,
  logger = console,
}: DeployMigrationDeps): Promise<DeployMigrationResult> => {
  if (vercelEnv !== 'production') {
    logger.info(`Skipping migrations: VERCEL_ENV=${vercelEnv ?? 'unset'} (production deploys only).`);
    return 'skipped';
  }
  if (!databaseUrl) throw new Error('DATABASE_URL is required to run production migrations');
  await runMigrations(databaseUrl);
  logger.info('Production migrations applied.');
  return 'applied';
};
