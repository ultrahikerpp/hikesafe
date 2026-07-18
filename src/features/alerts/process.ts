import { createHmac } from 'node:crypto';

import type { AlertClaim, AlertDeliveryRepository } from '@/src/features/alerts/delivery-contract';
import type { AlertStage } from '@/src/features/alerts/domain';
import { getEnv } from '@/src/env';
import { buildLineMessage, type AlertMessageTrip, type LineMessage } from '@/src/features/line/messages';
import { buildEmergencyReport } from '@/src/features/reports/build-report';
import { hashViewerGrant } from '@/src/lib/idempotency';

export interface ConfirmedAlertEvent {
  id: string;
  stage: AlertStage;
  trip: AlertMessageTrip;
  recipients: Array<{ id: string; name: string; guardianId?: string }>;
}

export interface AlertDelivery {
  to: string;
  messages: LineMessage[];
  idempotencyKey: string;
}

export interface AlertDeliveryWork { id: string; retryKey: string; recipientId?: string; guardianId?: string | null; }
export interface ClaimedDeliveryWork { id: string; claimToken: string; }
export type PreparedDelivery =
  | { outcome: 'skipped' }
  | { outcome: 'expired' }
  | { outcome: 'ready'; id: string; claimToken?: string; to: string; retryKey: string; messages: LineMessage[] };

export interface AlertProcessRepository extends AlertDeliveryRepository {
  confirmClaimedActiveEvent(claim: AlertClaim): Promise<ConfirmedAlertEvent | undefined>;
  markSent(input: { claim: AlertClaim; now: Date }): Promise<boolean>;
  rescheduleFailure(input: { claim: AlertClaim; now: Date; error: string }): Promise<boolean>;
  claimDeliveries?(input: { claim: AlertClaim; now: Date }): Promise<AlertDeliveryWork[]>;
  deliverLocked?(input: { claim: AlertClaim; delivery: AlertDeliveryWork; now: Date; send: (delivery: AlertDelivery) => Promise<void> }): Promise<'sent' | 'failed' | 'skipped'>;
  dispatchClaim?(input: { claim: AlertClaim; now: Date }): Promise<'dispatched' | 'skipped'>;
  claimDueDeliveries?(input: { now: Date; limit: number }): Promise<ClaimedDeliveryWork[]>;
  prepareDelivery?(input: { deliveryId: string; claimToken?: string; now: Date }): Promise<PreparedDelivery>;
  beginDeliverySend?(input: { deliveryId: string; claimToken?: string; now: Date }): Promise<PreparedDelivery>;
  markDeliverySent?(input: { deliveryId: string; claimToken?: string; now: Date }): Promise<boolean>;
  rescheduleDeliveryFailure?(input: { deliveryId: string; claimToken?: string; now: Date; error: string }): Promise<boolean>;
  expireDelivery?(input: { deliveryId: string; claimToken?: string; now: Date }): Promise<boolean>;
}

export interface ProcessDueAlertsInput { now: Date; repository?: AlertProcessRepository; send?: (delivery: AlertDelivery) => Promise<void>; }
export interface AlertProcessResult { claimed: number; sent: number; failed: number; skipped: number; }
type ReportableCheckIn = {
  locationStatus: 'available' | 'unavailable' | 'redacted';
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  locationCapturedAt: Date | null;
  locationSource: 'gps' | 'network' | 'line' | null;
};

const retryDelaysMinutes = [1, 5, 15, 30] as const;
const retryWindowMs = (23 * 60 + 45) * 60_000;
export const retryDeadlineAt = (firstAttemptAt: Date) => new Date(firstAttemptAt.getTime() + retryWindowMs);
export const retryAt = (now: Date, attempt: number) => new Date(now.getTime()
  + retryDelaysMinutes[Math.min(Math.max(attempt, 1), retryDelaysMinutes.length) - 1] * 60_000);

// The token is recoverable from durable delivery identity/version, but its raw value is never stored.
export const createGrantToken = (deliveryId: string, version: number, secret: string) =>
  createHmac('sha256', secret).update(`${deliveryId}:${version}`).digest('base64url');

const grantTokenMarker = '__BESAFE_GRANT_TOKEN__';
export const materializeDeliveryMessages = (messages: LineMessage[], deliveryId: string, grantVersion: number, secret: string): LineMessage[] =>
  JSON.parse(JSON.stringify(messages).replaceAll(grantTokenMarker, createGrantToken(deliveryId, grantVersion, secret))) as LineMessage[];

