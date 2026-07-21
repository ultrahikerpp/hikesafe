import { beforeEach, describe, expect, it, vi } from 'vitest';

import { copy, bilingual } from '@/src/features/i18n/copy';
import {
  handleLineConversation,
  type ActiveLineTrip,
  type LineConversationRepository,
} from '@/src/features/line/conversation';
import { extendTrip, finishTrip, recordCheckIn, requestHelp, startTrip } from '@/src/features/trips/commands';

vi.mock('@/src/features/trips/commands', () => ({
  recordCheckIn: vi.fn(),
  requestHelp: vi.fn(),
  extendTrip: vi.fn(),
  finishTrip: vi.fn(),
  startTrip: vi.fn(),
}));

const now = new Date('2026-07-18T02:00:00.000Z');
const trips: ActiveLineTrip[] = [
  { id: 'trip-1', routeName: '玉山主峰線', plannedFinishAt: new Date('2026-07-18T08:00:00.000Z') },
  { id: 'trip-2', routeName: '雪山東峰線', plannedFinishAt: new Date('2026-07-18T09:00:00.000Z') },
];

const makeRepository = (
  activeTrips: ActiveLineTrip[] = trips.slice(0, 1),
  user: { id: string } | undefined = { id: 'user-1' },
  draftTrips: ActiveLineTrip[] = [],
): LineConversationRepository => ({
  findUserByLineUserId: vi.fn(async (lineUserId) => lineUserId === 'line-user-1' ? user : undefined),
  listActiveTripsForMember: vi.fn(async () => activeTrips),
  listDraftTripsForMember: vi.fn(async () => draftTrips),
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
    vi.mocked(finishTrip).mockReset();
    vi.mocked(recordCheckIn).mockReset();
    vi.mocked(requestHelp).mockReset();
    vi.mocked(startTrip).mockReset();
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

  it('asks for confirmation before finishing one active trip', async () => {
    for (const text of ['平安下山', '結束行程']) {
      const messages = await handleLineConversation(event({ text }), { repository: makeRepository() });

      expect(messages).toHaveLength(1);
      expect(messages[0].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
        .toEqual(['hikesafe:finish:trip-1:confirm', 'hikesafe:finish:trip-1:cancel']);
    }
  });

  it('offers a finish-intent chooser for multiple active trips', async () => {
    const messages = await handleLineConversation(event({ text: '平安下山' }), { repository: makeRepository(trips) });

    expect(messages[1].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
      .toEqual(['hikesafe:trip:trip-1:finish', 'hikesafe:trip:trip-2:finish']);
  });

  it('finishes the trip on confirmation without a location', async () => {
    vi.mocked(finishTrip).mockResolvedValue({ tripId: 'trip-1' } as never);

    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:finish:trip-1:confirm' }),
      { repository: makeRepository() },
    );

    expect(finishTrip).toHaveBeenCalledWith(expect.objectContaining({
      tripId: 'trip-1', userId: 'user-1', idempotencyKey: 'line-event-1', now,
    }));
    expect(vi.mocked(finishTrip).mock.calls[0][0]).not.toHaveProperty('location');
    expect(messages).toEqual([{ type: 'text', text: copy.tripFinished }]);
  });

  it('stays silent when the user cancels finishing', async () => {
    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:finish:trip-1:cancel' }),
      { repository: makeRepository() },
    );

    expect(messages).toEqual([]);
    expect(finishTrip).not.toHaveBeenCalled();
  });

  it('reports a finish failure with the shared bilingual error copy', async () => {
    vi.mocked(finishTrip).mockRejectedValue(new Error('Trip is not active'));

    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:finish:trip-1:confirm' }),
      { repository: makeRepository() },
    );

    expect(messages).toEqual([{ type: 'text', text: copy.tripFinishError }]);
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

  const lineLocation = { latitude: 23.47, longitude: 120.95, capturedAt: now, source: 'line' as const };
  const draft: ActiveLineTrip = { id: 'draft-1', routeName: '合歡北峰線', plannedFinishAt: new Date('2026-07-18T10:00:00.000Z') };

  it('asks for a location when the start postback is confirmed', async () => {
    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:start:draft-1:confirm' }),
      { repository: makeRepository([], { id: 'user-1' }, [draft]) },
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].quickReply?.items).toEqual([
      { type: 'action', action: { type: 'location', label: bilingual('📍 傳送位置', 'Send location') } },
    ]);
  });

  it('rejects a start postback for a trip that is not one of the user drafts', async () => {
    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:start:other-1:confirm' }),
      { repository: makeRepository([], { id: 'user-1' }, [draft]) },
    );

    expect(messages[0].text).toContain('此行程不在你的進行中行程內');
    expect(startTrip).not.toHaveBeenCalled();
  });

  it('stays silent when the user cancels starting', async () => {
    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:start:draft-1:cancel' }),
      { repository: makeRepository([], { id: 'user-1' }, [draft]) },
    );

    expect(messages).toEqual([]);
  });

  it('starts the only draft trip when a location arrives and no trip is active', async () => {
    vi.mocked(startTrip).mockResolvedValue({ tripId: 'draft-1', status: 'active', startedAt: now } as never);

    const messages = await handleLineConversation(
      event({ location: lineLocation }),
      { repository: makeRepository([], { id: 'user-1' }, [draft]) },
    );

    expect(startTrip).toHaveBeenCalledWith(expect.objectContaining({
      tripId: 'draft-1', userId: 'user-1', location: lineLocation, idempotencyKey: 'line-event-1', now,
    }));
    expect(messages).toHaveLength(1);
    expect(messages[0].text).toContain('行程已開始');
    expect(recordCheckIn).not.toHaveBeenCalled();
  });

  it('still checks in when an active trip exists alongside a draft', async () => {
    vi.mocked(recordCheckIn).mockResolvedValue({ id: 'check-in-1' } as never);

    await handleLineConversation(
      event({ location: lineLocation }),
      { repository: makeRepository(trips.slice(0, 1), { id: 'user-1' }, [draft]) },
    );

    expect(recordCheckIn).toHaveBeenCalled();
    expect(startTrip).not.toHaveBeenCalled();
  });

  it('points at the trip page when several drafts could be started', async () => {
    const messages = await handleLineConversation(
      event({ location: lineLocation }),
      { repository: makeRepository([], { id: 'user-1' }, [draft, { ...draft, id: 'draft-2' }]) },
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].text).toContain('多筆待開始的行程');
    expect(startTrip).not.toHaveBeenCalled();
  });

  it('reports no active trip when a location arrives with nothing to act on', async () => {
    const messages = await handleLineConversation(
      event({ location: lineLocation }),
      { repository: makeRepository([], { id: 'user-1' }, []) },
    );

    expect(messages).toEqual([{ type: 'text', text: copy.noActiveTrip }]);
  });

  it('guides the user to assign a deputy when the domain rejects the start', async () => {
    vi.mocked(startTrip).mockRejectedValue(new Error('Multi-person trips require a deputy before start'));

    const messages = await handleLineConversation(
      event({ location: lineLocation }),
      { repository: makeRepository([], { id: 'user-1' }, [draft]) },
    );

    expect(messages[0].text).toContain('副領隊');
  });

  it('asks for a fresh location when the location is unusable', async () => {
    vi.mocked(startTrip).mockRejectedValue(new Error('Location is stale'));

    const messages = await handleLineConversation(
      event({ location: lineLocation }),
      { repository: makeRepository([], { id: 'user-1' }, [draft]) },
    );

    expect(messages[0].text).toContain('重新傳送目前位置');
  });
});
