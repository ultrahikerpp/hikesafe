import { and, eq } from 'drizzle-orm';

import { routeVersions, tripMembers, trips, users } from '@/src/db/schema';
import { copy, bilingual } from '@/src/features/i18n/copy';
import {
  buildCheckInPrompt,
  buildHelpConfirmation,
  buildTripChooser,
  buildUsageReply,
} from '@/src/features/line/prompts';
import { parsePostback } from '@/src/features/line/postback';
import type { LineMessage } from '@/src/features/line/messages';
import { recordCheckIn, requestHelp } from '@/src/features/trips/commands';
import type { LineLocationFix } from '@/src/lib/location';

export interface ActiveLineTrip {
  id: string;
  routeName: string;
  plannedFinishAt: Date;
}

export interface LineConversationRepository {
  findUserByLineUserId(lineUserId: string): Promise<{ id: string } | undefined>;
  listActiveTripsForMember(userId: string): Promise<ActiveLineTrip[]>;
}

export interface LineConversationEvent {
  lineUserId: string;
  eventId: string;
  text?: string;
  postbackData?: string;
  location?: LineLocationFix;
  now: Date;
}

const textMessage = (text: string): LineMessage => ({ type: 'text', text });

const unavailableTrip = bilingual(
  '無法回報：此行程不在你的進行中行程內。',
  'Check-in not available: this is not one of your active trips.',
);
const retryAfterChoosing = bilingual(
  '你有多個進行中的行程，請選擇行程後重新回報。',
  'You have multiple active trips. Choose one, then retry your check-in.',
);
const ambiguousLocation = bilingual(
  '無法判斷位置屬於哪個進行中的行程，請改用行程頁面回報位置。',
  'We cannot determine which active trip this location belongs to. Use the trip page to report it.',
);
const checkInError = bilingual(
  '無法送出回報，請稍後再試。',
  'The check-in could not be sent. Try again later.',
);
const conversationError = bilingual(
  '目前無法處理 LINE 回報，請稍後再試。',
  'LINE check-ins are unavailable right now. Try again later.',
);

const safeMessage = bilingual('平安', 'Safe');
const shelterMessage = bilingual('已到山屋', 'At shelter');
const helpMessage = bilingual('需要協助', 'Need help');

const databaseRepository: LineConversationRepository = {
  async findUserByLineUserId(lineUserId) {
    const { db } = await import('@/src/db/client');
    const [user] = await db.select({ id: users.id }).from(users)
      .where(eq(users.lineUserId, lineUserId)).limit(1);
    return user;
  },
  async listActiveTripsForMember(userId) {
    const { db } = await import('@/src/db/client');
    return db.select({
      id: trips.id,
      routeName: routeVersions.routeName,
      plannedFinishAt: trips.plannedFinishAt,
    }).from(tripMembers)
      .innerJoin(users, eq(users.id, tripMembers.userId))
      .innerJoin(trips, eq(trips.id, tripMembers.tripId))
      .innerJoin(routeVersions, eq(routeVersions.id, trips.routeVersionId))
      .where(and(eq(users.id, userId), eq(trips.status, 'active')));
  },
};

const isSupported = (event: LineConversationEvent) => {
  if (event.location) return true;
  if (event.postbackData) return parsePostback(event.postbackData) !== undefined;
  const text = event.text?.trim();
  return text === '需要協助' || text === '求助' || text === '回報' || text === '說明'
    || Boolean(text?.match(/^回報\s+/));
};

const chooseAndRetry = (activeTrips: ActiveLineTrip[]) => [
  textMessage(retryAfterChoosing),
  buildTripChooser(activeTrips),
];

export const handleLineConversation = async (
  event: LineConversationEvent,
  dependencies: { repository?: LineConversationRepository } = {},
): Promise<LineMessage[]> => {
  if (!isSupported(event)) return [];

  if (event.text?.trim() === '說明') return [buildUsageReply()];

  const repository = dependencies.repository ?? databaseRepository;
  let user: { id: string } | undefined;
  let activeTrips: ActiveLineTrip[];
  try {
    user = await repository.findUserByLineUserId(event.lineUserId);
    if (!user) {
      return [textMessage(copy.authenticationError('使用 LINE 回報', 'using LINE check-ins'))];
    }
    activeTrips = await repository.listActiveTripsForMember(user.id);
  } catch {
    return [textMessage(conversationError)];
  }

  if (activeTrips.length === 0) return [textMessage(copy.noActiveTrip)];

  if (event.location) {
    if (activeTrips.length !== 1) {
      return [textMessage(ambiguousLocation), buildTripChooser(activeTrips)];
    }
    try {
      await recordCheckIn({
        tripId: activeTrips[0].id,
        userId: user.id,
        location: {
          latitude: event.location.latitude,
          longitude: event.location.longitude,
          capturedAt: event.now,
          source: 'line',
        },
        idempotencyKey: event.eventId,
        now: event.now,
      });
      return [textMessage(copy.checkInSuccess())];
    } catch {
      return [textMessage(checkInError)];
    }
  }

  const postbackData = event.postbackData;
  if (postbackData) {
    const parsed = parsePostback(postbackData);
    if (!parsed || !activeTrips.some((trip) => trip.id === parsed.tripId)) {
      return [textMessage(unavailableTrip)];
    }
    const { tripId } = parsed;
    if (parsed.kind === 'trip') return [buildCheckInPrompt({ tripId, includeLocation: false })];
    if (parsed.kind === 'help' && parsed.action === 'cancel') return [];

    if (parsed.kind === 'help') {
      try {
        await requestHelp({
          tripId,
          userId: user.id,
          message: helpMessage,
          idempotencyKey: event.eventId,
          now: event.now,
        });
        return [textMessage(copy.helpConfirmation())];
      } catch {
        return [textMessage(copy.helpError)];
      }
    }

    if (parsed.kind !== 'check-in') return [textMessage(unavailableTrip)];

    try {
      await recordCheckIn({
        tripId,
        userId: user.id,
        message: parsed.message === 'safe' ? safeMessage : shelterMessage,
        idempotencyKey: event.eventId,
        now: event.now,
      });
      return [textMessage(copy.checkInSuccess())];
    } catch {
      return [textMessage(checkInError)];
    }
  }

  const text = event.text?.trim();
  if (text === '需要協助' || text === '求助') {
    if (activeTrips.length !== 1) return chooseAndRetry(activeTrips);
    return [buildHelpConfirmation(activeTrips[0].id)];
  }
  if (text === '回報') {
    return activeTrips.length === 1
      ? [buildCheckInPrompt({ tripId: activeTrips[0].id, includeLocation: true })]
      : [buildTripChooser(activeTrips)];
  }

  const message = text?.match(/^回報\s+([\s\S]+)$/)?.[1].trim();
  if (!message) return [];
  if (activeTrips.length !== 1) return chooseAndRetry(activeTrips);
  try {
    await recordCheckIn({
      tripId: activeTrips[0].id,
      userId: user.id,
      message,
      idempotencyKey: event.eventId,
      now: event.now,
    });
    return [textMessage(copy.checkInSuccess())];
  } catch {
    return [textMessage(checkInError)];
  }
};
