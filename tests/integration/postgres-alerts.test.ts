import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';

import { applyMigrations } from '@/src/db/migrations';
import { createDatabaseAlertProcessRepository } from '@/src/features/alerts/process';
import { finishTrip } from '@/src/features/trips/commands';

const databaseUrl = process.env.BESAFE_TEST_DATABASE_URL
  ?? 'postgres://miroppp@127.0.0.1:55432/besafe_test';

Object.assign(process.env, {
  DATABASE_URL: databaseUrl,
  LINE_CHANNEL_ID: 'test-channel',
  LINE_CHANNEL_SECRET: 'test-channel-secret',
  LINE_CHANNEL_ACCESS_TOKEN: 'test-access-token',
  SESSION_SECRET: 'a'.repeat(32),
  JOB_SECRET: 'b'.repeat(32),
  GRANT_TOKEN_SECRET: 'c'.repeat(32),
  NEXT_PUBLIC_LIFF_ID: 'test-liff',
});

let admin: Sql;
let first: Sql | undefined;
let second: Sql | undefined;

const resetDatabase = async () => {
  await admin.unsafe('DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO PUBLIC;');
  await applyMigrations(admin);
};

const seedTrip = async () => {
  const [{ id: ownerId }] = await admin<{ id: string }[]>`
    INSERT INTO users (line_user_id, display_name) VALUES ('leader', 'Leader') RETURNING id
  `;
  const [{ id: deputyId }] = await admin<{ id: string }[]>`
    INSERT INTO users (line_user_id, display_name) VALUES ('deputy', 'Deputy') RETURNING id
  `;
  const [{ id: routeId }] = await admin<{ id: string }[]>`
    INSERT INTO routes (slug) VALUES ('postgres-alert-test') RETURNING id
  `;
  const [{ id: routeVersionId }] = await admin<{ id: string }[]>`
    INSERT INTO route_versions (
      route_id, mountain_name, route_name, region, kind, start_latitude,
      start_longitude, distance_km, elevation_gain_meters, duration_minutes,
      difficulty, checkpoints, evacuation_points, permit_notes,
      source_organization, source_url, source_version, reviewed_at
    ) VALUES (
      ${routeId}, 'Test Mountain', 'Test Route', 'test', 'suburban', 24.1,
      121.1, 1, 1, 60, 1, '[]'::jsonb, '[]'::jsonb, '',
      'Test', 'https://example.test', '1', now()
    ) RETURNING id
  `;
  const [{ id: tripId }] = await admin<{ id: string }[]>`
    INSERT INTO trips (owner_user_id, route_version_id, status, starts_at, planned_finish_at, started_at)
    VALUES (${ownerId}, ${routeVersionId}, 'active', now() - interval '1 hour', now() + interval '1 hour', now())
    RETURNING id
  `;
  await admin`
    INSERT INTO trip_members (trip_id, user_id, role)
    VALUES (${tripId}, ${ownerId}, 'leader'), (${tripId}, ${deputyId}, 'deputy')
  `;
  return { tripId, deputyId };
};

const seedDelivery = async (tripId: string, status: 'pending' | 'sending' = 'pending') => {
  const [{ id: eventId }] = await admin<{ id: string }[]>`
    INSERT INTO alert_events (trip_id, stage, status, due_at)
    VALUES (${tripId}, 'due', 'sent', now() - interval '1 hour') RETURNING id
  `;
  const [{ id }] = await admin<{ id: string }[]>`
    INSERT INTO alert_deliveries (event_id, recipient_id, status, claim_expires_at, message)
    VALUES (
      ${eventId}, ${`recipient-${status}`}, ${status}::alert_delivery_status,
      ${status === 'sending' ? new Date(Date.now() - 60_000) : null},
      '[{"type":"text","text":"persisted"}]'::jsonb
    ) RETURNING id
  `;
  return { id, eventId };
};

beforeAll(async () => {
  admin = postgres(databaseUrl, { max: 1, prepare: false });
});

beforeEach(async () => {
  await resetDatabase();
  await Promise.all([first?.end(), second?.end()]);
  first = postgres(databaseUrl, { max: 1 });
  second = postgres(databaseUrl, { max: 1 });
});

