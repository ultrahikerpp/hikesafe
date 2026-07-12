export interface RetentionTransaction {
  redactEligibleLocations(cutoff: Date): Promise<number>;
}

export interface RetentionRepository {
  transaction<T>(operation: (transaction: RetentionTransaction) => Promise<T>): Promise<T>;
}

const retentionMs = 90 * 24 * 60 * 60_000;

const databaseRepository: RetentionRepository = {
  async transaction(operation) {
    const { db } = await import('@/src/db/client');
    return db.transaction(async (database) => operation({
      async redactEligibleLocations(cutoff) {
        const [{ sql }, { checkIns }] = await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
        const rows = await database.execute(sql`
          WITH eligible_trips AS (
            SELECT "id" FROM "trips"
            WHERE "status" = 'finished'
              AND "finished_at" < ${cutoff}
              AND NOT EXISTS (
                SELECT 1 FROM "alert_events"
                WHERE "alert_events"."trip_id" = "trips"."id"
                  AND "alert_events"."status" IN ('pending', 'claimed')
              )
              AND NOT EXISTS (
                SELECT 1 FROM "alert_deliveries"
                INNER JOIN "alert_events" ON "alert_events"."id" = "alert_deliveries"."event_id"
                WHERE "alert_events"."trip_id" = "trips"."id"
                  AND "alert_deliveries"."status" NOT IN ('sent', 'cancelled')
              )
          )
          UPDATE ${checkIns}
          SET "location_status" = 'redacted', "latitude" = NULL, "longitude" = NULL,
              "accuracy_meters" = NULL, "location_captured_at" = NULL, "location_source" = NULL
          WHERE "trip_id" IN (SELECT "id" FROM eligible_trips)
            AND "location_status" = 'available'
          RETURNING "id"
        `);
        return Array.from(rows as Iterable<unknown>).length;
      },
    }));
  },
};

export const deleteExpiredPreciseLocations = async (
  clock: () => Date = () => new Date(),
  repository: RetentionRepository = databaseRepository,
) => {
  const now = clock();
  const cutoff = new Date(now.getTime() - retentionMs);
  const deleted = await repository.transaction((transaction) => transaction.redactEligibleLocations(cutoff));
  return { deleted };
};
