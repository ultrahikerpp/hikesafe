import { randomBytes } from 'node:crypto';

import type { AlertClaim, AlertDeliveryRepository } from '@/src/features/alerts/delivery-contract';
import type { AlertStage } from '@/src/features/alerts/domain';
import { buildLineMessage, type AlertMessageTrip, type LineMessage } from '@/src/features/line/messages';
import { hashViewerGrant } from '@/src/lib/idempotency';

export interface ConfirmedAlertEvent {
  id: string;
  stage: AlertStage;
  trip: AlertMessageTrip;
  recipients: Array<{ id: string; name: string; guardianId?: string }>;
}

export interface AlertProcessRepository extends AlertDeliveryRepository {
  confirmClaimedActiveEvent(claim: AlertClaim): Promise<ConfirmedAlertEvent | undefined>;
  markSent(input: { claim: AlertClaim; now: Date }): Promise<boolean>;
  rescheduleFailure(input: { claim: AlertClaim; now: Date; error: string }): Promise<boolean>;
  claimDeliveries?(input: { claim: AlertClaim; now: Date }): Promise<AlertDeliveryWork[]>;
  deliverLocked?(input: {
    claim: AlertClaim;
    delivery: AlertDeliveryWork;
    now: Date;
    send: (delivery: AlertDelivery) => Promise<void>;
  }): Promise<'sent' | 'failed' | 'skipped'>;
}

export interface AlertDelivery {
  to: string;
  messages: LineMessage[];
  idempotencyKey: string;
}

export interface AlertDeliveryWork {
  id: string;
  retryKey: string;
  recipientId?: string;
  guardianId?: string | null;
}

export interface ProcessDueAlertsInput {
  now: Date;
  repository?: AlertProcessRepository;
  send?: (delivery: AlertDelivery) => Promise<void>;
}

export interface AlertProcessResult {
  claimed: number;
  sent: number;
  failed: number;
  skipped: number;
}

const retryDelaysMinutes = [1, 5, 15, 30] as const;

export const retryAt = (now: Date, attempt: number) => new Date(
  now.getTime() + retryDelaysMinutes[Math.min(Math.max(attempt, 1), retryDelaysMinutes.length) - 1] * 60_000,
);

const noOpSend = async () => undefined;

const isRetryConflict = (error: unknown) =>
  typeof error === 'object' && error !== null && 'status' in error && error.status === 409;

export const processDueAlerts = async ({
  now,
  repository = databaseRepository,
  send = noOpSend,
}: ProcessDueAlertsInput): Promise<AlertProcessResult> => {
  const claims = await repository.claimDueActiveEvents({ now, limit: 100 });
  const result: AlertProcessResult = { claimed: claims.length, sent: 0, failed: 0, skipped: 0 };

  for (const claim of claims) {
    if (repository.claimDeliveries && repository.deliverLocked) {
      const deliveries = await repository.claimDeliveries({ claim, now });
      for (const delivery of deliveries) {
        const outcome = await repository.deliverLocked({
          claim,
          delivery,
          now,
          send: async (input) => {
            try { await send(input); } catch (error) { if (!isRetryConflict(error)) throw error; }
          },
        });
        result[outcome] += 1;
      }
      continue;
    }
    let confirmed = await repository.confirmClaimedActiveEvent(claim);
    if (!confirmed) {
      result.skipped += 1;
      continue;
    }

    try {
      if (confirmed.recipients.length === 0) {
        if (await repository.markSent({ claim, now })) result.sent += 1;
        else result.skipped += 1;
        continue;
      }

      let invalidated = false;
      for (let index = 0; index < confirmed.recipients.length; index += 1) {
        if (index > 0) {
          confirmed = await repository.confirmClaimedActiveEvent(claim);
          if (!confirmed) {
            invalidated = true;
            break;
          }
        }
        const recipient = confirmed.recipients[index];
        await send({
          to: recipient.id,
          messages: [buildLineMessage(confirmed.stage, confirmed.trip)],
          idempotencyKey: confirmed.id,
        });
      }

      if (invalidated) {
        result.skipped += 1;
      } else if (await repository.markSent({ claim, now })) {
        result.sent += 1;
      } else {
        result.skipped += 1;
      }
    } catch (error) {
      const updated = await repository.rescheduleFailure({
        claim,
        now,
        error: error instanceof Error ? error.message : 'LINE delivery failed',
      });
      if (updated) result.failed += 1;
      else result.skipped += 1;
    }
  }
  return result;
};

