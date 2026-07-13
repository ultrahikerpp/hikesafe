import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Sql } from 'postgres';

const migrationsDirectory = path.resolve(process.cwd(), 'drizzle');

const splitStatements = (migration: string) => migration
  .split('--> statement-breakpoint')
  .map((statement) => statement.trim())
  .filter(Boolean);

export const applyMigrations = async (database: Sql) => {
  await database.unsafe(`
    CREATE TABLE IF NOT EXISTS __besafe_migrations (
      version text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamp with time zone NOT NULL DEFAULT now()
    )
  `);
  const files = (await readdir(migrationsDirectory))
    .filter((file) => /^\d{4}_.+\.sql$/.test(file))
    .sort();

  for (const version of files) {
    const migration = await readFile(path.join(migrationsDirectory, version), 'utf8');
    const checksum = createHash('sha256').update(migration).digest('hex');
    const [applied] = await database<{ checksum: string }[]>`
      SELECT checksum FROM __besafe_migrations WHERE version = ${version}
    `;
    if (applied) {
      if (applied.checksum !== checksum) throw new Error(`Migration checksum mismatch: ${version}`);
      continue;
    }
    for (const statement of splitStatements(migration)) await database.unsafe(statement);
    await database`
      INSERT INTO __besafe_migrations (version, checksum) VALUES (${version}, ${checksum})
    `;
  }
};
