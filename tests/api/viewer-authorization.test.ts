import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/features/auth/session', () => ({
  verifySession: vi.fn(),
  sessionCookie: { name: 'besafe_session' },
}));
vi.mock('@/src/features/auth/authorize-trip', () => ({ authorizeTripViewer: vi.fn() }));

import { GET } from '@/app/api/trips/[tripId]/viewer/route';
import { authorizeTripViewer } from '@/src/features/auth/authorize-trip';
import { verifySession } from '@/src/features/auth/session';

const context = { params: Promise.resolve({ tripId: 'trip-1' }) };

describe('GET /api/trips/:tripId/viewer', () => {
  beforeEach(() => {
    vi.mocked(verifySession).mockReset();
    vi.mocked(authorizeTripViewer).mockReset();
  });

  it('requires a verified LINE session before checking a viewer grant', async () => {
    const response = await GET(new Request('http://localhost/api/trips/trip-1/viewer?grant=token'), context);

    expect(response.status).toBe(401);
    expect(authorizeTripViewer).not.toHaveBeenCalled();
  });

  it('allows a viewer only when the verified identity and grant authorize together', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: 'line-session-user', lineUserId: 'line-user', expiresAt: new Date(),
    });
    vi.mocked(authorizeTripViewer).mockResolvedValue(true);

    const response = await GET(new Request(
      'http://localhost/api/trips/trip-1/viewer?grant=token',
      { headers: { cookie: 'besafe_session=session-token' } },
    ), context);

    expect(response.status).toBe(200);
    expect(authorizeTripViewer).toHaveBeenCalledWith({
      tripId: 'trip-1', userId: 'line-session-user', viewerToken: 'token',
    });
  });
});
