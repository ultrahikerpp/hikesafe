import { describe, expect, it, vi } from 'vitest';

import {
  loadQuickTripDefaults,
  type QuickTripDefaultsRepository,
} from '@/src/features/trips/quick-defaults';

const latestTrip = {
  id: 'trip-2',
  routeVersionId: 'route-version-2',
  routeIsActive: true,
  vehicle: '白色廂型車 ABC-1234',
  equipment: ['頭燈', '保暖衣'],
  leaderPhone: '0912345678',
};

describe('loadQuickTripDefaults', () => {
  it('returns the authenticated owner latest trip and active guardian choices', async () => {
    const repository: QuickTripDefaultsRepository = {
      findLatestTripForOwner: vi.fn().mockResolvedValue(latestTrip),
      findActiveGuardianBindingIds: vi.fn().mockResolvedValue(['binding-1']),
    };

    await expect(loadQuickTripDefaults('owner-1', repository)).resolves.toEqual({
      routeVersionId: 'route-version-2',
      guardianBindingIds: ['binding-1'],
      vehicle: '白色廂型車 ABC-1234',
      equipment: ['頭燈', '保暖衣'],
      leaderPhone: '0912345678',
    });
    expect(repository.findLatestTripForOwner).toHaveBeenCalledWith('owner-1');
    expect(repository.findActiveGuardianBindingIds).toHaveBeenCalledWith('owner-1', 'trip-2');
  });

  it('omits a superseded route while retaining confirmed non-route values', async () => {
    const repository: QuickTripDefaultsRepository = {
      findLatestTripForOwner: vi.fn().mockResolvedValue({ ...latestTrip, routeIsActive: false }),
      findActiveGuardianBindingIds: vi.fn().mockResolvedValue([]),
    };

    await expect(loadQuickTripDefaults('owner-1', repository)).resolves.toEqual({
      routeVersionId: null,
      guardianBindingIds: [],
      vehicle: '白色廂型車 ABC-1234',
      equipment: ['頭燈', '保暖衣'],
      leaderPhone: '0912345678',
    });
  });

  it('returns an empty setup when the owner has no previous trip', async () => {
    const repository: QuickTripDefaultsRepository = {
      findLatestTripForOwner: vi.fn().mockResolvedValue(undefined),
      findActiveGuardianBindingIds: vi.fn(),
    };

    await expect(loadQuickTripDefaults('owner-1', repository)).resolves.toEqual({
      routeVersionId: null,
      guardianBindingIds: [],
      vehicle: '',
      equipment: [],
      leaderPhone: '',
    });
    expect(repository.findActiveGuardianBindingIds).not.toHaveBeenCalled();
  });
});
