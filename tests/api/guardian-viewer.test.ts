import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/features/auth/session', () => ({
  verifySession: vi.fn(), sessionCookie: { name: 'besafe_session' },
}));
vi.mock('@/src/features/auth/authorize-trip', () => ({ authorizeTripViewer: vi.fn() }));
vi.mock('@/src/features/guardian-viewer/service', () => ({ loadGuardianViewer: vi.fn() }));

import { GET } from '@/app/api/trips/[tripId]/guardian-viewer/route';
import { authorizeTripViewer } from '@/src/features/auth/authorize-trip';
import { verifySession } from '@/src/features/auth/session';
import { loadGuardianViewer } from '@/src/features/guardian-viewer/service';

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
      tripId: 'trip-1', userId: 'guardian-1', lineUserId: 'line-1', viewerToken: undefined, requireGrant: true,
    });
  });

  it('returns the route, team, last check-in location metadata, and report for the bound LINE guardian', async () => {
    vi.mocked(verifySession).mockResolvedValue({ userId: 'guardian-1', lineUserId: 'U-guardian', expiresAt: new Date() });
    vi.mocked(authorizeTripViewer).mockResolvedValue(true);
    vi.mocked(loadGuardianViewer).mockResolvedValue({
      route: '玉山主峰', team: ['阿山'], lastCheckIn: { at: '2026-07-12T04:20:00.000Z', location: {
        latitude: 23.47, longitude: 120.95, accuracyMeters: null, capturedAt: '2026-07-12T04:19:00.000Z', source: 'line',
      } }, report: '119 摘要',
    });
    const response = await GET(new Request('http://localhost/api/trips/trip-1/guardian-viewer?grant=token', { headers: { cookie: 'besafe_session=session' } }), { params: Promise.resolve({ tripId: 'trip-1' }) });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ route: '玉山主峰', team: ['阿山'], lastCheckIn: { location: {
      accuracyMeters: null, capturedAt: '2026-07-12T04:19:00.000Z', source: 'line',
    } }, report: '119 摘要' });
    expect(loadGuardianViewer).toHaveBeenCalledWith({ tripId: 'trip-1' });
  });
});
