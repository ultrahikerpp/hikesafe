import { describe, expect, it, vi } from 'vitest';

import {
  authorizeTripViewer,
  type TripViewerAuthorizationRepository,
} from '@/src/features/auth/authorize-trip';

const repository: TripViewerAuthorizationRepository = {
  isTripMember: vi.fn().mockResolvedValue(false),
  hasActiveViewerGrant: vi.fn().mockResolvedValue(true),
};

describe('authorizeTripViewer', () => {
  it('allows an authenticated active trip member to view precise GPS without a grant', async () => {
    vi.mocked(repository.isTripMember).mockResolvedValueOnce(true);

    await expect(authorizeTripViewer({
      tripId: 'trip-1',
      userId: 'line-session-member',
    }, repository)).resolves.toBe(true);
    expect(repository.hasActiveViewerGrant).not.toHaveBeenCalled();
  });

  it('rejects a viewer grant without an authenticated LINE user', async () => {
    await expect(authorizeTripViewer({
      tripId: 'trip-1',
      viewerToken: 'viewer-token',
    }, repository)).resolves.toBe(false);
  });

  it('rejects a nonmember without a viewer grant', async () => {
    vi.mocked(repository.isTripMember).mockResolvedValueOnce(false);

    await expect(authorizeTripViewer({
      tripId: 'trip-1',
      userId: 'line-session-user',
    }, repository)).resolves.toBe(false);
  });

  it('requires both an authenticated LINE user and an active viewer grant for a nonmember', async () => {
    vi.mocked(repository.isTripMember).mockResolvedValueOnce(false);
    await expect(authorizeTripViewer({
      tripId: 'trip-1',
      userId: 'line-session-user',
      viewerToken: 'viewer-token',
    }, repository)).resolves.toBe(true);

  });
});
