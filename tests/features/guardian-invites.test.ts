import { describe, expect, it } from 'vitest';

import {
  acceptGuardianInvite,
  createGuardianInvite,
  pendingInviteLimit,
  readGuardianInvite,
  type GuardianInviteRepository,
  type GuardianInviteRow,
} from '@/src/features/line/guardian-invites';

const base = new Date('2026-07-21T00:00:00Z');
const later = (minutes: number) => new Date(base.getTime() + minutes * 60_000);

const repository = () => {
  const rows = new Map<string, GuardianInviteRow>();
  const bindings: Array<{ userId: string; lineUserId: string }> = [];
  const store: GuardianInviteRepository & { rows: typeof rows; bindings: typeof bindings } = {
    rows, bindings,
    transaction: async (operation) => operation(store),
    countPendingInvites: async ({ userId, now }) => [...rows.values()].filter(
      (row) => row.userId === userId && !row.boundAt && !row.revokedAt && row.expiresAt > now,
    ).length,
    insertInvite: async ({ userId, tokenHash, expiresAt }) => {
      rows.set(tokenHash, {
        id: `binding-${rows.size + 1}`, userId, inviterDisplayName: '阿山',
        inviterLineUserId: 'U-hiker', expiresAt, boundAt: null, revokedAt: null,
      });
    },
    findInvite: async (tokenHash) => rows.get(tokenHash),
    hasActiveBinding: async ({ userId, lineUserId }) =>
      bindings.some((binding) => binding.userId === userId && binding.lineUserId === lineUserId),
    bindInvite: async ({ id, lineUserId, now }) => {
      const row = [...rows.values()].find((candidate) => candidate.id === id);
      if (!row || row.boundAt || row.revokedAt || row.expiresAt <= now) return undefined;
      row.boundAt = now;
      bindings.push({ userId: row.userId, lineUserId });
      return row.id;
    },
  };
  return store;
};

describe('guardian invites', () => {
  it('creates a 24-hour invite that stores only a hash of the token', async () => {
    const store = repository();
    const { token, expiresAt } = await createGuardianInvite({ userId: 'hiker-1', now: base }, store);

    expect(expiresAt).toEqual(new Date(base.getTime() + 24 * 60 * 60_000));
    expect([...store.rows.keys()]).toHaveLength(1);
    expect([...store.rows.keys()][0]).not.toBe(token);
    expect([...store.rows.keys()][0]).toMatch(/^[0-9a-f]{64}$/);
  });

  it('refuses to create more than the pending invite limit', async () => {
    const store = repository();
    for (let index = 0; index < pendingInviteLimit; index += 1) {
      await createGuardianInvite({ userId: 'hiker-1', now: base }, store);
    }

    await expect(createGuardianInvite({ userId: 'hiker-1', now: base }, store))
      .rejects.toThrow('Too many pending guardian invites');
    await expect(createGuardianInvite({ userId: 'hiker-2', now: base }, store)).resolves.toBeDefined();
  });

  it('reports every invite status without leaking the token', async () => {
    const store = repository();
    const { token } = await createGuardianInvite({ userId: 'hiker-1', now: base }, store);

    await expect(readGuardianInvite({ token, now: later(1) }, store))
      .resolves.toEqual({ inviterDisplayName: '阿山', expiresAt: later(24 * 60), status: 'pending' });
    await expect(readGuardianInvite({ token, now: later(24 * 60 + 1) }, store))
      .resolves.toMatchObject({ status: 'expired' });
    await expect(readGuardianInvite({ token: 'unknown-token', now: later(1) }, store))
      .resolves.toBeUndefined();
  });

  it('binds the guardian once and rejects replay of the same link', async () => {
    const store = repository();
    const { token } = await createGuardianInvite({ userId: 'hiker-1', now: base }, store);

    await expect(acceptGuardianInvite(
      { token, lineUserId: 'U-guardian', displayName: '小美', now: later(1) }, store,
    )).resolves.toEqual({
      ok: true, bindingId: 'binding-1', inviterDisplayName: '阿山', inviterLineUserId: 'U-hiker',
    });
    await expect(acceptGuardianInvite(
      { token, lineUserId: 'U-other', displayName: '阿明', now: later(2) }, store,
    )).resolves.toEqual({ ok: false, reason: 'used' });
    await expect(readGuardianInvite({ token, now: later(2) }, store))
      .resolves.toMatchObject({ status: 'used' });
  });

  it('rejects expired, revoked, unknown, and duplicate acceptances', async () => {
    const store = repository();
    const expired = await createGuardianInvite({ userId: 'hiker-1', now: base }, store);
    const revoked = await createGuardianInvite({ userId: 'hiker-1', now: base }, store);
    const duplicate = await createGuardianInvite({ userId: 'hiker-1', now: base }, store);
    store.bindings.push({ userId: 'hiker-1', lineUserId: 'U-guardian' });
    [...store.rows.values()][1].revokedAt = later(1);

    const accept = (token: string, now: Date) =>
      acceptGuardianInvite({ token, lineUserId: 'U-guardian', displayName: '小美', now }, store);

    await expect(accept(expired.token, later(24 * 60 + 1))).resolves.toEqual({ ok: false, reason: 'expired' });
    await expect(accept(revoked.token, later(2))).resolves.toEqual({ ok: false, reason: 'revoked' });
    await expect(accept('unknown-token', later(2))).resolves.toEqual({ ok: false, reason: 'not_found' });
    await expect(accept(duplicate.token, later(2))).resolves.toEqual({ ok: false, reason: 'already_bound' });
  });
});
