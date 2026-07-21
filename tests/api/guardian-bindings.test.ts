import { beforeEach, describe, expect, it, vi } from 'vitest';

const orderBy = vi.fn().mockResolvedValue([{ id: 'owner-binding', sourceType: 'user', displayName: '小玉', sourceId: 'U-owner', boundAt: new Date() }]);
const where = vi.fn(() => ({ orderBy }));
const from = vi.fn(() => ({ where }));
const select = vi.fn(() => ({ from }));

const returning = vi.fn().mockResolvedValue([{ id: 'owner-binding' }]);
const updateWhere = vi.fn(() => ({ returning }));
const set = vi.fn(() => ({ where: updateWhere }));
const update = vi.fn(() => ({ set }));

vi.mock('@/src/features/auth/session', () => ({ verifySession: vi.fn(), sessionCookie: { name: 'besafe_session' } }));
vi.mock('@/src/features/line/bindings', () => ({ createBindingCode: vi.fn() }));
vi.mock('@/src/db/client', () => ({ db: { select, update } }));

import { GET, POST } from '@/app/api/guardian-bindings/route';
import { DELETE } from '@/app/api/guardian-bindings/[id]/route';
import { verifySession } from '@/src/features/auth/session';
import { createBindingCode } from '@/src/features/line/bindings';

describe('guardian bindings API', () => {
  beforeEach(() => {
    vi.mocked(verifySession).mockReset(); vi.mocked(createBindingCode).mockReset();
    select.mockClear(); from.mockClear(); where.mockClear(); orderBy.mockClear();
    orderBy.mockResolvedValue([{ id: 'owner-binding', sourceType: 'user', displayName: '小玉', sourceId: 'U-owner', boundAt: new Date() }]);
  });

  it('rejects an unauthenticated listing and binding-code creation request', async () => {
    expect((await GET(new Request('http://localhost/api/guardian-bindings'))).status).toBe(401);
    expect((await POST(new Request('http://localhost/api/guardian-bindings', { method: 'POST' }))).status).toBe(401);
    expect(createBindingCode).not.toHaveBeenCalled();
  });

  it('creates a code and lists only the authenticated owner binding scope', async () => {
    vi.mocked(verifySession).mockResolvedValue({ userId: 'owner-1', lineUserId: 'U-owner', expiresAt: new Date() });
    vi.mocked(createBindingCode).mockResolvedValue({ code: 'ABC123', expiresAt: new Date('2026-07-13T01:10:00.000Z') });
    const request = new Request('http://localhost/api/guardian-bindings', { method: 'POST', headers: { cookie: 'besafe_session=session' } });

    await expect((await POST(request)).json()).resolves.toMatchObject({ code: 'ABC123' });
    await expect((await GET(new Request('http://localhost/api/guardian-bindings', { headers: { cookie: 'besafe_session=session' } }))).json())
      .resolves.toEqual({ bindings: [expect.objectContaining({ id: 'owner-binding', sourceId: 'U-owner' })] });
    expect(createBindingCode).toHaveBeenCalledWith('owner-1');
    expect(where).toHaveBeenCalledTimes(1);
  });
});

describe('DELETE /api/guardian-bindings/[id]', () => {
  beforeEach(() => {
    vi.mocked(verifySession).mockReset();
    update.mockClear(); set.mockClear(); updateWhere.mockClear(); returning.mockClear();
    returning.mockResolvedValue([{ id: 'owner-binding' }]);
  });

  it('rejects revocation without a session', async () => {
    const response = await DELETE(
      new Request('http://localhost/api/guardian-bindings/owner-binding', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'owner-binding' }) },
    );

    expect(response.status).toBe(401);
    expect(update).not.toHaveBeenCalled();
  });

  it('revokes the binding owned by the authenticated hiker', async () => {
    vi.mocked(verifySession).mockResolvedValue({ userId: 'owner-1', lineUserId: 'U-owner', expiresAt: new Date() });

    const response = await DELETE(
      new Request('http://localhost/api/guardian-bindings/owner-binding', {
        method: 'DELETE', headers: { cookie: 'besafe_session=session' },
      }),
      { params: Promise.resolve({ id: 'owner-binding' }) },
    );

    expect(response.status).toBe(204);
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ revokedAt: expect.any(Date) }));
  });

  it('hides bindings that belong to somebody else behind a 404', async () => {
    vi.mocked(verifySession).mockResolvedValue({ userId: 'owner-1', lineUserId: 'U-owner', expiresAt: new Date() });
    returning.mockResolvedValue([]);

    const response = await DELETE(
      new Request('http://localhost/api/guardian-bindings/other-binding', {
        method: 'DELETE', headers: { cookie: 'besafe_session=session' },
      }),
      { params: Promise.resolve({ id: 'other-binding' }) },
    );

    expect(response.status).toBe(404);
  });
});
