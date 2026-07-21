import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/features/line/guardian-invites', () => ({ acceptGuardianInvite: vi.fn() }));
vi.mock('@/src/integrations/line/verify-id-token', () => ({ verifyLineIdToken: vi.fn() }));
vi.mock('@/src/integrations/line/client', () => ({ pushLineMessage: vi.fn() }));

import { POST } from '@/app/api/guardian-invites/accept/route';
import { acceptGuardianInvite } from '@/src/features/line/guardian-invites';
import { verifyLineIdToken } from '@/src/integrations/line/verify-id-token';
import { pushLineMessage } from '@/src/integrations/line/client';

const request = (body: unknown) => new Request('http://localhost/api/guardian-invites/accept', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
});

describe('POST /api/guardian-invites/accept', () => {
  beforeEach(() => {
    vi.mocked(acceptGuardianInvite).mockReset();
    vi.mocked(verifyLineIdToken).mockReset();
    vi.mocked(pushLineMessage).mockReset().mockResolvedValue(undefined);
  });

  it('rejects a malformed body before touching LINE', async () => {
    expect((await POST(request({ token: 'invite-token' }))).status).toBe(400);
    expect(verifyLineIdToken).not.toHaveBeenCalled();
  });

  it('rejects an invalid LINE identity token', async () => {
    vi.mocked(verifyLineIdToken).mockRejectedValue(new Error('Invalid LINE identity token'));

    expect((await POST(request({ token: 'invite-token', idToken: 'bad' }))).status).toBe(401);
    expect(acceptGuardianInvite).not.toHaveBeenCalled();
  });

  it('binds the guardian and notifies the hiker', async () => {
    vi.mocked(verifyLineIdToken).mockResolvedValue({ lineUserId: 'U-guardian', displayName: '小美' });
    vi.mocked(acceptGuardianInvite).mockResolvedValue({
      ok: true, bindingId: 'binding-1', inviterDisplayName: '阿山', inviterLineUserId: 'U-hiker',
    });

    const response = await POST(request({ token: 'invite-token', idToken: 'good' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ inviterDisplayName: '阿山' });
    expect(acceptGuardianInvite).toHaveBeenCalledWith(expect.objectContaining({
      token: 'invite-token', lineUserId: 'U-guardian', displayName: '小美',
    }));
    expect(pushLineMessage).toHaveBeenCalledWith(expect.objectContaining({
      to: 'U-hiker', idempotencyKey: 'binding-1',
    }));
  });

  it('still reports success when the hiker notification cannot be delivered', async () => {
    vi.mocked(verifyLineIdToken).mockResolvedValue({ lineUserId: 'U-guardian', displayName: '小美' });
    vi.mocked(acceptGuardianInvite).mockResolvedValue({
      ok: true, bindingId: 'binding-1', inviterDisplayName: '阿山', inviterLineUserId: 'U-hiker',
    });
    vi.mocked(pushLineMessage).mockRejectedValue(new Error('LINE push failed (403)'));

    expect((await POST(request({ token: 'invite-token', idToken: 'good' }))).status).toBe(200);
  });

  it('maps every rejection reason to its status code', async () => {
    vi.mocked(verifyLineIdToken).mockResolvedValue({ lineUserId: 'U-guardian', displayName: '小美' });
    const expected = {
      not_found: 404, used: 409, revoked: 409, already_bound: 409, expired: 410,
    } as const;

    for (const [reason, status] of Object.entries(expected)) {
      vi.mocked(acceptGuardianInvite).mockResolvedValue({ ok: false, reason: reason as 'used' });
      const response = await POST(request({ token: 'invite-token', idToken: 'good' }));

      expect(response.status).toBe(status);
      await expect(response.json()).resolves.toMatchObject({ reason });
    }
    expect(pushLineMessage).not.toHaveBeenCalled();
  });
});
