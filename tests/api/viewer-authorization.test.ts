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

  it('allows a direct legacy guardian grant only for its verified LINE identity', async () => {
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
      tripId: 'trip-1', userId: 'line-session-user', lineUserId: 'line-user', viewerToken: 'token',
    });
  });

  it('allows an authenticated trip member without a viewer grant', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: 'line-session-member', lineUserId: 'line-member', expiresAt: new Date(),
    });
    vi.mocked(authorizeTripViewer).mockResolvedValue(true);

    const response = await GET(new Request(
      'http://localhost/api/trips/trip-1/viewer',
      { headers: { cookie: 'besafe_session=session-token' } },
    ), context);

    expect(response.status).toBe(200);
    expect(authorizeTripViewer).toHaveBeenCalledWith({
      tripId: 'trip-1', userId: 'line-session-member', lineUserId: 'line-member', viewerToken: undefined,
    });
  });

  it('rejects an authenticated nonmember without a viewer grant', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: 'line-session-user', lineUserId: 'line-user', expiresAt: new Date(),
    });
    vi.mocked(authorizeTripViewer).mockResolvedValue(false);

    const response = await GET(new Request(
      'http://localhost/api/trips/trip-1/viewer',
      { headers: { cookie: 'besafe_session=session-token' } },
    ), context);

    expect(response.status).toBe(403);
  });

  it('rejects a legacy group or room grant because it cannot bind a single LINE identity', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: 'line-session-user', lineUserId: 'line-user', expiresAt: new Date(),
    });
    vi.mocked(authorizeTripViewer).mockResolvedValue(false);

    const response = await GET(new Request(
      'http://localhost/api/trips/trip-1/viewer?grant=legacy-group-token',
      { headers: { cookie: 'besafe_session=session-token' } },
    ), context);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: 'Viewer grant requires an individual LINE guardian binding',
      code: 'REQUIRES_DIRECT_GUARDIAN_BINDING',
    });
  });
});
