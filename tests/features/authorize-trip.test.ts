import { describe, expect, it, vi } from 'vitest';

import {
  authorizeTripViewer,
  type TripViewerAuthorizationRepository,
} from '@/src/features/auth/authorize-trip';

const repository: TripViewerAuthorizationRepository = {
  hasActiveViewerGrant: vi.fn().mockResolvedValue(true),
};

describe('authorizeTripViewer', () => {
  it('rejects a viewer grant without an authenticated LINE user', async () => {
    await expect(authorizeTripViewer({
      tripId: 'trip-1',
      viewerToken: 'viewer-token',
    }, repository)).resolves.toBe(false);
  });

  it('requires both an authenticated LINE user and an active viewer grant', async () => {
    await expect(authorizeTripViewer({
      tripId: 'trip-1',
      userId: 'line-session-user',
      viewerToken: 'viewer-token',
    }, repository)).resolves.toBe(true);

    await expect(authorizeTripViewer({
      tripId: 'trip-1',
      userId: 'line-session-user',
    }, repository)).resolves.toBe(false);
  });
});
