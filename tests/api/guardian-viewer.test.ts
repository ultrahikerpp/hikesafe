import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/features/auth/session', () => ({
  verifySession: vi.fn(), sessionCookie: { name: 'besafe_session' },
}));
vi.mock('@/src/features/auth/authorize-trip', () => ({ authorizeTripViewer: vi.fn() }));

import { GET } from '@/app/api/trips/[tripId]/guardian-viewer/route';
import { authorizeTripViewer } from '@/src/features/auth/authorize-trip';
import { verifySession } from '@/src/features/auth/session';

describe('guardian viewer route', () => {
  beforeEach(() => { vi.mocked(verifySession).mockReset(); vi.mocked(authorizeTripViewer).mockReset(); });

  it('requires an authenticated LINE guardian and a bearer grant, even for a trip member', async () => {
    vi.mocked(verifySession).mockResolvedValue({ userId: 'guardian-1', lineUserId: 'line-1', expiresAt: new Date() });
    vi.mocked(authorizeTripViewer).mockResolvedValue(false);
    const response = await GET(new Request('http://localhost/api/trips/trip-1/guardian-viewer', {
      headers: { cookie: 'besafe_session=session' },
    }), { params: Promise.resolve({ tripId: 'trip-1' }) });

    expect(response.status).toBe(403);
    expect(authorizeTripViewer).toHaveBeenCalledWith({
      tripId: 'trip-1', userId: 'guardian-1', viewerToken: undefined, requireGrant: true,
    });
  });
});
