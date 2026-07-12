import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/features/auth/session', () => ({
  verifySession: vi.fn(),
  sessionCookie: { name: 'besafe_session' },
}));
vi.mock('@/src/features/trips/commands', () => ({
  startTrip: vi.fn(), recordCheckIn: vi.fn(), extendTrip: vi.fn(), finishTrip: vi.fn(),
}));

import { handleCheckIn } from '@/app/api/trips/[tripId]/check-ins/route';
import { handleExtend } from '@/app/api/trips/[tripId]/extend/route';
import { handleFinish } from '@/app/api/trips/[tripId]/finish/route';
import { handleStart } from '@/app/api/trips/[tripId]/start/route';
import { verifySession } from '@/src/features/auth/session';
import { extendTrip, finishTrip, recordCheckIn, startTrip } from '@/src/features/trips/commands';

const params = Promise.resolve({ tripId: '11111111-1111-4111-8111-111111111111' });
const request = (body: unknown) => new Request('http://localhost/api/trips/trip-1/start', {
  method: 'POST', headers: { cookie: 'besafe_session=session-token' }, body: JSON.stringify(body),
});
const gps = {
  latitude: 24.18, longitude: 121.28, accuracyMeters: 12,
  capturedAt: '2026-07-12T00:59:00.000Z', source: 'gps',
};

describe('trip lifecycle API', () => {
  beforeEach(() => {
    vi.mocked(verifySession).mockReset().mockResolvedValue({ userId: 'member-1', lineUserId: 'line-1', expiresAt: new Date() });
    vi.mocked(startTrip).mockReset().mockResolvedValue({ tripId: 'trip-1', status: 'active', startedAt: new Date() });
    vi.mocked(recordCheckIn).mockReset().mockResolvedValue({ id: 'check-in-1' });
    vi.mocked(extendTrip).mockReset().mockResolvedValue({ tripId: 'trip-1', plannedFinishAt: new Date() });
    vi.mocked(finishTrip).mockReset().mockResolvedValue({ tripId: 'trip-1', finishedAt: new Date(), finalCheckInId: 'check-in-2' });
  });

  it('passes a fresh start location and session user to the start command', async () => {
    const response = await handleStart(request({ location: gps, idempotencyKey: 'start-key' }), { params });
    expect(response.status).toBe(200);
    expect(startTrip).toHaveBeenCalledWith(expect.objectContaining({ tripId: await params.then(({ tripId }) => tripId), userId: 'member-1', location: expect.objectContaining({ source: 'gps', capturedAt: new Date(gps.capturedAt) }), idempotencyKey: 'start-key' }));
  });

  it('accepts a text-only check-in so the command can record unavailable location', async () => {
    const response = await handleCheckIn(request({ message: '沒訊號，平安', idempotencyKey: 'check-key' }), { params });
    expect(response.status).toBe(201);
    expect(recordCheckIn).toHaveBeenCalledWith(expect.objectContaining({ userId: 'member-1', message: '沒訊號，平安', location: undefined, idempotencyKey: 'check-key' }));
  });

  it('passes extension and finish mutations through the authenticated session', async () => {
    const extension = await handleExtend(request({ plannedFinishAt: '2026-07-12T06:00:00.000Z', idempotencyKey: 'extend-key' }), { params });
    const finish = await handleFinish(request({ location: gps, idempotencyKey: 'finish-key' }), { params });
    expect(extension.status).toBe(200);
    expect(finish.status).toBe(200);
    expect(extendTrip).toHaveBeenCalledWith(expect.objectContaining({ userId: 'member-1', plannedFinishAt: new Date('2026-07-12T06:00:00.000Z') }));
    expect(finishTrip).toHaveBeenCalledWith(expect.objectContaining({ userId: 'member-1', location: expect.objectContaining({ source: 'gps' }) }));
  });

  it('rejects malformed mutation bodies before they reach a command', async () => {
    const response = await handleStart(request({ idempotencyKey: 'start-key' }), { params });
    expect(response.status).toBe(400);
    expect(startTrip).not.toHaveBeenCalled();
  });
});
