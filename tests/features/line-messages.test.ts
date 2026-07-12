import { describe, expect, it } from 'vitest';

import { buildLineMessage } from '@/src/features/line/messages';

const trip = {
  id: 'trip-1',
  routeName: '玉山主峰線',
  plannedFinishAt: new Date('2026-07-12T05:00:00.000Z'),
  team: ['阿山', '小玉'],
  lastCheckInAt: new Date('2026-07-12T04:20:00.000Z'),
  lastLocationStatus: 'available' as const,
  viewerGrantUrl: 'https://besafe.example/trips/trip-1/view?token=viewer-token',
  reportText: '119 通報摘要',
};

describe('buildLineMessage', () => {
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
    expect(JSON.stringify(message)).toContain('2026-07-12 04:20 UTC');
    expect(JSON.stringify(message)).toContain('tel:+886912345678');
    expect(JSON.stringify(message)).toContain('未回報不代表遇險，也可能是無訊號');
  });

  it('does not generate an empty tel action when no leader contact is available', () => {
    const message = buildLineMessage('overdue_60', trip);
    expect(JSON.stringify(message)).not.toContain('tel:');
    expect(JSON.stringify(message)).toContain('目前沒有可撥號的領隊聯絡資料');
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
  });
});
