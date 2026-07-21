import { beforeEach, describe, expect, it, vi } from 'vitest';

import { copy, bilingual } from '@/src/features/i18n/copy';
import {
  handleLineConversation,
  type ActiveLineTrip,
  type LineConversationRepository,
} from '@/src/features/line/conversation';
import { extendTrip, recordCheckIn, requestHelp } from '@/src/features/trips/commands';

vi.mock('@/src/features/trips/commands', () => ({
  extendTrip: vi.fn(),
  recordCheckIn: vi.fn(),
  requestHelp: vi.fn(),
}));

const now = new Date('2026-07-18T02:00:00.000Z');
const trips: ActiveLineTrip[] = [
  { id: 'trip-1', routeName: '玉山主峰線', plannedFinishAt: new Date('2026-07-18T08:00:00.000Z') },
  { id: 'trip-2', routeName: '雪山東峰線', plannedFinishAt: new Date('2026-07-18T09:00:00.000Z') },
];

const makeRepository = (
  activeTrips: ActiveLineTrip[] = trips.slice(0, 1),
  user: { id: string } | undefined = { id: 'user-1' },
): LineConversationRepository => ({
  findUserByLineUserId: vi.fn(async (lineUserId) => lineUserId === 'line-user-1' ? user : undefined),
  listActiveTripsForMember: vi.fn(async () => activeTrips),
});

const event = (overrides: Partial<Parameters<typeof handleLineConversation>[0]> = {}) => ({
  lineUserId: 'line-user-1',
  eventId: 'line-event-1',
  now,
  ...overrides,
});

