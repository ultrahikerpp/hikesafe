import { describe, expect, it } from 'vitest';
import { getTableName } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/pg-core';

import {
  alertEvents,
  checkIns,
  guardians,
  idempotencyKeys,
  lineBindings,
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

    expect(uniqueIndexColumns).toEqual([
      [['trip_id', 'stage']],
      [['trip_id', 'user_id']],
      [['user_id', 'key']],
    ]);
  });
});
