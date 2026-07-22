import { eq } from 'drizzle-orm';

import { getEnv } from '@/src/env';
import { bilingual } from '@/src/features/i18n/copy';
import { formatTime, type LineMessage } from '@/src/features/line/messages';
import { pushLineMessage } from '@/src/integrations/line/client';

export interface TripSummary {
  tripId: string;
  routeName: string;
  plannedFinishAt: Date;
  team: string[];
  guardianCount: number;
  liffId: string;
}

interface TripSummaryLookup {
  lineUserId: string;
  routeName: string;
  plannedFinishAt: Date;
  team: string[];
  guardianCount: number;
}

export interface TripSummaryRepository {
  findTripSummary(input: { tripId: string; ownerUserId: string }): Promise<TripSummaryLookup | undefined>;
}

const title = bilingual('行程已建立', 'Trip created');
const startLabel = bilingual('開始行程', 'Start trip');
const openLabel = bilingual('開啟行程頁', 'Open trip page');
const startHint = bilingual(
  '點「開始行程」後傳送目前位置即可啟程。',
  'Tap "Start trip", then send your current location to begin.',
);

export const buildTripSummaryCard = (summary: TripSummary): LineMessage => ({
  type: 'flex',
  altText: title,
  contents: {
    type: 'bubble',
    styles: { header: { backgroundColor: '#06C755' } },
    header: {
      type: 'box', layout: 'vertical',
      contents: [{ type: 'text', text: title, color: '#FFFFFF', weight: 'bold' }],
    },
    body: {
      type: 'box', layout: 'vertical', spacing: 'sm', contents: [
        { type: 'text', text: summary.routeName, weight: 'bold', wrap: true },
        { type: 'text', text: bilingual(`預計下山：${formatTime(summary.plannedFinishAt)}`, `Planned finish: ${formatTime(summary.plannedFinishAt)}`), wrap: true },
        { type: 'text', text: bilingual(`隊伍：${summary.team.join('、') || '未提供'}`, `Team: ${summary.team.join(', ') || 'Not provided'}`), wrap: true },
        { type: 'text', text: bilingual(`留守人：${summary.guardianCount} 位`, `Guardians: ${summary.guardianCount}`), wrap: true },
        { type: 'text', text: startHint, wrap: true, size: 'sm' },
      ],
    },
    footer: {
      type: 'box', layout: 'vertical', spacing: 'sm', contents: [
        { type: 'button', style: 'primary', action: { type: 'postback', label: startLabel, data: `hikesafe:start:${summary.tripId}:confirm` } },
        { type: 'button', style: 'link', action: { type: 'uri', label: openLabel, uri: `https://liff.line.me/${summary.liffId}/trips/${summary.tripId}` } },
      ],
    },
  },
});

const databaseRepository: TripSummaryRepository = {
  async findTripSummary({ tripId, ownerUserId }) {
    const { db } = await import('@/src/db/client');
    const { guardians, routeVersions, tripMembers, trips, users } = await import('@/src/db/schema');

    const [owner] = await db.select({ lineUserId: users.lineUserId }).from(users)
      .where(eq(users.id, ownerUserId)).limit(1);
    if (!owner?.lineUserId) return undefined;

    const [trip] = await db.select({
      routeName: routeVersions.routeName,
      plannedFinishAt: trips.plannedFinishAt,
    }).from(trips)
      .innerJoin(routeVersions, eq(routeVersions.id, trips.routeVersionId))
      .where(eq(trips.id, tripId)).limit(1);
    if (!trip) return undefined;

    const members = await db.select({ name: users.displayName }).from(tripMembers)
      .innerJoin(users, eq(users.id, tripMembers.userId))
      .where(eq(tripMembers.tripId, tripId));
    const bound = await db.select({ id: guardians.id }).from(guardians)
      .where(eq(guardians.tripId, tripId));

    return {
      lineUserId: owner.lineUserId,
      routeName: trip.routeName,
      plannedFinishAt: trip.plannedFinishAt,
      team: members.map(({ name }) => name).filter(Boolean),
      guardianCount: bound.length,
    };
  },
};

export const pushTripSummary = async (
  input: { tripId: string; ownerUserId: string },
  dependencies: {
    repository?: TripSummaryRepository;
    push?: typeof pushLineMessage;
    logger?: Pick<Console, 'error'>;
  } = {},
): Promise<void> => {
  try {
    const summary = await (dependencies.repository ?? databaseRepository).findTripSummary(input);
    if (!summary) return;
    await (dependencies.push ?? pushLineMessage)({
      to: summary.lineUserId,
      messages: [buildTripSummaryCard({
        tripId: input.tripId,
        routeName: summary.routeName,
        plannedFinishAt: summary.plannedFinishAt,
        team: summary.team,
        guardianCount: summary.guardianCount,
        liffId: getEnv().NEXT_PUBLIC_LIFF_ID,
      })],
      idempotencyKey: input.tripId,
    });
  } catch (error) {
    (dependencies.logger ?? console).error('Trip summary push failed', { tripId: input.tripId, error });
  }
};
