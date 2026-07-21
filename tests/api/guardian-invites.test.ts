import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/features/auth/session', () => ({
  verifySession: vi.fn(), sessionCookie: { name: 'besafe_session' },
}));
vi.mock('@/src/features/line/guardian-invites', () => ({
  createGuardianInvite: vi.fn(), readGuardianInvite: vi.fn(),
}));
vi.mock('@/src/env', () => ({ getEnv: () => ({ NEXT_PUBLIC_LIFF_ID: 'liff-1' }) }));

import { POST } from '@/app/api/guardian-invites/route';
import { GET } from '@/app/api/guardian-invites/[token]/route';
import { verifySession } from '@/src/features/auth/session';
import { createGuardianInvite, readGuardianInvite } from '@/src/features/line/guardian-invites';

const authenticated = () => new Request('http://localhost/api/guardian-invites', {
  method: 'POST', headers: { cookie: 'besafe_session=session' },
});

describe('guardian invites API', () => {
  beforeEach(() => {
    vi.mocked(verifySession).mockReset();
    vi.mocked(createGuardianInvite).mockReset();
    vi.mocked(readGuardianInvite).mockReset();
  });

  it('rejects invite creation without a session', async () => {
    const response = await POST(new Request('http://localhost/api/guardian-invites', { method: 'POST' }));

    expect(response.status).toBe(401);
    expect(createGuardianInvite).not.toHaveBeenCalled();
  });

  it('returns a LIFF invite url for the authenticated hiker', async () => {
    vi.mocked(verifySession).mockResolvedValue({ userId: 'hiker-1', lineUserId: 'U-hiker', expiresAt: new Date() });
    vi.mocked(createGuardianInvite).mockResolvedValue({
      token: 'invite-token', expiresAt: new Date('2026-07-22T00:00:00.000Z'),
    });

    const response = await POST(authenticated());

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      inviteUrl: 'https://liff.line.me/liff-1/guardian/accept?token=invite-token',
      expiresAt: '2026-07-22T00:00:00.000Z',
    });
    expect(createGuardianInvite).toHaveBeenCalledWith(expect.objectContaining({ userId: 'hiker-1' }));
  });

  it('reports the pending invite limit as a conflict', async () => {
    vi.mocked(verifySession).mockResolvedValue({ userId: 'hiker-1', lineUserId: 'U-hiker', expiresAt: new Date() });
    vi.mocked(createGuardianInvite).mockRejectedValue(new Error('Too many pending guardian invites'));

    expect((await POST(authenticated())).status).toBe(409);
  });

  it('exposes the invite status to an unauthenticated holder of the token', async () => {
    vi.mocked(readGuardianInvite).mockResolvedValue({
      inviterDisplayName: '阿山', expiresAt: new Date('2026-07-22T00:00:00.000Z'), status: 'pending',
    });

    const response = await GET(
      new Request('http://localhost/api/guardian-invites/invite-token'),
      { params: Promise.resolve({ token: 'invite-token' }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      inviterDisplayName: '阿山', expiresAt: '2026-07-22T00:00:00.000Z', status: 'pending',
    });
  });

  it('returns 404 for an unknown token', async () => {
    vi.mocked(readGuardianInvite).mockResolvedValue(undefined);

    expect((await GET(
      new Request('http://localhost/api/guardian-invites/nope'),
      { params: Promise.resolve({ token: 'nope' }) },
    )).status).toBe(404);
  });
});
