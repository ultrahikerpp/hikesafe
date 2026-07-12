import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TripActions } from '@/app/trips/[tripId]/TripActions';

describe('TripActions', () => {
  it('shows active-trip status and all four required actions without treating pending work as sent', () => {
    render(<TripActions tripId="trip-1" initialState={{
      startedAt: '2026-07-12T00:00:00.000Z',
      plannedFinishAt: '2026-07-12T05:00:00.000Z',
      lastSuccessfulCheckInAt: '2026-07-12T00:30:00.000Z',
      gpsFreshness: '新鮮（1 分鐘前）',
      pendingQueueCount: 2,
    }} />);

    expect(screen.getByText('最後成功送出')).toBeInTheDocument();
    expect(screen.getByText('2026-07-12 00:30 UTC')).toBeInTheDocument();
    expect(screen.getByText('待傳送回報')).toBeInTheDocument();
    expect(screen.getByText('2 筆')).toBeInTheDocument();
    expect(screen.queryByText(/已送出.*2/)).not.toBeInTheDocument();
    for (const action of ['回報目前進度', '延長下山時間', '需要協助', '確認全隊安全下山']) {
      expect(screen.getByRole('button', { name: action })).toBeInTheDocument();
    }
  });
});