describe('handleLineConversation', () => {
  beforeEach(() => {
    vi.mocked(extendTrip).mockReset();
    vi.mocked(recordCheckIn).mockReset();
    vi.mocked(requestHelp).mockReset();
  });

  it('returns a location-enabled check-in prompt for one active trip', async () => {
    const messages = await handleLineConversation(event({ text: '回報' }), { repository: makeRepository() });

    expect(messages).toEqual([expect.objectContaining({
      type: 'text',
      text: expect.stringMatching(/\n/),
      quickReply: { items: expect.arrayContaining([
        { type: 'action', action: { type: 'location', label: bilingual('📍 傳送位置', 'Send location') } },
        { type: 'action', action: { type: 'postback', label: bilingual('✅ 平安', 'Safe'), data: 'hikesafe:check-in:trip-1:safe' } },
      ]) },
    })]);
  });

  it('returns a chooser without location when multiple active trips are ambiguous', async () => {
    const messages = await handleLineConversation(event({ text: '回報' }), { repository: makeRepository(trips) });

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      type: 'text',
      quickReply: { items: [
        { type: 'action', action: { type: 'postback', data: 'hikesafe:trip:trip-1:select' } },
        { type: 'action', action: { type: 'postback', data: 'hikesafe:trip:trip-2:select' } },
      ] },
    });
    expect(messages[0].quickReply?.items.some(({ action }) => action.type === 'location')).toBe(false);
  });

  it('records a safe postback idempotently with canonical bilingual copy and no help notification', async () => {
    const messages = await handleLineConversation(event({ postbackData: 'hikesafe:check-in:trip-1:safe' }), {
      repository: makeRepository(),
    });

    expect(recordCheckIn).toHaveBeenCalledWith({
      tripId: 'trip-1',
      userId: 'user-1',
      message: bilingual('平安', 'Safe'),
      idempotencyKey: 'line-event-1',
      now,
    });
    expect(requestHelp).not.toHaveBeenCalled();
    expect(messages).toEqual([{ type: 'text', text: copy.checkInSuccess() }]);
  });

  it('records shelter and text check-ins only for one active trip', async () => {
    await handleLineConversation(event({ postbackData: 'hikesafe:check-in:trip-1:shelter' }), {
      repository: makeRepository(),
    });
    await handleLineConversation(event({ eventId: 'line-event-2', text: '回報 稜線風大但平安' }), {
      repository: makeRepository(),
    });

    expect(recordCheckIn).toHaveBeenNthCalledWith(1, {
      tripId: 'trip-1',
      userId: 'user-1',
      message: bilingual('已到山屋', 'At shelter'),
      idempotencyKey: 'line-event-1',
      now,
    });
    expect(recordCheckIn).toHaveBeenNthCalledWith(2, {
      tripId: 'trip-1',
      userId: 'user-1',
      message: '稜線風大但平安',
      idempotencyKey: 'line-event-2',
      now,
    });
  });

  it('asks the user to choose and retry ambiguous text check-ins without writing', async () => {
    const messages = await handleLineConversation(event({ text: '回報 稜線風大但平安' }), {
      repository: makeRepository(trips),
    });

    expect(recordCheckIn).not.toHaveBeenCalled();
    expect(messages.map((message) => message.text).join('\n')).toMatch(/重新回報.*\n.*retry/s);
    expect(messages.at(-1)?.quickReply?.items).toHaveLength(2);
  });

  it('records a LINE location at event time without inventing accuracy', async () => {
    await handleLineConversation(event({
      location: {
        latitude: 23.47,
        longitude: 120.95,
        capturedAt: new Date('2026-07-18T01:55:00.000Z'),
        source: 'line',
      },
    }), { repository: makeRepository() });

    expect(recordCheckIn).toHaveBeenCalledWith({
      tripId: 'trip-1',
      userId: 'user-1',
      location: {
        latitude: 23.47,
        longitude: 120.95,
        capturedAt: now,
        source: 'line',
      },
      idempotencyKey: 'line-event-1',
      now,
    });
    const location = vi.mocked(recordCheckIn).mock.calls[0][0].location;
    expect(location).not.toHaveProperty('accuracyMeters');
  });

  it('rejects an ambiguous LINE location without guessing a trip', async () => {
    const messages = await handleLineConversation(event({
      location: { latitude: 23.47, longitude: 120.95, capturedAt: now, source: 'line' },
    }), { repository: makeRepository(trips) });

    expect(recordCheckIn).not.toHaveBeenCalled();
    expect(messages.map((message) => message.text).join('\n')).toMatch(/無法判斷.*\n.*cannot determine/s);
  });

  it('requires confirmation before requesting help and lets cancellation stay silent', async () => {
    const confirmation = await handleLineConversation(event({ text: '需要協助' }), { repository: makeRepository() });
    const cancellation = await handleLineConversation(event({ postbackData: 'hikesafe:help:trip-1:cancel' }), {
      repository: makeRepository(),
    });

    expect(confirmation[0]).toMatchObject({
      type: 'text',
      quickReply: { items: [
        { type: 'action', action: { type: 'postback', data: 'hikesafe:help:trip-1:confirm' } },
        { type: 'action', action: { type: 'postback', data: 'hikesafe:help:trip-1:cancel' } },
      ] },
    });
    expect(cancellation).toEqual([]);
    expect(requestHelp).not.toHaveBeenCalled();
  });

  it('requests help only after an authorized confirmation', async () => {
    const messages = await handleLineConversation(event({ postbackData: 'hikesafe:help:trip-1:confirm' }), {
      repository: makeRepository(),
    });

    expect(requestHelp).toHaveBeenCalledWith({
      tripId: 'trip-1',
      userId: 'user-1',
      message: bilingual('需要協助', 'Need help'),
      idempotencyKey: 'line-event-1',
      now,
    });
    expect(messages).toEqual([{ type: 'text', text: copy.helpConfirmation() }]);
  });

  it('returns a bilingual no-active-trip response without writing', async () => {
    const messages = await handleLineConversation(event({ text: '回報' }), { repository: makeRepository([]) });

    expect(messages).toEqual([{ type: 'text', text: copy.noActiveTrip }]);
    expect(recordCheckIn).not.toHaveBeenCalled();
    expect(requestHelp).not.toHaveBeenCalled();
  });

  it('revalidates every postback trip ID against the sender active-trip list', async () => {
    const messages = await handleLineConversation(event({ postbackData: 'hikesafe:check-in:trip-999:safe' }), {
      repository: makeRepository(),
    });

    expect(recordCheckIn).not.toHaveBeenCalled();
    expect(requestHelp).not.toHaveBeenCalled();
    expect(messages.map((message) => message.text).join('\n')).toMatch(/無法回報.*\n.*not available/s);
  });

  it('maps command failures to bilingual responses without exposing database details', async () => {
    vi.mocked(recordCheckIn).mockRejectedValueOnce(new Error('postgres password=secret'));

    const messages = await handleLineConversation(event({ postbackData: 'hikesafe:check-in:trip-1:safe' }), {
      repository: makeRepository(),
    });

    const output = messages.map((message) => message.text).join('\n');
    expect(output).toMatch(/無法送出回報.*\n.*could not be sent/s);
    expect(output).not.toContain('postgres');
    expect(output).not.toContain('secret');
  });

  it('answers the usage command without touching the repository', async () => {
    const repository = makeRepository();
    const messages = await handleLineConversation(event({ text: '說明' }), { repository });

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe('text');
    expect(messages[0].text).toContain('HikeSafe 使用說明');
    expect(repository.findUserByLineUserId).not.toHaveBeenCalled();
  });

  it('answers the usage command for an unregistered LINE user', async () => {
    const messages = await handleLineConversation(
      event({ text: '說明', lineUserId: 'line-user-unknown' }),
      { repository: makeRepository(trips.slice(0, 1), undefined) },
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].text).toContain('HikeSafe 使用說明');
  });

  it('offers a help chooser carrying the help intent for multiple active trips', async () => {
    const messages = await handleLineConversation(event({ text: '需要協助' }), { repository: makeRepository(trips) });

    expect(messages).toHaveLength(2);
    expect(messages[1].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
      .toEqual(['hikesafe:trip:trip-1:help', 'hikesafe:trip:trip-2:help']);
  });

  it('returns a help confirmation after choosing a trip with the help intent', async () => {
    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:trip:trip-1:help' }),
      { repository: makeRepository(trips) },
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
      .toEqual(['hikesafe:help:trip-1:confirm', 'hikesafe:help:trip-1:cancel']);
  });

  it('still returns a check-in prompt for the select intent', async () => {
    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:trip:trip-1:select' }),
      { repository: makeRepository(trips) },
    );

    expect(messages[0].quickReply?.items.some(({ action }) =>
      action.type === 'postback' && action.data === 'hikesafe:check-in:trip-1:safe')).toBe(true);
  });

  it('offers the extension options for one active trip', async () => {
    const messages = await handleLineConversation(event({ text: '延長' }), { repository: makeRepository() });

    expect(messages).toHaveLength(1);
    expect(messages[0].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
      .toEqual(['hikesafe:extend:trip-1:30', 'hikesafe:extend:trip-1:60', 'hikesafe:extend:trip-1:120']);
  });

  it('offers an extend-intent chooser for multiple active trips', async () => {
    const messages = await handleLineConversation(event({ text: '延長' }), { repository: makeRepository(trips) });

    expect(messages[1].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
      .toEqual(['hikesafe:trip:trip-1:extend', 'hikesafe:trip:trip-2:extend']);
  });

  it('extends from the planned finish time, not from now', async () => {
    vi.mocked(extendTrip).mockResolvedValue({
      tripId: 'trip-1', plannedFinishAt: new Date('2026-07-18T09:00:00.000Z'),
    } as never);

    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:extend:trip-1:60' }),
      { repository: makeRepository() },
    );

    expect(extendTrip).toHaveBeenCalledWith(expect.objectContaining({
      tripId: 'trip-1',
      userId: 'user-1',
      plannedFinishAt: new Date('2026-07-18T09:00:00.000Z'),
      idempotencyKey: 'line-event-1',
      now,
    }));
    expect(messages).toEqual([{ type: 'text', text: copy.finishTimeExtended }]);
  });

  it('reports an extension failure with the shared bilingual error copy', async () => {
    vi.mocked(extendTrip).mockRejectedValue(new Error('Planned finish must extend the active trip'));

    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:extend:trip-1:30' }),
      { repository: makeRepository() },
    );

    expect(messages).toEqual([{ type: 'text', text: copy.finishTimeExtensionError }]);
  });

  it('returns the matching prompt for the extend and finish intents', async () => {
    const extend = await handleLineConversation(
      event({ postbackData: 'hikesafe:trip:trip-1:extend' }),
      { repository: makeRepository(trips) },
    );
    expect(extend[0].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
      .toEqual(['hikesafe:extend:trip-1:30', 'hikesafe:extend:trip-1:60', 'hikesafe:extend:trip-1:120']);

    const finish = await handleLineConversation(
      event({ postbackData: 'hikesafe:trip:trip-1:finish' }),
      { repository: makeRepository(trips) },
    );
    expect(finish[0].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
      .toEqual(['hikesafe:finish:trip-1:confirm', 'hikesafe:finish:trip-1:cancel']);
  });
});
