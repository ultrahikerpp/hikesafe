import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { PostgresJsDatabase, PostgresJsTransaction } from 'drizzle-orm/postgres-js';

import type * as schema from './schema';

type Schema = typeof schema;

/**
 * Either the root database handle or a transaction handle. Repository helpers
 * accept both so the same query code runs inside and outside a transaction.
 */
export type DatabaseHandle =
  | PostgresJsDatabase<Schema>
  | PostgresJsTransaction<Schema, ExtractTablesWithRelations<Schema>>;
