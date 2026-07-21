import { and, eq } from 'drizzle-orm';

import { routeVersions, tripMembers, trips, users } from '@/src/db/schema';
import { copy, bilingual } from '@/src/features/i18n/copy';
import {
  buildCheckInPrompt,
  buildExtendPrompt,
  buildFinishConfirmation,
  buildHelpConfirmation,
  buildStartLocationPrompt,
  buildTripChooser,
  buildUsageReply,
  type TripChooserIntent,
} from '@/src/features/line/prompts';
import { parsePostback } from '@/src/features/line/postback';
import type { LineMessage } from '@/src/features/line/messages';
import { extendTrip, finishTrip, recordCheckIn, requestHelp, startTrip } from '@/src/features/trips/commands';
import type { LineLocationFix } from '@/src/lib/location';

export interface ActiveLineTrip {
  id: string;
  routeName: string;
  plannedFinishAt: Date;
}

export interface LineConversationRepository {
  findUserByLineUserId(lineUserId: string): Promise<{ id: string } | undefined>;
  listActiveTripsForMember(userId: string): Promise<ActiveLineTrip[]>;
  listDraftTripsForMember(userId: string): Promise<ActiveLineTrip[]>;
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
const tripStarted = bilingual('行程已開始，祝一路平安。', 'The trip has started. Stay safe.');
const startError = bilingual('無法開始行程，請稍後再試。', 'The trip could not be started. Try again later.');
const deputyRequired = bilingual(
  '多人行程需要先指派副領隊才能開始，請開啟行程頁指派。',
  'A multi-person trip needs a deputy before it can start. Open the trip page to assign one.',
);
const locationUnusable = bilingual(
  '無法使用這個位置，請重新傳送目前位置。',
  'That location cannot be used. Send your current location again.',
);
const multipleDrafts = bilingual(
  '你有多筆待開始的行程，請開啟行程頁選擇要開始哪一個。',
  'You have several trips waiting to start. Open the trip page to choose one.',
);

const safeMessage = bilingual('平安', 'Safe');
const shelterMessage = bilingual('已到山屋', 'At shelter');
const helpMessage = bilingual('需要協助', 'Need help');

const tripsForMemberByStatus = async (userId: string, status: 'active' | 'draft') => {
  const { db } = await import('@/src/db/client');
  return db.select({
    id: trips.id,
    routeName: routeVersions.routeName,
    plannedFinishAt: trips.plannedFinishAt,
  }).from(tripMembers)
    .innerJoin(users, eq(users.id, tripMembers.userId))
    .innerJoin(trips, eq(trips.id, tripMembers.tripId))
    .innerJoin(routeVersions, eq(routeVersions.id, trips.routeVersionId))
    .where(and(eq(users.id, userId), eq(trips.status, status)));
};

const databaseRepository: LineConversationRepository = {
  async findUserByLineUserId(lineUserId) {
    const { db } = await import('@/src/db/client');
    const [user] = await db.select({ id: users.id }).from(users)
      .where(eq(users.lineUserId, lineUserId)).limit(1);
    return user;
  },
  listActiveTripsForMember: (userId) => tripsForMemberByStatus(userId, 'active'),
  listDraftTripsForMember: (userId) => tripsForMemberByStatus(userId, 'draft'),
};

const isSupported = (event: LineConversationEvent) => {
  if (event.location) return true;
  if (event.postbackData) return parsePostback(event.postbackData) !== undefined;
  const text = event.text?.trim();
  return text === '需要協助' || text === '求助' || text === '回報' || text === '說明' || text === '延長'
    || text === '平安下山' || text === '結束行程'
    || Boolean(text?.match(/^回報\s+/));
};

const chooseAndRetry = (activeTrips: ActiveLineTrip[], intent: TripChooserIntent) => [
  textMessage(retryAfterChoosing),
  buildTripChooser(activeTrips, intent),
];

const startDraftTrip = async (
  tripId: string,
  userId: string,
  event: LineConversationEvent & { location: LineLocationFix },
): Promise<LineMessage[]> => {
  try {
    await startTrip({
      tripId,
      userId,
      location: event.location,
      idempotencyKey: event.eventId,
      now: event.now,
    });
    return [textMessage(tripStarted)];
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'Multi-person trips require a deputy before start') return [textMessage(deputyRequired)];
    if (message.startsWith('Location')) return [textMessage(locationUnusable)];
    return [textMessage(startError)];
  }
};

