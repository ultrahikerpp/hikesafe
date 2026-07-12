import { describe, expect, it } from 'vitest';

import { scheduleAlertEvents } from '@/src/features/alerts/domain';

describe('scheduleAlertEvents', () => {
  it('schedules exactly 0, 60, and 120 minute stages', () => {
    const due = new Date('2026-07-12T05:00:00Z');

    expect(scheduleAlertEvents('trip-1', due).map((event) => [event.stage, event.dueAt.toISOString()]))
      .toEqual([
        ['due', '2026-07-12T05:00:00.000Z'],
        ['overdue_60', '2026-07-12T06:00:00.000Z'],
        ['overdue_120', '2026-07-12T07:00:00.000Z'],
      ]);
  });
});
