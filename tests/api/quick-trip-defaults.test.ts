import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/features/auth/session', () => ({
  verifySession: vi.fn(),
  sessionCookie: { name: 'besafe_session' },
}));
vi.mock('@/src/features/trips/quick-defaults', () => ({ loadQuickTripDefaults: vi.fn() }));

import { GET } from '@/app/api/trips/quick-defaults/route';
import { verifySession } from '@/src/features/auth/session';
import { loadQuickTripDefaults } from '@/src/features/trips/quick-defaults';

describe('GET /api/trips/quick-defaults', () => {
  beforeEach(() => {
    vi.mocked(verifySession).mockReset();
    vi.mocked(loadQuickTripDefaults).mockReset();
  });

  it('requires a verified LINE session', async () => {
    const response = await GET(new Request('http://localhost/api/trips/quick-defaults'));

    expect(response.status).toBe(401);
    expect(loadQuickTripDefaults).not.toHaveBeenCalled();
  });

  it('loads defaults only for the authenticated owner', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: 'owner-1', lineUserId: 'U-owner', expiresAt: new Date(),
    });
    vi.mocked(loadQuickTripDefaults).mockResolvedValue({
      routeVersionId: 'route-version-1',
      guardianBindingIds: ['binding-1'],
      vehicle: '汽車 ABC-1234',
      equipment: ['頭燈'],
      leaderPhone: '0912345678',
    });

    const response = await GET(new Request('http://localhost/api/trips/quick-defaults', {
      headers: { cookie: 'besafe_session=session-token' },
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ defaults: expect.objectContaining({
      routeVersionId: 'route-version-1', guardianBindingIds: ['binding-1'],
    }) });
    expect(loadQuickTripDefaults).toHaveBeenCalledWith('owner-1');
  });

  it('returns a controlled unavailable response when defaults cannot be read', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: 'owner-1', lineUserId: 'U-owner', expiresAt: new Date(),
    });
    vi.mocked(loadQuickTripDefaults).mockRejectedValue(new Error('database unavailable'));

    const response = await GET(new Request('http://localhost/api/trips/quick-defaults', {
      headers: { cookie: 'besafe_session=session-token' },
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: 'Quick defaults unavailable' });
  });
});