const noOpSend = async () => undefined;
const isRetryConflict = (error: unknown) => typeof error === 'object' && error !== null && 'status' in error && error.status === 409;
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'LINE delivery failed';

export const toEmergencyReportLocation = (checkIn: ReportableCheckIn | undefined) =>
  checkIn?.locationStatus === 'available' &&
  checkIn.latitude !== null &&
  checkIn.longitude !== null &&
  checkIn.locationCapturedAt !== null &&
  checkIn.locationSource !== null
    ? {
      latitude: checkIn.latitude,
      longitude: checkIn.longitude,
      accuracyMeters: checkIn.accuracyMeters,
      capturedAt: checkIn.locationCapturedAt,
      source: checkIn.locationSource,
    }
    : null;

export const processDueAlerts = async ({ now, repository = databaseRepository, send = noOpSend }: ProcessDueAlertsInput): Promise<AlertProcessResult> => {
  const claims = await repository.claimDueActiveEvents({ now, limit: 100 });
  const result: AlertProcessResult = { claimed: claims.length, sent: 0, failed: 0, skipped: 0 };

  for (const claim of claims) {
    if (repository.dispatchClaim) {
      if (await repository.dispatchClaim({ claim, now }) === 'skipped') result.skipped += 1;
      continue;
    }
    if (repository.claimDeliveries && repository.deliverLocked) {
      for (const delivery of await repository.claimDeliveries({ claim, now })) {
        const outcome = await repository.deliverLocked({ claim, delivery, now, send: async (input) => {
          try { await send(input); } catch (error) { if (!isRetryConflict(error)) throw error; }
        } });
        result[outcome] += 1;
      }
      continue;
    }
    let confirmed = await repository.confirmClaimedActiveEvent(claim);
    if (!confirmed) { result.skipped += 1; continue; }
    try {
      if (confirmed.recipients.length === 0) {
        if (await repository.markSent({ claim, now })) result.sent += 1; else result.skipped += 1;
        continue;
      }
      let invalidated = false;
      for (let index = 0; index < confirmed.recipients.length; index += 1) {
        if (index > 0) {
          confirmed = await repository.confirmClaimedActiveEvent(claim);
          if (!confirmed) { invalidated = true; break; }
        }
        const recipient = confirmed.recipients[index];
        await send({ to: recipient.id, messages: [buildLineMessage(confirmed.stage, confirmed.trip)], idempotencyKey: confirmed.id });
      }
      if (invalidated) { result.skipped += 1; continue; }
      if (await repository.markSent({ claim, now })) result.sent += 1; else result.skipped += 1;
    } catch (error) {
      if (await repository.rescheduleFailure({ claim, now, error: errorMessage(error) })) result.failed += 1; else result.skipped += 1;
    }
  }

  if (!repository.claimDueDeliveries || !repository.prepareDelivery || !repository.markDeliverySent || !repository.rescheduleDeliveryFailure) return result;
  for (const delivery of await repository.claimDueDeliveries({ now, limit: 100 })) {
    const prepared = await repository.prepareDelivery({ deliveryId: delivery.id, claimToken: delivery.claimToken, now });
    if (prepared.outcome === 'expired') {
      await repository.expireDelivery?.({ deliveryId: delivery.id, claimToken: delivery.claimToken, now });
      result.skipped += 1;
      continue;
    }
    if (prepared.outcome === 'skipped') { result.skipped += 1; continue; }
    const linearized = repository.beginDeliverySend
      ? await repository.beginDeliverySend({ deliveryId: prepared.id, claimToken: prepared.claimToken, now })
      : prepared;
    if (linearized.outcome === 'expired') {
      await repository.expireDelivery?.({ deliveryId: prepared.id, claimToken: prepared.claimToken, now });
      result.skipped += 1;
      continue;
    }
    if (linearized.outcome === 'skipped') { result.skipped += 1; continue; }
    try {
      try { await send({ to: linearized.to, messages: linearized.messages, idempotencyKey: linearized.retryKey }); }
      catch (error) { if (!isRetryConflict(error)) throw error; }
      if (await repository.markDeliverySent({ deliveryId: linearized.id, claimToken: linearized.claimToken, now })) result.sent += 1;
      else result.skipped += 1;
    } catch (error) {
      if (await repository.rescheduleDeliveryFailure({ deliveryId: linearized.id, claimToken: linearized.claimToken, now, error: errorMessage(error) })) result.failed += 1;
      else result.skipped += 1;
    }
  }
  return result;
};

