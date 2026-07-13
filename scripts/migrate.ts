import postgres from 'postgres';

import { applyMigrations } from '@/src/db/migrations';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const main = async () => {
  const database = postgres(databaseUrl, { max: 1 });
  try {
    await applyMigrations(database);
    console.log('Migrations applied');
  } finally {
    await database.end();
  }
};

void main();
