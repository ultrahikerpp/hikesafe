import { beforeEach, describe, expect, it, vi } from 'vitest';

const select = vi.fn();

vi.mock('@/src/db/client', () => ({ db: { select } }));

import { loadGuardianViewer } from '@/src/features/guardian-viewer/service';

const loadCheckIn = (checkIn: { accuracyMeters: number | null; locationSource: 'gps' | 'network' | 'line' }) => {
  select
    .mockReturnValueOnce({ from: () => ({ innerJoin: () => ({ where: () => ({ limit: async () => [{ route: '玉山主峰', plannedFinishAt: new Date('2026-07-12T05:00:00.000Z') }] }) }) }) })
    .mockReturnValueOnce({ from: () => ({ innerJoin: () => ({ where: async () => [{ name: '阿山' }] }) }) })
    .mockReturnValueOnce({ from: () => ({ where: () => ({ orderBy: () => ({ limit: async () => [{
      createdAt: new Date('2026-07-12T04:20:00.000Z'),
      latitude: 23.47,
      longitude: 120.95,
      locationStatus: 'available',
      ...checkIn,
    }] }) }) }) });
};

describe('loadGuardianViewer', () => {
  beforeEach(() => select.mockReset());

  it.each([
    { locationSource: 'line' as const, accuracyMeters: null },
    { locationSource: 'gps' as const, accuracyMeters: 12 },
    { locationSource: 'network' as const, accuracyMeters: 18 },
  ])('returns the persisted $locationSource source without changing its accuracy', async (checkIn) => {
    loadCheckIn(checkIn);

    const viewer = await loadGuardianViewer({ tripId: 'trip-1' });

    expect(viewer?.lastCheckIn?.location).toEqual({
      latitude: 23.47,
      longitude: 120.95,
      accuracyMeters: checkIn.accuracyMeters,
      source: checkIn.locationSource,
    });
  });
});