export const createDatabaseAlertProcessRepository = (db: any) => ({
  async claimDueDeliveries({ now, limit }: { now: Date; limit: number }) {
    const [{ alertDeliveries }, { sql }] = await Promise.all([import('@/src/db/schema'), import('drizzle-orm')]);
    const instant = now.toISOString();
    const rows = await db.transaction((transaction: any) => transaction.execute(sql`
      WITH due_deliveries AS (
        SELECT ${alertDeliveries.id} FROM ${alertDeliveries}
        WHERE (${alertDeliveries.status} = 'pending' AND (${alertDeliveries.nextAttemptAt} IS NULL OR ${alertDeliveries.nextAttemptAt} <= ${instant}))
          OR (${alertDeliveries.status} IN ('claimed', 'sending') AND ${alertDeliveries.claimExpiresAt} <= ${instant})
        ORDER BY COALESCE(${alertDeliveries.nextAttemptAt}, ${alertDeliveries.createdAt}) FOR UPDATE SKIP LOCKED LIMIT ${limit}
      ) UPDATE ${alertDeliveries} SET status = 'claimed', claimed_at = ${instant}, claim_token = replace(gen_random_uuid()::text, '-', ''),
        claim_version = claim_version + 1, claim_expires_at = ${instant}::timestamptz + interval '5 minutes'
      FROM due_deliveries WHERE ${alertDeliveries.id} = due_deliveries.id
      RETURNING ${alertDeliveries.id}, ${alertDeliveries.claimToken}`));
    return Array.from(rows as Iterable<{ id: string; claim_token: string }>).map((row) => ({ id: row.id, claimToken: row.claim_token }));
  },
});