const databaseRepository: AlertProcessRepository = {
  async claimDueActiveEvents({ now, limit }) {
    const [{ db }, { alertEvents, trips }, { sql }] = await Promise.all([
      import('@/src/db/client'),
      import('@/src/db/schema'),
      import('drizzle-orm'),
    ]);
    const rows = await db.transaction(async (transaction) => transaction.execute(sql`
      WITH due_events AS (
        SELECT ${alertEvents.id}
        FROM ${alertEvents}
        INNER JOIN ${trips} ON ${trips.id} = ${alertEvents.tripId}
        WHERE ${trips.status} = 'active'
          AND (
            (${alertEvents.status} = 'pending'
              AND ${alertEvents.dueAt} <= ${now}
              AND (${alertEvents.nextAttemptAt} IS NULL OR ${alertEvents.nextAttemptAt} <= ${now}))
            OR (${alertEvents.status} = 'claimed' AND ${alertEvents.claimExpiresAt} <= ${now})
          )
        ORDER BY ${alertEvents.dueAt}
        FOR UPDATE OF ${alertEvents} SKIP LOCKED
        LIMIT ${limit}
      )
      UPDATE ${alertEvents}
      SET status = 'claimed',
          claimed_at = ${now},
          claim_token = replace(gen_random_uuid()::text, '-', ''),
          claim_version = claim_version + 1,
          claim_expires_at = ${now} + interval '5 minutes'
      FROM due_events
      WHERE ${alertEvents.id} = due_events.id
      RETURNING ${alertEvents.id}, ${alertEvents.claimToken}, ${alertEvents.claimVersion}
    `));
    return Array.from(rows as Iterable<{ id: string; claim_token: string; claim_version: number }>).map((row) => ({
      eventId: row.id,
      claimToken: row.claim_token,
      claimVersion: row.claim_version,
    }));
  },

  async confirmClaimedActiveEvent(claim) {
    const [
      { db },
      { alertEvents, checkIns, guardians, lineBindings, routeVersions, tripMembers, trips, users },
      { and, desc, eq, gt, isNotNull, isNull },
    ] = await Promise.all([
      import('@/src/db/client'),
      import('@/src/db/schema'),
      import('drizzle-orm'),
    ]);
    const [event] = await db.select({
      id: alertEvents.id,
      tripId: trips.id,
      stage: alertEvents.stage,
      plannedFinishAt: trips.plannedFinishAt,
      routeName: routeVersions.routeName,
      leaderPhone: trips.leaderPhone,
    }).from(alertEvents)
      .innerJoin(trips, eq(trips.id, alertEvents.tripId))
      .innerJoin(routeVersions, eq(routeVersions.id, trips.routeVersionId))
      .where(and(
        eq(alertEvents.id, claim.eventId),
        eq(alertEvents.status, 'claimed'),
        eq(alertEvents.claimToken, claim.claimToken),
        eq(alertEvents.claimVersion, claim.claimVersion),
        gt(alertEvents.claimExpiresAt, new Date()),
        eq(trips.status, 'active'),
      )).limit(1);
    if (!event) return undefined;

    const [lastCheckIn] = await db.select({
      createdAt: checkIns.createdAt,
      locationStatus: checkIns.locationStatus,
    }).from(checkIns).where(eq(checkIns.tripId, event.tripId)).orderBy(desc(checkIns.createdAt)).limit(1);
    const members = await db.select({ id: users.lineUserId, name: users.displayName })
      .from(tripMembers).innerJoin(users, eq(users.id, tripMembers.userId))
      .where(eq(tripMembers.tripId, event.tripId));
    const guardianRecipients = await db.select({ id: lineBindings.sourceId, name: lineBindings.displayName, guardianId: guardians.id })
      .from(guardians).innerJoin(lineBindings, eq(lineBindings.id, guardians.lineBindingId))
      .where(and(
        eq(guardians.tripId, event.tripId),
        isNotNull(lineBindings.sourceId),
        isNotNull(lineBindings.boundAt),
        isNull(lineBindings.revokedAt),
      ));
    const viewerGrantUrl = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}/trips/${event.tripId}`;
    const team = members.map((member) => member.name);
    const lastLocationStatus = lastCheckIn?.locationStatus ?? 'unavailable';
    const trip: AlertMessageTrip = {
      id: event.tripId,
      routeName: event.routeName,
      plannedFinishAt: event.plannedFinishAt,
      team,
      lastCheckInAt: lastCheckIn?.createdAt ?? null,
      lastLocationStatus,
      viewerGrantUrl,
      leaderPhone: event.leaderPhone,
      reportText: `BeSafe 通報摘要\n路線：${event.routeName}\n隊伍：${team.join('、')}\n預計下山：${event.plannedFinishAt.toISOString()}\n最後回報：${lastCheckIn?.createdAt?.toISOString() ?? '尚無回報'}`,
    };
    const recipients = event.stage === 'due'
      ? members
      : guardianRecipients.map(({ id, name, guardianId }) => ({ id: id!, name: name ?? '留守人員', guardianId }));
    return { id: event.id, stage: event.stage, trip, recipients };
  },

  async claimDeliveries({ claim, now }) {
    const confirmed = await databaseRepository.confirmClaimedActiveEvent(claim);
    if (!confirmed) return [];
    const [{ db }, { alertDeliveries }, { sql }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'), import('drizzle-orm'),
    ]);
    return db.transaction(async (transaction) => {
      await transaction.insert(alertDeliveries).values(confirmed.recipients.map((recipient) => ({
        eventId: claim.eventId,
        recipientId: recipient.id,
        guardianId: recipient.guardianId,
      }))).onConflictDoNothing();
      const rows = await transaction.execute(sql`
        WITH due_deliveries AS (
          SELECT ${alertDeliveries.id}
          FROM ${alertDeliveries}
          WHERE ${alertDeliveries.eventId} = ${claim.eventId}
            AND ${alertDeliveries.status} = 'pending'
            AND (${alertDeliveries.nextAttemptAt} IS NULL OR ${alertDeliveries.nextAttemptAt} <= ${now})
          FOR UPDATE SKIP LOCKED
        )
        UPDATE ${alertDeliveries}
        SET status = 'claimed', claim_token = ${claim.claimToken}, claim_version = ${claim.claimVersion},
            claimed_at = ${now}, claim_expires_at = ${now} + interval '5 minutes'
        FROM due_deliveries
        WHERE ${alertDeliveries.id} = due_deliveries.id
        RETURNING ${alertDeliveries.id}, ${alertDeliveries.retryKey}, ${alertDeliveries.recipientId}, ${alertDeliveries.guardianId}
      `);
      return Array.from(rows as Iterable<{ id: string; retry_key: string; recipient_id: string; guardian_id: string | null }>).map((row) => ({
        id: row.id, retryKey: row.retry_key, recipientId: row.recipient_id, guardianId: row.guardian_id,
      }));
    });
  },

  async deliverLocked({ claim, delivery, now, send }) {
    const [{ db }, { alertDeliveries, alertEvents, trips, viewerGrants }, { and, eq, sql }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'), import('drizzle-orm'),
    ]);
    try {
      return await db.transaction(async (transaction) => {
        const [trip] = await transaction.select({ id: trips.id, status: trips.status })
          .from(trips).innerJoin(alertEvents, eq(alertEvents.tripId, trips.id))
          .where(eq(alertEvents.id, claim.eventId)).for('update');
        if (trip?.status !== 'active') {
          await transaction.update(alertDeliveries).set({ status: 'cancelled' })
            .where(eq(alertDeliveries.id, delivery.id));
          return 'skipped' as const;
        }
        const [owned] = await transaction.select({ id: alertDeliveries.id })
          .from(alertDeliveries).innerJoin(alertEvents, eq(alertEvents.id, alertDeliveries.eventId))
          .where(and(
            eq(alertDeliveries.id, delivery.id),
            eq(alertDeliveries.status, 'claimed'),
            eq(alertDeliveries.claimToken, claim.claimToken),
            eq(alertDeliveries.claimVersion, claim.claimVersion),
            eq(alertEvents.status, 'claimed'),
            eq(alertEvents.claimToken, claim.claimToken),
            eq(alertEvents.claimVersion, claim.claimVersion),
          )).limit(1);
        if (!owned) return 'skipped' as const;
        const confirmed = await databaseRepository.confirmClaimedActiveEvent(claim);
        const recipient = confirmed?.recipients.find(({ id }) => id === delivery.recipientId);
        if (!confirmed || !recipient) return 'skipped' as const;
        const messageTrip = { ...confirmed.trip };
        if (confirmed.stage === 'overdue_120' && recipient.guardianId) {
          const token = randomBytes(32).toString('base64url');
          await transaction.insert(viewerGrants).values({
            tripId: confirmed.trip.id,
            guardianId: recipient.guardianId,
            tokenHash: hashViewerGrant(token),
            expiresAt: new Date(now.getTime() + 24 * 60 * 60_000),
          });
          messageTrip.viewerGrantUrl = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}/api/trips/${confirmed.trip.id}/guardian-viewer?grant=${encodeURIComponent(token)}`;
        }
        await send({
          to: recipient.id,
          messages: [buildLineMessage(confirmed.stage, messageTrip)],
          idempotencyKey: delivery.retryKey,
        });
        await transaction.update(alertDeliveries).set({ status: 'sent', sentAt: now })
          .where(and(eq(alertDeliveries.id, delivery.id), eq(alertDeliveries.status, 'claimed')));
        const [pending] = await transaction.select({ id: alertDeliveries.id }).from(alertDeliveries)
          .where(and(eq(alertDeliveries.eventId, claim.eventId), sql`${alertDeliveries.status} <> 'sent'`)).limit(1);
        if (!pending) await transaction.update(alertEvents).set({ status: 'sent', sentAt: now })
          .where(eq(alertEvents.id, claim.eventId));
        return 'sent' as const;
      });
    } catch (error) {
      await db.update(alertDeliveries).set({
        status: 'pending', claimedAt: null, claimToken: null, claimExpiresAt: null,
        attempts: sql`attempts + 1`,
        nextAttemptAt: sql`CASE LEAST(attempts + 1, 4)
          WHEN 1 THEN ${now} + interval '1 minute'
          WHEN 2 THEN ${now} + interval '5 minutes'
          WHEN 3 THEN ${now} + interval '15 minutes'
          ELSE ${now} + interval '30 minutes'
        END`,
        lastError: error instanceof Error ? error.message.slice(0, 1000) : 'LINE delivery failed',
      }).where(and(eq(alertDeliveries.id, delivery.id), eq(alertDeliveries.status, 'claimed')));
      await db.update(alertEvents).set({
        status: 'pending', claimedAt: null, claimToken: null, claimExpiresAt: null,
      }).where(and(
        eq(alertEvents.id, claim.eventId),
        eq(alertEvents.status, 'claimed'),
        eq(alertEvents.claimToken, claim.claimToken),
        eq(alertEvents.claimVersion, claim.claimVersion),
      ));
      return 'failed' as const;
    }
  },

  async markSent({ claim, now }) {
    const [{ db }, { alertEvents }, { and, eq }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'), import('drizzle-orm'),
    ]);
    const updated = await db.update(alertEvents).set({ status: 'sent', sentAt: now })
      .where(and(
        eq(alertEvents.id, claim.eventId),
        eq(alertEvents.status, 'claimed'),
        eq(alertEvents.claimToken, claim.claimToken),
        eq(alertEvents.claimVersion, claim.claimVersion),
      )).returning({ id: alertEvents.id });
    return updated.length === 1;
  },

  async rescheduleFailure({ claim, now, error }) {
    const [{ db }, { alertEvents }, { and, eq, sql }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'), import('drizzle-orm'),
    ]);
    const updated = await db.update(alertEvents).set({
      status: 'pending',
      claimedAt: null,
      claimToken: null,
      claimExpiresAt: null,
      attempts: sql`attempts + 1`,
      nextAttemptAt: sql`CASE LEAST(attempts + 1, 4)
        WHEN 1 THEN ${now} + interval '1 minute'
        WHEN 2 THEN ${now} + interval '5 minutes'
        WHEN 3 THEN ${now} + interval '15 minutes'
        ELSE ${now} + interval '30 minutes'
      END`,
      lastError: error.slice(0, 1000),
    }).where(and(
      eq(alertEvents.id, claim.eventId),
      eq(alertEvents.status, 'claimed'),
      eq(alertEvents.claimToken, claim.claimToken),
      eq(alertEvents.claimVersion, claim.claimVersion),
    )).returning({ id: alertEvents.id });
    return updated.length === 1;
  },
};
