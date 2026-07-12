import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';
import { getTableName } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/pg-core';

import {
  alertEvents,
  checkIns,
  guardians,
  idempotencyKeys,
  lineBindings,
  locationStatusEnum,
  routeVersions,
  routes,
  tripMembers,
  trips,
  users,
  viewerGrants,
} from '@/src/db/schema';

describe('database schema', () => {
  it('defines the eleven required tables', () => {
    expect(
      [
        users,
        routes,
        routeVersions,
        trips,
        tripMembers,
        guardians,
        lineBindings,
        checkIns,
        alertEvents,
        viewerGrants,
        idempotencyKeys,
      ].map(getTableName),
    ).toEqual([
      'users',
      'routes',
      'route_versions',
      'trips',
      'trip_members',
      'guardians',
      'line_bindings',
      'check_ins',
      'alert_events',
      'viewer_grants',
      'idempotency_keys',
    ]);
  });

  it('defines the three required composite unique indexes', () => {
    const uniqueIndexColumns = [alertEvents, tripMembers, idempotencyKeys].map(
      (table) =>
        getTableConfig(table)
          .indexes.filter((index) => index.config.unique)
          .map((index) => index.config.columns.map((column) => column.name)),
    );

    expect(uniqueIndexColumns[0]).toContainEqual(['trip_id', 'stage']);
    expect(uniqueIndexColumns[1]).toContainEqual(['trip_id', 'user_id']);
    expect(uniqueIndexColumns[2]).toContainEqual(['user_id', 'key']);
  });

  it('keeps location status and nullable location fields consistent', () => {
    const config = getTableConfig(checkIns);
    const locationColumns = [
      checkIns.latitude,
      checkIns.longitude,
      checkIns.accuracyMeters,
      checkIns.locationCapturedAt,
      checkIns.locationSource,
    ];

    expect(locationStatusEnum.enumValues).toEqual([
      'available',
      'unavailable',
      'redacted',
    ]);
    expect(locationColumns.every((column) => !column.notNull)).toBe(true);
    expect(config.checks.map((constraint) => constraint.name)).toContain(
      'check_ins_location_consistency',
    );
  });

  it('constrains viewer grants to a guardian on the same trip', () => {
    const guardianUniqueIndexes = getTableConfig(guardians).indexes
      .filter((index) => index.config.unique)
      .map((index) => index.config.columns.map((column) => column.name));
    const viewerForeignKeys = getTableConfig(viewerGrants).foreignKeys.map(
      (foreignKey) => ({
        columns: foreignKey.reference().columns.map((column) => column.name),
        foreignColumns: foreignKey
          .reference()
          .foreignColumns.map((column) => column.name),
      }),
    );

    expect(guardianUniqueIndexes).toContainEqual(['id', 'trip_id']);
    expect(viewerForeignKeys).toContainEqual({
      columns: ['guardian_id', 'trip_id'],
      foreignColumns: ['id', 'trip_id'],
    });
  });

  it('defines uniqueness and partial uniqueness invariants', () => {
    const indexes = [routeVersions, tripMembers, guardians].flatMap((table) =>
      getTableConfig(table).indexes.map((index) => ({
        name: index.config.name,
        unique: index.config.unique,
        partial: Boolean(index.config.where),
      })),
    );

    expect(indexes).toEqual(
      expect.arrayContaining([
        {
          name: 'route_versions_route_source_version_idx',
          unique: false,
          partial: false,
        },
        {
          name: 'route_versions_one_active_per_route',
          unique: true,
          partial: true,
        },
        {
          name: 'trip_members_one_leader_per_trip',
          unique: true,
          partial: true,
        },
        {
          name: 'trip_members_one_deputy_per_trip',
          unique: true,
          partial: true,
        },
        {
          name: 'guardians_trip_line_binding_unique',
          unique: true,
          partial: false,
        },
      ]),
    );
  });

  it('defines the required operational indexes', () => {
    const indexNames = [checkIns, alertEvents, trips, routeVersions].flatMap(
      (table) =>
        getTableConfig(table).indexes.map((index) => index.config.name),
    );

    expect(indexNames).toEqual(
      expect.arrayContaining([
        'check_ins_last_available_location_idx',
        'alert_events_pending_due_idx',
        'alert_events_pending_next_attempt_idx',
        'trips_retention_finished_at_idx',
        'route_versions_active_catalog_idx',
      ]),
    );
  });
});

