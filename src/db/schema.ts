import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const tripStatusEnum = pgEnum('trip_status', [
  'draft',
  'active',
  'finished',
  'cancelled',
]);
export const tripRoleEnum = pgEnum('trip_role', [
  'leader',
  'deputy',
  'member',
]);
export const lineSourceTypeEnum = pgEnum('line_source_type', [
  'user',
  'group',
  'room',
]);
export const locationSourceEnum = pgEnum('location_source', [
  'gps',
  'network',
]);
export const locationStatusEnum = pgEnum('location_status', [
  'available',
  'unavailable',
]);
export const alertStageEnum = pgEnum('alert_stage', [
  'due',
  'overdue_60',
  'overdue_120',
]);
export const alertStatusEnum = pgEnum('alert_status', [
  'pending',
  'claimed',
  'sent',
  'cancelled',
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  lineUserId: text('line_user_id').notNull().unique(),
  displayName: text('display_name').notNull(),
  pictureUrl: text('picture_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const routes = pgTable('routes', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const routeVersions = pgTable('route_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  routeId: uuid('route_id')
    .notNull()
    .references(() => routes.id),
  mountainName: text('mountain_name').notNull(),
  routeName: text('route_name').notNull(),
  region: text('region').notNull(),
  kind: text('kind').notNull(),
  startLatitude: numeric('start_latitude', {
    precision: 9,
    scale: 6,
    mode: 'number',
  }).notNull(),
  startLongitude: numeric('start_longitude', {
    precision: 9,
    scale: 6,
    mode: 'number',
  }).notNull(),
  distanceKm: numeric('distance_km', {
    precision: 7,
    scale: 2,
    mode: 'number',
  }).notNull(),
  elevationGainMeters: integer('elevation_gain_meters').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  difficulty: integer('difficulty').notNull(),
  checkpoints: jsonb('checkpoints').notNull(),
  evacuationPoints: jsonb('evacuation_points').notNull(),
  permitNotes: text('permit_notes').notNull(),
  sourceOrganization: text('source_organization').notNull(),
  sourceUrl: text('source_url').notNull(),
  sourceVersion: text('source_version').notNull(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const trips = pgTable('trips', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerUserId: uuid('owner_user_id')
    .notNull()
    .references(() => users.id),
  routeVersionId: uuid('route_version_id')
    .notNull()
    .references(() => routeVersions.id),
  status: tripStatusEnum('status').notNull().default('draft'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  plannedFinishAt: timestamp('planned_finish_at', { withTimezone: true }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  vehicle: text('vehicle').notNull().default(''),
  equipment: jsonb('equipment').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const tripMembers = pgTable(
  'trip_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: tripRoleEnum('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('trip_members_trip_user_unique').on(table.tripId, table.userId),
  ],
);

export const lineBindings = pgTable('line_bindings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  sourceType: lineSourceTypeEnum('source_type'),
  sourceId: text('source_id'),
  displayName: text('display_name'),
  bindingCode: text('binding_code').unique(),
  codeExpiresAt: timestamp('code_expires_at', { withTimezone: true }),
  boundAt: timestamp('bound_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const guardians = pgTable('guardians', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id),
  lineBindingId: uuid('line_binding_id')
    .notNull()
    .references(() => lineBindings.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const checkIns = pgTable('check_ins', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  message: text('message'),
  locationStatus: locationStatusEnum('location_status').notNull(),
  latitude: numeric('latitude', {
    precision: 9,
    scale: 6,
    mode: 'number',
  }),
  longitude: numeric('longitude', {
    precision: 9,
    scale: 6,
    mode: 'number',
  }),
  accuracyMeters: numeric('accuracy_meters', {
    precision: 8,
    scale: 2,
    mode: 'number',
  }),
  locationCapturedAt: timestamp('location_captured_at', { withTimezone: true }),
  locationSource: locationSourceEnum('location_source'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const alertEvents = pgTable(
  'alert_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id),
    stage: alertStageEnum('stage').notNull(),
    status: alertStatusEnum('status').notNull().default('pending'),
    dueAt: timestamp('due_at', { withTimezone: true }).notNull(),
    nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }),
    claimedAt: timestamp('claimed_at', { withTimezone: true }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    attempts: integer('attempts').notNull().default(0),
    lastError: text('last_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('alert_events_trip_stage_unique').on(table.tripId, table.stage),
  ],
);

export const viewerGrants = pgTable('viewer_grants', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id),
  guardianId: uuid('guardian_id')
    .notNull()
    .references(() => guardians.id),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const idempotencyKeys = pgTable(
  'idempotency_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    key: text('key').notNull(),
    requestHash: text('request_hash').notNull(),
    response: jsonb('response'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idempotency_keys_user_key_unique').on(table.userId, table.key),
  ],
);
