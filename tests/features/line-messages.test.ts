import { describe, expect, it } from 'vitest';

import { buildCheckInPrompt, buildHelpConfirmation, buildLineMessage, buildTripChooser } from '@/src/features/line/messages';

const trip = {
  id: 'trip-1',
  routeName: '玉山主峰線',
  plannedFinishAt: new Date('2026-07-12T05:00:00.000Z'),
  team: ['阿山', '小玉'],
  lastCheckInAt: new Date('2026-07-12T04:20:00.000Z'),
  lastLocationStatus: 'available' as const,
  lastLocationAccuracyMeters: 12,
  lastLocationSource: 'gps' as const,
  viewerGrantUrl: 'https://besafe.example/trips/trip-1/view?token=viewer-token',
  reportText: '119 通報摘要',
};

describe('buildLineMessage', () => {
  it('builds a bilingual check-in prompt with concise typed Quick Reply actions', () => {
    const prompt = buildCheckInPrompt({ tripId: 'trip-1', includeLocation: true });

    expect(prompt).toMatchObject({
      type: 'text',
      text: expect.stringMatching(/\n/),
      quickReply: {
        items: expect.arrayContaining([
          { type: 'action', action: { type: 'location', label: '📍 傳送位置\nSend location' } },
          { type: 'action', action: { type: 'postback', label: '✅ 平安\nSafe', data: 'hikesafe:check-in:trip-1:safe' } },
          { type: 'action', action: { type: 'postback', label: '🏠 已到山屋\nAt shelter', data: 'hikesafe:check-in:trip-1:shelter' } },
        ]),
      },
    });
    expect(prompt.quickReply?.items.every(({ action }) => Array.from(action.label).length <= 20)).toBe(true);
    expect(buildCheckInPrompt({ tripId: 'trip-1', includeLocation: false }).quickReply?.items
      .some(({ action }) => action.type === 'location')).toBe(false);
  });

  it('builds a bilingual trip chooser without a location action for ambiguous trips', () => {
    const chooser = buildTripChooser([
      { id: 'trip-1', routeName: '玉山主峰線' },
      { id: 'trip-2', routeName: '雪山東峰線' },
    ]);

    expect(chooser.text).toMatch(/\n/);
    expect(chooser.quickReply?.items).toEqual([
      { type: 'action', action: { type: 'postback', label: '玉山主峰線', data: 'hikesafe:trip:trip-1:select' } },
      { type: 'action', action: { type: 'postback', label: '雪山東峰線', data: 'hikesafe:trip:trip-2:select' } },
    ]);
    expect(chooser.quickReply?.items.some(({ action }) => action.type === 'location')).toBe(false);
    expect(chooser.quickReply?.items.every(({ action }) => Array.from(action.label).length <= 20)).toBe(true);
  });

  it('uses a bilingual text-only web fallback for 14 active trips', () => {
    const chooser = buildTripChooser(Array.from({ length: 14 }, (_, index) => ({
      id: `trip-${index + 1}`,
      routeName: `行程 ${index + 1}`,
    })));

    expect(chooser.type).toBe('text');
    expect(chooser.text).toMatch(/請開啟 HikeSafe 網頁.*\n.*Open HikeSafe on the web/s);
    expect(chooser.quickReply).toBeUndefined();
  });

  it('builds a bilingual help confirmation with explicit confirm and cancel actions', () => {
    const confirmation = buildHelpConfirmation('trip-1');

    expect(confirmation).toMatchObject({
      type: 'text',
      text: expect.stringMatching(/\n/),
      quickReply: {
        items: [
          { type: 'action', action: { type: 'postback', label: '確認求助\nConfirm', data: 'hikesafe:help:trip-1:confirm' } },
          { type: 'action', action: { type: 'postback', label: '取消\nCancel', data: 'hikesafe:help:trip-1:cancel' } },
        ],
      },
    });
  });

  it('sends the due reminder only to participant delivery targets', () => {
    expect(buildLineMessage('due', trip)).toEqual(expect.objectContaining({
      type: 'text',
      text: expect.stringContaining('玉山主峰線'),
    }));
  });

  it('builds a yellow 60-minute guardian card with route, team, last check-in, call action, and no-signal disclaimer', () => {
    const message = buildLineMessage('overdue_60', { ...trip, leaderPhone: '+886912345678' });

    expect(message).toEqual(expect.objectContaining({ type: 'flex', altText: expect.stringContaining('60') }));
    expect(JSON.stringify(message)).toContain('#F5C542');
    expect(JSON.stringify(message)).toContain('玉山主峰線');
    expect(JSON.stringify(message)).toContain('阿山、小玉');
    expect(JSON.stringify(message)).toContain('2026-07-12 12:20 Asia/Taipei');
    expect(JSON.stringify(message)).toContain('tel:+886912345678');
    expect(JSON.stringify(message)).toContain('未回報不代表遇險，也可能是無訊號');
  });

  it('does not generate an empty tel action when no leader contact is available', () => {
    const message = buildLineMessage('overdue_60', trip);
    expect(JSON.stringify(message)).not.toContain('tel:');
    expect(JSON.stringify(message)).toContain('目前沒有可撥號的領隊聯絡資料');
  });

  it('offers the real guardian viewer only for a direct guardian grant', () => {
    const message = buildLineMessage('overdue_60', { ...trip, viewerGrantUrl: undefined });
    expect(JSON.stringify(message)).toContain('請透過 LINE 聯絡已綁定的留守人員');
    expect(JSON.stringify(message)).not.toContain('besafe.example');
  });

  it('builds a red 120-minute guardian card with viewer URL, location, report copy, 119 action, and no automatic-report claim', () => {
    const message = buildLineMessage('overdue_120', trip);
    const serialized = JSON.stringify(message);

    expect(message).toEqual(expect.objectContaining({ type: 'flex', altText: expect.stringContaining('120') }));
    expect(serialized).toContain('#D64545');
    expect(serialized).toContain(trip.viewerGrantUrl);
    expect(serialized).toContain('最後位置：可用');
    expect(serialized).toContain('119 通報摘要');
    expect(serialized).toContain('"clipboard"');
    expect(serialized).toContain('tel:119');
    expect(serialized).toContain('系統尚未自動聯絡 119');
    expect(serialized).toContain('HikeSafe has not contacted 119 automatically');
  });

  it('discloses unknown LINE accuracy without inventing a GPS value', () => {
    const message = buildLineMessage('overdue_120', {
      ...trip,
      lastLocationAccuracyMeters: null,
      lastLocationSource: 'line',
    });

    const serialized = JSON.stringify(message);
    expect(serialized).toContain('位置精度：LINE 未提供');
    expect(serialized).toContain('Location accuracy: Not provided by LINE');
    expect(serialized).not.toMatch(/GPS 精度|GPS accuracy|0 公尺|0 meters/);
  });

  it('does not put a precise viewer link in a group notification', () => {
    const message = buildLineMessage('overdue_120', { ...trip, viewerGrantUrl: undefined });
    expect(JSON.stringify(message)).toContain('請透過 LINE 聯絡已綁定的個別留守人員');
    expect(JSON.stringify(message)).not.toContain('besafe.example');
    expect(JSON.stringify(message)).toContain('119 通報摘要');
    expect(JSON.stringify(message)).toContain('"clipboard"');
  });
});
