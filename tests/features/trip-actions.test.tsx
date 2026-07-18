import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { formatElapsed, TripActions } from '@/app/trips/[tripId]/TripActions';
import { copy } from '@/src/features/i18n/copy';

describe('TripActions', () => {
  it('calculates elapsed time from the supplied server now and start time', () => {
    expect(formatElapsed('2026-07-12T00:00:00.000Z', '2026-07-12T01:02:03.000Z')).toBe(copy.elapsedTime(1, 2));
  });

  it('shows active-trip status and all four required actions without treating pending work as sent', () => {
    render(<TripActions tripId="trip-1" initialState={{
      startedAt: '2026-07-12T00:00:00.000Z',
      plannedFinishAt: '2026-07-12T05:00:00.000Z',
      lastSuccessfulCheckInAt: '2026-07-12T00:30:00.000Z',
      gpsFreshness: copy.gpsFreshness(1),
      now: '2026-07-12T01:00:00.000Z',
      pendingQueueCount: 2,
    }} />);

    expect(screen.getByText((_, element) => element?.textContent === copy.lastSuccessfulCheckIn)).toBeInTheDocument();
    expect(screen.getByText('2026-07-12 08:30 Asia/Taipei')).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.textContent === copy.pendingReports)).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.textContent === copy.reportCount(2))).toBeInTheDocument();
    expect(screen.queryByText(/已送出.*2/)).not.toBeInTheDocument();
    for (const action of [copy.reportProgress, copy.extendFinishTime, copy.needHelp, copy.safeFinish]) {
      expect(screen.getByRole('button', { name: action })).toBeInTheDocument();
    }
  });

  it('exposes text alert status and an accessible action label for mobile users', () => {
    render(<TripActions tripId="trip-1" initialState={{
      startedAt: '2026-07-12T00:00:00.000Z',
      plannedFinishAt: '2026-07-12T05:00:00.000Z',
      lastSuccessfulCheckInAt: undefined,
      gpsFreshness: copy.unavailableLocation('GPS', 'GPS'),
      now: '2026-07-12T01:00:00.000Z',
      pendingQueueCount: 0,
    }} />);

    expect(screen.getAllByText((_, element) => element?.textContent === copy.safetyNotice)).not.toHaveLength(0);
    expect(screen.getAllByRole('button', { name: copy.safeFinish }).at(-1))
      .toHaveAttribute('aria-describedby', 'finish-description');
  });
});