afterAll(async () => {
  await Promise.all([admin.end(), first?.end(), second?.end()]);
});

describe('PostgreSQL alert concurrency', () => {
  it('applies migrations 0000 through 0003 to a clean PostgreSQL schema', async () => {
    const rows = await admin<{ version: string }[]>`
      SELECT version FROM __besafe_migrations ORDER BY version
    `;
    expect(rows.map(({ version }) => version)).toEqual([
      '0000_initial.sql',
      '0001_alert-deliveries.sql',
      '0002_cultured_mad_thinker.sql',
      '0003_nervous_umar.sql',
    ]);
    await expect(admin`SELECT 'manual_review'::alert_delivery_status`).resolves.toHaveLength(1);
  });

  it('claims child deliveries once across independent connections while a row is SKIP LOCKED', async () => {
    const { tripId } = await seedTrip();
    const locked = await seedDelivery(tripId);
    const available = await seedDelivery(tripId);
    const workerOne = createDatabaseAlertProcessRepository(drizzle(first!));
    const workerTwo = createDatabaseAlertProcessRepository(drizzle(second!));
    const now = new Date();

    await first!.begin(async (transaction) => {
      await transaction`SELECT id FROM alert_deliveries WHERE id = ${locked.id} FOR UPDATE`;
      await expect(workerTwo.claimDueDeliveries?.({ now, limit: 10 })).resolves.toEqual([
        expect.objectContaining({ id: available.id }),
      ]);
    });

    await expect(workerOne.claimDueDeliveries?.({ now, limit: 10 })).resolves.toEqual([
      expect.objectContaining({ id: locked.id }),
    ]);

    const claims = await admin<{ id: string; status: string }[]>`
      SELECT id, status::text FROM alert_deliveries ORDER BY id
    `;
    expect(claims).toEqual(expect.arrayContaining([
      { id: locked.id, status: 'claimed' },
      { id: available.id, status: 'claimed' },
    ]));
  });

  it('cancels pending delivery only after the lifecycle transaction obtains the trip lock', async () => {
    const { tripId, deputyId } = await seedTrip();
    const delivery = await seedDelivery(tripId);
    let completed = false;

    let finish: Promise<void> | undefined;
    await first!.begin(async (transaction) => {
      await transaction`SELECT id FROM trips WHERE id = ${tripId} FOR UPDATE`;
      finish = finishTrip({
        tripId,
        userId: deputyId,
        idempotencyKey: 'finish-postgres-lock-order',
        now: new Date(),
      }).then(() => { completed = true; });

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(completed).toBe(false);
      await expect(admin<{ status: string }[]>`SELECT status::text FROM alert_deliveries WHERE id = ${delivery.id}`)
        .resolves.toEqual([{ status: 'pending' }]);
    });
    await finish;

    await expect(admin<{ trip: string; delivery: string }[]>`
      SELECT t.status::text AS trip, d.status::text AS delivery
      FROM trips t JOIN alert_events e ON e.trip_id = t.id JOIN alert_deliveries d ON d.event_id = e.id
      WHERE t.id = ${tripId}
    `).resolves.toEqual([{ trip: 'finished', delivery: 'cancelled' }]);
  });

  it('reclaims an expired sending delivery without changing its retry key or persisted message', async () => {
    const { tripId } = await seedTrip();
    const delivery = await seedDelivery(tripId, 'sending');
    const [{ retry_key: retryKey, message }] = await admin<{ retry_key: string; message: unknown }[]>`
      SELECT retry_key, message FROM alert_deliveries WHERE id = ${delivery.id}
    `;
    const worker = createDatabaseAlertProcessRepository(drizzle(first!));

    await expect(worker.claimDueDeliveries?.({ now: new Date(), limit: 10 })).resolves.toEqual([
      expect.objectContaining({ id: delivery.id }),
    ]);
    await expect(admin<{ status: string; retry_key: string; message: unknown; claim_version: number }[]>`
      SELECT status::text, retry_key, message, claim_version FROM alert_deliveries WHERE id = ${delivery.id}
    `).resolves.toEqual([expect.objectContaining({
      status: 'claimed', retry_key: retryKey, message, claim_version: 1,
    })]);
  });
});
