import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/features/auth/session', () => ({
  verifySession: vi.fn(),
  sessionCookie: { name: 'besafe_session' },
}));
vi.mock('@/src/features/trips/service', () => ({ createTrip: vi.fn() }));
vi.mock('@/src/features/line/trip-summary', () => ({ pushTripSummary: vi.fn() }));

import { POST, handleCreateTrip } from '@/app/api/trips/route';
import { verifySession } from '@/src/features/auth/session';
import { pushTripSummary } from '@/src/features/line/trip-summary';
import { createTrip } from '@/src/features/trips/service';

const payload = {
  routeVersionId: '11111111-1111-4111-8111-111111111111',
  startsAt: '2026-07-13T01:00:00.000Z',
  plannedFinishAt: '2026-07-13T07:00:00.000Z',
  members: [
    { userId: '11111111-1111-4111-8111-111111111113', role: 'deputy' },
  ],
  guardianBindingIds: ['11111111-1111-4111-8111-111111111114'],
  vehicle: 'car',
  equipment: ['headlamp'],
  idempotencyKey: '11111111-1111-4111-8111-111111111115',
};

describe('POST /api/trips', () => {
  beforeEach(() => {
    vi.mocked(verifySession).mockReset();
    vi.mocked(createTrip).mockReset();
    vi.mocked(pushTripSummary).mockReset();
    vi.mocked(pushTripSummary).mockResolvedValue(undefined);
  });

  it('requires a LINE session', async () => {
    const response = await POST(new Request('http://localhost/api/trips', {
      method: 'POST',
      body: JSON.stringify(payload),
    }));

    expect(response.status).toBe(401);
  });

  it('creates one draft trip for the session user and hides viewer tokens from the response', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111112',
      lineUserId: 'line-owner-1',
      expiresAt: new Date('2026-08-01T00:00:00Z'),
    });
    vi.mocked(createTrip).mockResolvedValue({
      tripId: 'trip-1',
      viewerGrants: [{ guardianBindingId: 'binding-1', token: 'plaintext-only-for-message' }],
    });

    const response = await handleCreateTrip(new Request('http://localhost/api/trips', {
      method: 'POST',
      headers: { cookie: 'besafe_session=session-token' },
      body: JSON.stringify(payload),
    }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ tripId: 'trip-1' });
    expect(createTrip).toHaveBeenCalledWith(expect.objectContaining({
      ownerUserId: '11111111-1111-4111-8111-111111111112',
      startsAt: new Date(payload.startsAt),
      plannedFinishAt: new Date(payload.plannedFinishAt),
    }));
  });

  it('creates a single-person trip by injecting the session user as leader', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111112',
      lineUserId: 'line-owner-1',
      expiresAt: new Date('2026-08-01T00:00:00Z'),
    });
    vi.mocked(createTrip).mockResolvedValue({ tripId: 'trip-1', viewerGrants: [] });

    await handleCreateTrip(new Request('http://localhost/api/trips', {
      method: 'POST',
      headers: { cookie: 'besafe_session=session-token' },
      body: JSON.stringify({
        ...payload,
        members: [],
      }),
    }));

    expect(createTrip).toHaveBeenCalledWith(expect.objectContaining({
      members: [
        { userId: '11111111-1111-4111-8111-111111111112', role: 'leader' },
      ],
    }));
  });

  it('rejects a client-supplied leader instead of filtering it silently', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111112',
      lineUserId: 'line-owner-1', expiresAt: new Date(),
    });

    const response = await handleCreateTrip(new Request('http://localhost/api/trips', {
      method: 'POST', headers: { cookie: 'besafe_session=session-token' },
      body: JSON.stringify({
        ...payload,
        members: [{ userId: '11111111-1111-4111-8111-111111111119', role: 'leader' }],
      }),
    }));

    expect(response.status).toBe(400);
    expect(createTrip).not.toHaveBeenCalled();
  });

  it('rejects a repeated session-owner member instead of silently removing it', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111112',
      lineUserId: 'line-owner-1', expiresAt: new Date(),
    });

    const response = await handleCreateTrip(new Request('http://localhost/api/trips', {
      method: 'POST', headers: { cookie: 'besafe_session=session-token' },
      body: JSON.stringify({
        ...payload,
        members: [{ userId: '11111111-1111-4111-8111-111111111112', role: 'member' }],
      }),
    }));

    expect(response.status).toBe(400);
    expect(createTrip).not.toHaveBeenCalled();
  });

  it('rejects a fake leader payload that reuses an idempotency key', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111112',
      lineUserId: 'line-owner-1', expiresAt: new Date(),
    });
    vi.mocked(createTrip).mockResolvedValue({ tripId: 'trip-1', viewerGrants: [] });

    await handleCreateTrip(new Request('http://localhost/api/trips', {
      method: 'POST', headers: { cookie: 'besafe_session=session-token' }, body: JSON.stringify(payload),
    }));
    const response = await handleCreateTrip(new Request('http://localhost/api/trips', {
      method: 'POST', headers: { cookie: 'besafe_session=session-token' },
      body: JSON.stringify({
        ...payload,
        members: [{ userId: '11111111-1111-4111-8111-111111111119', role: 'leader' }],
      }),
    }));

    expect(response.status).toBe(400);
    expect(createTrip).toHaveBeenCalledTimes(1);
  });

  it('pushes the trip summary card to the owner after creation', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111112',
      lineUserId: 'line-owner-1',
      expiresAt: new Date('2026-08-01T00:00:00Z'),
    });
    vi.mocked(createTrip).mockResolvedValue({ tripId: 'trip-1', viewerGrants: [] });
    vi.mocked(pushTripSummary).mockResolvedValue(undefined);

    const response = await handleCreateTrip(new Request('http://localhost/api/trips', {
      method: 'POST',
      headers: { cookie: 'besafe_session=session-token' },
      body: JSON.stringify(payload),
    }));

    expect(response.status).toBe(201);
    expect(pushTripSummary).toHaveBeenCalledWith({
      tripId: 'trip-1',
      ownerUserId: '11111111-1111-4111-8111-111111111112',
    });
  });

  it('still returns 201 when the summary push rejects', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111112',
      lineUserId: 'line-owner-1',
      expiresAt: new Date('2026-08-01T00:00:00Z'),
    });
    vi.mocked(createTrip).mockResolvedValue({ tripId: 'trip-1', viewerGrants: [] });
    vi.mocked(pushTripSummary).mockRejectedValue(new Error('unexpected'));

    const response = await handleCreateTrip(new Request('http://localhost/api/trips', {
      method: 'POST',
      headers: { cookie: 'besafe_session=session-token' },
      body: JSON.stringify(payload),
    }));

    expect(response.status).toBe(201);
  });

  it('returns 201 without waiting out a stalled summary push', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111112',
      lineUserId: 'line-owner-1',
      expiresAt: new Date('2026-08-01T00:00:00Z'),
    });
    vi.mocked(createTrip).mockResolvedValue({ tripId: 'trip-1', viewerGrants: [] });
    // Push that never settles — simulates a stalled LINE endpoint.
    vi.mocked(pushTripSummary).mockReturnValue(new Promise<void>(() => {}));

    vi.useFakeTimers();
    try {
      const responsePromise = handleCreateTrip(new Request('http://localhost/api/trips', {
        method: 'POST',
        headers: { cookie: 'besafe_session=session-token' },
        body: JSON.stringify(payload),
      }));
      await vi.advanceTimersByTimeAsync(3000);
      const response = await responsePromise;
      expect(response.status).toBe(201);
    } finally {
      vi.useRealTimers();
    }
  });
});