export const handleLineConversation = async (
  event: LineConversationEvent,
  dependencies: { repository?: LineConversationRepository } = {},
): Promise<LineMessage[]> => {
  if (!isSupported(event)) return [];

  if (event.text?.trim() === '說明') return [buildUsageReply()];

  const repository = dependencies.repository ?? databaseRepository;
  let user: { id: string } | undefined;
  let activeTrips: ActiveLineTrip[];
  let draftTrips: ActiveLineTrip[];
  try {
    user = await repository.findUserByLineUserId(event.lineUserId);
    if (!user) {
      return [textMessage(copy.authenticationError('使用 LINE 回報', 'using LINE check-ins'))];
    }
    [activeTrips, draftTrips] = await Promise.all([
      repository.listActiveTripsForMember(user.id),
      repository.listDraftTripsForMember(user.id),
    ]);
  } catch {
    return [textMessage(conversationError)];
  }

  if (event.location) {
    if (activeTrips.length > 1) {
      return [textMessage(ambiguousLocation), buildTripChooser(activeTrips, 'select')];
    }
    if (activeTrips.length === 1) {
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
    if (draftTrips.length > 1) return [textMessage(multipleDrafts)];
    if (draftTrips.length === 0) return [textMessage(copy.noActiveTrip)];
    return startDraftTrip(draftTrips[0].id, user.id, event as LineConversationEvent & { location: LineLocationFix });
  }

  const postbackData = event.postbackData;
  if (postbackData) {
    const parsed = parsePostback(postbackData);
    if (!parsed) return [textMessage(unavailableTrip)];
    const { tripId } = parsed;

    if (parsed.kind === 'start') {
      if (!draftTrips.some((trip) => trip.id === tripId)) return [textMessage(unavailableTrip)];
      if (parsed.action === 'cancel') return [];
      return [buildStartLocationPrompt()];
    }

    if (!activeTrips.some((trip) => trip.id === tripId)) return [textMessage(unavailableTrip)];

    if (parsed.kind === 'trip') {
      if (parsed.intent === 'help') return [buildHelpConfirmation(tripId)];
      if (parsed.intent === 'extend') return [buildExtendPrompt(tripId)];
      if (parsed.intent === 'finish') return [buildFinishConfirmation(tripId)];
      return [buildCheckInPrompt({ tripId, includeLocation: false })];
    }
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

    if (parsed.kind === 'extend') {
      const trip = activeTrips.find((item) => item.id === tripId);
      if (!trip) return [textMessage(unavailableTrip)];
      try {
        await extendTrip({
          tripId,
          userId: user.id,
          plannedFinishAt: new Date(trip.plannedFinishAt.getTime() + parsed.minutes * 60_000),
          idempotencyKey: event.eventId,
          now: event.now,
        });
        return [textMessage(copy.finishTimeExtended)];
      } catch {
        return [textMessage(copy.finishTimeExtensionError)];
      }
    }

    if (parsed.kind === 'finish') {
      if (parsed.action === 'cancel') return [];
      try {
        await finishTrip({
          tripId,
          userId: user.id,
          idempotencyKey: event.eventId,
          now: event.now,
        });
        return [textMessage(copy.tripFinished)];
      } catch {
        return [textMessage(copy.tripFinishError)];
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
    if (activeTrips.length === 0) return [textMessage(copy.noActiveTrip)];
    if (activeTrips.length !== 1) return chooseAndRetry(activeTrips, 'help');
    return [buildHelpConfirmation(activeTrips[0].id)];
  }
  if (text === '延長') {
    if (activeTrips.length === 0) return [textMessage(copy.noActiveTrip)];
    if (activeTrips.length !== 1) return chooseAndRetry(activeTrips, 'extend');
    return [buildExtendPrompt(activeTrips[0].id)];
  }
  if (text === '平安下山' || text === '結束行程') {
    if (activeTrips.length === 0) return [textMessage(copy.noActiveTrip)];
    if (activeTrips.length !== 1) return chooseAndRetry(activeTrips, 'finish');
    return [buildFinishConfirmation(activeTrips[0].id)];
  }
  if (text === '回報') {
    if (activeTrips.length === 0) return [textMessage(copy.noActiveTrip)];
    return activeTrips.length === 1
      ? [buildCheckInPrompt({ tripId: activeTrips[0].id, includeLocation: true })]
      : [buildTripChooser(activeTrips, 'select')];
  }

  const message = text?.match(/^回報\s+([\s\S]+)$/)?.[1].trim();
  if (!message) return [];
  if (activeTrips.length === 0) return [textMessage(copy.noActiveTrip)];
  if (activeTrips.length !== 1) return chooseAndRetry(activeTrips, 'select');
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