export const databaseAlertProcessRepository: AlertProcessRepository = {
  async claimDueActiveEvents({ now, limit }) {
    const [{ db }, { alertEvents, trips }, { sql }] = await Promise.all([import('@/src/db/client'), import('@/src/db/schema'), import('drizzle-orm')]);
    const instant = now.toISOString();
    const rows = await db.transaction((transaction) => transaction.execute(sql`
      WITH due_events AS (
        SELECT ${alertEvents.id} FROM ${alertEvents} INNER JOIN ${trips} ON ${trips.id} = ${alertEvents.tripId}
        WHERE (${trips.status} = 'active' OR (${trips.status} = 'finished' AND ${alertEvents.stage} = 'finished')) AND (( ${alertEvents.status} = 'pending' AND ${alertEvents.dueAt} <= ${instant}
          AND (${alertEvents.nextAttemptAt} IS NULL OR ${alertEvents.nextAttemptAt} <= ${instant}))
          OR (${alertEvents.status} = 'claimed' AND ${alertEvents.claimExpiresAt} <= ${instant}))
        ORDER BY ${alertEvents.dueAt} FOR UPDATE OF ${alertEvents} SKIP LOCKED LIMIT ${limit}
      ) UPDATE ${alertEvents} SET status = 'claimed', claimed_at = ${instant}, claim_token = replace(gen_random_uuid()::text, '-', ''),
          claim_version = claim_version + 1, claim_expires_at = ${instant}::timestamptz + interval '5 minutes'
      FROM due_events WHERE ${alertEvents.id} = due_events.id
      RETURNING ${alertEvents.id}, ${alertEvents.claimToken}, ${alertEvents.claimVersion}`));
    return Array.from(rows as Iterable<{ id: string; claim_token: string; claim_version: number }>).map((row) => ({ eventId: row.id, claimToken: row.claim_token, claimVersion: row.claim_version }));
  },

  async dispatchClaim({ claim, now }) {
    const [{ db }, { alertDeliveries, alertEvents, guardians, lineBindings, routeVersions, tripMembers, trips, users }, { and, eq, isNotNull, isNull }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'), import('drizzle-orm'),
    ]);
    return db.transaction(async (transaction) => {
      const [event] = await transaction.select({ id: alertEvents.id, tripId: trips.id, stage: alertEvents.stage, status: trips.status })
        .from(alertEvents).innerJoin(trips, eq(trips.id, alertEvents.tripId))
        .where(and(eq(alertEvents.id, claim.eventId), eq(alertEvents.status, 'claimed'), eq(alertEvents.claimToken, claim.claimToken), eq(alertEvents.claimVersion, claim.claimVersion))).for('update').limit(1);
      if (!event || !(event.status === 'active' || (event.status === 'finished' && event.stage === 'finished'))) {
        if (event) await transaction.update(alertEvents).set({ status: 'cancelled' }).where(eq(alertEvents.id, event.id));
        return 'skipped' as const;
      }
      const members = await transaction.select({ id: users.lineUserId }).from(tripMembers).innerJoin(users, eq(users.id, tripMembers.userId)).where(eq(tripMembers.tripId, event.tripId));
      const guardiansRows = await transaction.select({ recipientId: lineBindings.sourceId, guardianId: guardians.id, sourceType: lineBindings.sourceType, guardianLineUserId: users.lineUserId })
        .from(guardians).innerJoin(lineBindings, eq(lineBindings.id, guardians.lineBindingId)).innerJoin(users, eq(users.id, lineBindings.userId))
        .where(and(eq(guardians.tripId, event.tripId), isNotNull(lineBindings.sourceId), isNotNull(lineBindings.boundAt), isNull(lineBindings.revokedAt)));
      const recipients = event.stage === 'due'
        ? members.map((member) => ({ recipientId: member.id }))
        : guardiansRows.map((guardian) => ({ recipientId: guardian.recipientId!, guardianId: guardian.guardianId,
          guardianLineUserId: guardian.sourceType === 'user' ? guardian.guardianLineUserId : null,
          viewerGrantEligible: guardian.sourceType === 'user' }));
      if (recipients.length) await transaction.insert(alertDeliveries).values(recipients.map((recipient) => ({ eventId: event.id, ...recipient }))).onConflictDoNothing();
      await transaction.update(alertEvents).set({ status: 'sent', sentAt: now, claimExpiresAt: null }).where(eq(alertEvents.id, event.id));
      return recipients.length ? 'dispatched' as const : 'skipped' as const;
    });
  },

  async claimDueDeliveries({ now, limit }) {
    const { db } = await import('@/src/db/client');
    return createDatabaseAlertProcessRepository(db).claimDueDeliveries({ now, limit });
  },

  async prepareDelivery({ deliveryId, claimToken, now }) {
    const [{ db }, { alertDeliveries, alertEvents, checkIns, routeVersions, trips, tripMembers, users, viewerGrants }, { and, desc, eq }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'), import('drizzle-orm'),
    ]);
    return db.transaction(async (transaction) => {
      const [delivery] = await transaction.select({ id: alertDeliveries.id, claimToken: alertDeliveries.claimToken, retryKey: alertDeliveries.retryKey, message: alertDeliveries.message, recipientId: alertDeliveries.recipientId, guardianId: alertDeliveries.guardianId, guardianLineUserId: alertDeliveries.guardianLineUserId, viewerGrantEligible: alertDeliveries.viewerGrantEligible, grantVersion: alertDeliveries.grantVersion, firstAttemptAt: alertDeliveries.firstAttemptAt, retryDeadlineAt: alertDeliveries.retryDeadlineAt, stage: alertEvents.stage, tripId: trips.id, tripStatus: trips.status, plannedFinishAt: trips.plannedFinishAt, startedAt: trips.startedAt, startsAt: trips.startsAt, vehicle: trips.vehicle, equipment: trips.equipment, routeName: routeVersions.routeName, checkpoints: routeVersions.checkpoints, evacuationPoints: routeVersions.evacuationPoints, leaderPhone: trips.leaderPhone })
        .from(alertDeliveries).innerJoin(alertEvents, eq(alertEvents.id, alertDeliveries.eventId)).innerJoin(trips, eq(trips.id, alertEvents.tripId)).innerJoin(routeVersions, eq(routeVersions.id, trips.routeVersionId))
        .where(and(eq(alertDeliveries.id, deliveryId), eq(alertDeliveries.status, 'claimed'), claimToken ? eq(alertDeliveries.claimToken, claimToken) : undefined!)).for('update').limit(1);
      if (!delivery || !(delivery.tripStatus === 'active' || (delivery.tripStatus === 'finished' && delivery.stage === 'finished'))) {
        if (delivery) await transaction.update(alertDeliveries).set({ status: 'cancelled' }).where(eq(alertDeliveries.id, delivery.id));
        return { outcome: 'skipped' as const };
      }
      const deadline = delivery.retryDeadlineAt ?? retryDeadlineAt(now);
      if (deadline <= now) return { outcome: 'expired' as const };
      let messages = delivery.message as LineMessage[] | null;
      if (!messages) {
        const [lastCheckIn] = await transaction.select({ createdAt: checkIns.createdAt, locationStatus: checkIns.locationStatus, latitude: checkIns.latitude, longitude: checkIns.longitude, accuracyMeters: checkIns.accuracyMeters, locationCapturedAt: checkIns.locationCapturedAt, locationSource: checkIns.locationSource }).from(checkIns).where(eq(checkIns.tripId, delivery.tripId)).orderBy(desc(checkIns.createdAt)).limit(1);
        const members = await transaction.select({ name: users.displayName }).from(tripMembers).innerJoin(users, eq(users.id, tripMembers.userId)).where(eq(tripMembers.tripId, delivery.tripId));
        const location = toEmergencyReportLocation(lastCheckIn);
        const report = buildEmergencyReport({
          team: members.map((member) => member.name), route: delivery.routeName,
          startedAt: delivery.startedAt ?? delivery.startsAt, plannedFinishAt: delivery.plannedFinishAt,
          lastCheckIn: lastCheckIn ? { at: lastCheckIn.createdAt, location } : null,
          vehicle: delivery.vehicle, equipment: delivery.equipment as string[],
          checkpoints: delivery.checkpoints as string[], evacuationPoints: delivery.evacuationPoints as string[],
        });
        const trip: AlertMessageTrip = { id: delivery.tripId, routeName: delivery.routeName, plannedFinishAt: delivery.plannedFinishAt, team: members.map((member) => member.name), lastCheckInAt: lastCheckIn?.createdAt ?? null, lastLocationStatus: lastCheckIn?.locationStatus ?? 'unavailable', lastLocationAccuracyMeters: lastCheckIn?.accuracyMeters ?? null, lastLocationSource: lastCheckIn?.locationSource ?? null, leaderPhone: delivery.leaderPhone,
          reportText: report.text };
        if (delivery.stage === 'overdue_120' && delivery.viewerGrantEligible && delivery.guardianId && delivery.guardianLineUserId) {
          const token = createGrantToken(delivery.id, delivery.grantVersion, getEnv().GRANT_TOKEN_SECRET);
          await transaction.insert(viewerGrants).values({ tripId: delivery.tripId, guardianId: delivery.guardianId, deliveryId: delivery.id, tokenVersion: delivery.grantVersion, guardianLineUserId: delivery.guardianLineUserId, tokenHash: hashViewerGrant(token), expiresAt: deadline }).onConflictDoNothing();
          trip.viewerGrantUrl = `https://liff.line.me/${getEnv().NEXT_PUBLIC_LIFF_ID}/trips/${delivery.tripId}/guardian-viewer?grant=${grantTokenMarker}`;
        }
        messages = [buildLineMessage(delivery.stage, trip)];
      }
      await transaction.update(alertDeliveries).set({ message: messages, retryDeadlineAt: deadline })
        .where(and(eq(alertDeliveries.id, delivery.id), eq(alertDeliveries.status, 'claimed'), eq(alertDeliveries.claimToken, delivery.claimToken!)));
      return { outcome: 'ready' as const, id: delivery.id, claimToken: delivery.claimToken!, to: delivery.recipientId, retryKey: delivery.retryKey, messages };
    });
  },

  async beginDeliverySend({ deliveryId, claimToken, now }) {
    const [{ db }, { alertDeliveries, alertEvents, trips }, { and, eq }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'), import('drizzle-orm'),
    ]);
    return db.transaction(async (transaction) => {
      const [trip] = await transaction.select({ status: trips.status, stage: alertEvents.stage }).from(trips)
        .innerJoin(alertEvents, eq(alertEvents.tripId, trips.id))
        .innerJoin(alertDeliveries, eq(alertDeliveries.eventId, alertEvents.id))
        .where(eq(alertDeliveries.id, deliveryId)).for('update').limit(1);
      const [delivery] = await transaction.select({ id: alertDeliveries.id, claimToken: alertDeliveries.claimToken, retryKey: alertDeliveries.retryKey, message: alertDeliveries.message, recipientId: alertDeliveries.recipientId, grantVersion: alertDeliveries.grantVersion, firstAttemptAt: alertDeliveries.firstAttemptAt, retryDeadlineAt: alertDeliveries.retryDeadlineAt })
        .from(alertDeliveries).where(and(eq(alertDeliveries.id, deliveryId), eq(alertDeliveries.status, 'claimed'), claimToken ? eq(alertDeliveries.claimToken, claimToken) : undefined!)).for('update').limit(1);
      if (!trip || !delivery || !(trip.status === 'active' || (trip.status === 'finished' && trip.stage === 'finished'))) return { outcome: 'skipped' as const };
      if (!delivery.message || (delivery.retryDeadlineAt && delivery.retryDeadlineAt <= now)) return { outcome: 'expired' as const };
      await transaction.update(alertDeliveries).set({ status: 'sending', firstAttemptAt: delivery.firstAttemptAt ?? now, claimExpiresAt: new Date(now.getTime() + 5 * 60_000) })
        .where(and(eq(alertDeliveries.id, delivery.id), eq(alertDeliveries.status, 'claimed'), eq(alertDeliveries.claimToken, delivery.claimToken!)));
      return { outcome: 'ready' as const, id: delivery.id, claimToken: delivery.claimToken!, to: delivery.recipientId, retryKey: delivery.retryKey,
        messages: materializeDeliveryMessages(delivery.message as LineMessage[], delivery.id, delivery.grantVersion, getEnv().GRANT_TOKEN_SECRET) };
    });
  },

  async markDeliverySent({ deliveryId, claimToken, now }) {
    const [{ db }, { alertDeliveries }, { and, eq }] = await Promise.all([import('@/src/db/client'), import('@/src/db/schema'), import('drizzle-orm')]);
    const updated = await db.update(alertDeliveries).set({ status: 'sent', sentAt: now, claimExpiresAt: null }).where(and(eq(alertDeliveries.id, deliveryId), eq(alertDeliveries.status, 'sending'), claimToken ? eq(alertDeliveries.claimToken, claimToken) : undefined!)).returning({ id: alertDeliveries.id });
    return updated.length === 1;
  },

  async rescheduleDeliveryFailure({ deliveryId, claimToken, now, error }) {
    const [{ db }, { alertDeliveries }, { and, eq, sql }] = await Promise.all([import('@/src/db/client'), import('@/src/db/schema'), import('drizzle-orm')]);
    const instant = now.toISOString();
    const delay = sql`CASE LEAST(attempts + 1, 4) WHEN 1 THEN ${instant}::timestamptz + interval '1 minute' WHEN 2 THEN ${instant}::timestamptz + interval '5 minutes' WHEN 3 THEN ${instant}::timestamptz + interval '15 minutes' ELSE ${instant}::timestamptz + interval '30 minutes' END`;
    const updated = await db.update(alertDeliveries).set({ status: sql`CASE WHEN retry_deadline_at <= ${delay} THEN 'manual_review'::alert_delivery_status ELSE 'pending'::alert_delivery_status END`, claimedAt: null, claimToken: null, claimExpiresAt: null, attempts: sql`attempts + 1`, nextAttemptAt: sql`CASE WHEN retry_deadline_at <= ${delay} THEN NULL ELSE ${delay} END`, lastError: error.slice(0, 1000) }).where(and(eq(alertDeliveries.id, deliveryId), eq(alertDeliveries.status, 'sending'), claimToken ? eq(alertDeliveries.claimToken, claimToken) : undefined!)).returning({ id: alertDeliveries.id });
    return updated.length === 1;
  },

  async expireDelivery({ deliveryId, claimToken, now }) {
    const [{ db }, { alertDeliveries }, { and, eq }] = await Promise.all([import('@/src/db/client'), import('@/src/db/schema'), import('drizzle-orm')]);
    const updated = await db.update(alertDeliveries).set({ status: 'manual_review', claimExpiresAt: null, lastError: 'LINE retry window expired; manual review required' })
      .where(and(eq(alertDeliveries.id, deliveryId), eq(alertDeliveries.status, 'claimed'), claimToken ? eq(alertDeliveries.claimToken, claimToken) : undefined!)).returning({ id: alertDeliveries.id });
    return updated.length === 1;
  },

  // Legacy adapters keep the pure process contract usable by existing tests and callers.
  async confirmClaimedActiveEvent() { return undefined; },
  async markSent() { return false; },
  async rescheduleFailure() { return false; },
};

const databaseRepository = databaseAlertProcessRepository;
