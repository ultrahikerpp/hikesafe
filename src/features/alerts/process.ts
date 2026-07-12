import type { AlertClaim, AlertDeliveryRepository } from '@/src/features/alerts/delivery-contract';
import type { AlertStage } from '@/src/features/alerts/domain';
import { buildLineMessage, type AlertMessageTrip, type LineMessage } from '@/src/features/line/messages';

export interface ConfirmedAlertEvent {
  id: string;
  stage: AlertStage;
  trip: AlertMessageTrip;
  recipients: Array<{ id: string; name: string }>;
}

export interface AlertProcessRepository extends AlertDeliveryRepository {
  confirmClaimedActiveEvent(claim: AlertClaim): Promise<ConfirmedAlertEvent | undefined>;
  markSent(input: { claim: AlertClaim; now: Date }): Promise<boolean>;
  rescheduleFailure(input: { claim: AlertClaim; now: Date; error: string }): Promise<boolean>;
}

export interface AlertDelivery {
  to: string;
  messages: LineMessage[];
  idempotencyKey: string;
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

export const processDueAlerts = async ({
  now,
  repository = databaseRepository,
  send = noOpSend,
}: ProcessDueAlertsInput): Promise<AlertProcessResult> => {
  const claims = await repository.claimDueActiveEvents({ now, limit: 100 });
  const result: AlertProcessResult = { claimed: claims.length, sent: 0, failed: 0, skipped: 0 };

  for (const claim of claims) {
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
    const guardianRecipients = await db.select({ id: lineBindings.sourceId, name: lineBindings.displayName })
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
      reportText: `BeSafe 通報摘要\n路線：${event.routeName}\n隊伍：${team.join('、')}\n預計下山：${event.plannedFinishAt.toISOString()}\n最後回報：${lastCheckIn?.createdAt?.toISOString() ?? '尚無回報'}`,
    };
    const recipients = event.stage === 'due'
      ? members
      : guardianRecipients.map(({ id, name }) => ({ id: id!, name: name ?? '留守人員' }));
    return { id: event.id, stage: event.stage, trip, recipients };
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
