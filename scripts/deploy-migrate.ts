import postgres from 'postgres';

import { runDeployMigration } from '@/src/db/deploy-migration';
import { applyMigrations } from '@/src/db/migrations';

const runMigrations = async (databaseUrl: string) => {
  const database = postgres(databaseUrl, { max: 1 });
  try {
    await applyMigrations(database);
  } finally {
    await database.end();
  }
};

runDeployMigration({
  vercelEnv: process.env.VERCEL_ENV,
  databaseUrl: process.env.DATABASE_URL,
  runMigrations,
}).catch((error) => {
  // Non-zero exit short-circuits the `&&` in the build command, so a failed migration
  // blocks the deploy instead of shipping code against a stale schema.
  console.error('Deploy migration failed', error);
  process.exitCode = 1;
});