describe('initial migration contract', () => {
  const migration = readFileSync('drizzle/0000_initial.sql', 'utf8');

  it('enforces location consistency including redaction', () => {
    const normalizedMigration = migration.replaceAll('"check_ins".', '');

    expect(migration).toContain(
      `CREATE TYPE "public"."location_status" AS ENUM('available', 'unavailable', 'redacted')`,
    );
    expect(normalizedMigration).toContain(
      `CONSTRAINT "check_ins_location_consistency" CHECK (("location_status" = 'available' and "latitude" is not null and "longitude" is not null and "accuracy_meters" is not null and "location_captured_at" is not null and "location_source" is not null) or ("location_status" in ('unavailable', 'redacted') and "latitude" is null and "longitude" is null and "accuracy_meters" is null and "location_captured_at" is null and "location_source" is null))`,
    );
  });

  it('uses a composite guardian foreign key for viewer grants', () => {
    expect(migration).toContain(
      'FOREIGN KEY ("guardian_id","trip_id") REFERENCES "public"."guardians"("id","trip_id")',
    );
    expect(migration).toContain(
      'CREATE UNIQUE INDEX "guardians_id_trip_unique" ON "guardians" USING btree ("id","trip_id")',
    );
  });

  it('creates uniqueness and query indexes with the required predicates', () => {
    expect(migration).toContain(
      'CREATE INDEX "route_versions_route_source_version_idx" ON "route_versions" USING btree ("route_id","source_version")',
    );
    expect(migration).toContain(
      'CREATE UNIQUE INDEX "route_versions_one_active_per_route" ON "route_versions" USING btree ("route_id") WHERE "route_versions"."is_active" = true',
    );
    expect(migration).toContain(
      `CREATE UNIQUE INDEX "trip_members_one_leader_per_trip" ON "trip_members" USING btree ("trip_id") WHERE "trip_members"."role" = 'leader'`,
    );
    expect(migration).toContain(
      `CREATE UNIQUE INDEX "trip_members_one_deputy_per_trip" ON "trip_members" USING btree ("trip_id") WHERE "trip_members"."role" = 'deputy'`,
    );
    expect(migration).toContain(
      'CREATE UNIQUE INDEX "guardians_trip_line_binding_unique" ON "guardians" USING btree ("trip_id","line_binding_id")',
    );
    expect(migration).toContain(
      `CREATE INDEX "check_ins_last_available_location_idx" ON "check_ins" USING btree ("trip_id","created_at" DESC NULLS LAST) WHERE "check_ins"."location_status" = 'available'`,
    );
    expect(migration).toContain(
      `CREATE INDEX "alert_events_pending_due_idx" ON "alert_events" USING btree ("due_at") WHERE "alert_events"."status" = 'pending' and "alert_events"."next_attempt_at" is null`,
    );
    expect(migration).toContain(
      `CREATE INDEX "alert_events_pending_next_attempt_idx" ON "alert_events" USING btree ("next_attempt_at") WHERE "alert_events"."status" = 'pending' and "alert_events"."next_attempt_at" is not null`,
    );
    expect(migration).toContain(
      `CREATE INDEX "trips_retention_finished_at_idx" ON "trips" USING btree ("finished_at") WHERE "trips"."status" = 'finished'`,
    );
    expect(migration).toContain(
      'CREATE INDEX "route_versions_active_catalog_idx" ON "route_versions" USING btree ("region","kind","mountain_name","route_name") WHERE "route_versions"."is_active" = true',
    );
  });
});
