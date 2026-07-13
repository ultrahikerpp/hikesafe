import { describe, expect, it } from 'vitest';

import { acceptTripInvite, assignDeputy, createTripInvite, type TripInviteRepository } from '@/src/features/trips/invites';

const repository = (): TripInviteRepository & { members: Array<{ userId: string; role: string }>; invites: Map<string, string> } => {
  const store: TripInviteRepository & { members: Array<{ userId: string; role: string }>; invites: Map<string, string> } = {
    members: [{ userId: 'owner', role: 'leader' }], invites: new Map(),
    transaction: async (operation) => operation(store),
    isDraftOwner: async (_tripId, userId) => userId === 'owner',
    insertInvite: async ({ tokenHash }) => { store.invites.set(tokenHash, 'trip-1'); },
    consumeInvite: async ({ tokenHash }) => { const tripId = store.invites.get(tokenHash); store.invites.delete(tokenHash); return tripId; },
    addMember: async ({ userId }) => { if (store.members.some((member) => member.userId === userId)) throw new Error('Already a trip member'); store.members.push({ userId, role: 'member' }); },
    designateDeputy: async ({ userId }) => { store.members = store.members.map((member) => ({ ...member, role: member.role === 'deputy' ? 'member' : member.role })); const member = store.members.find((candidate) => candidate.userId === userId); if (!member) throw new Error('Trip membership is required'); member.role = 'deputy'; },
  };
  return store;
};

describe('draft trip invites', () => {
  it('lets only the draft owner create a session-safe invite that joins a new member once', async () => {
    const store = repository();
    const invite = await createTripInvite({ tripId: 'trip-1', ownerUserId: 'owner', now: new Date('2026-07-13T00:00:00Z') }, store, { token: () => 'invite-token' });
    await expect(acceptTripInvite({ token: invite.token, userId: 'member-1', now: new Date('2026-07-13T00:01:00Z') }, store)).resolves.toEqual({ tripId: 'trip-1' });
    await expect(acceptTripInvite({ token: invite.token, userId: 'member-1', now: new Date('2026-07-13T00:02:00Z') }, store)).rejects.toThrow('Invite is invalid or expired');
    expect(store.members).toContainEqual({ userId: 'member-1', role: 'member' });
    await expect(createTripInvite({ tripId: 'trip-1', ownerUserId: 'member-1', now: new Date() }, store)).rejects.toThrow('Only the trip owner');
  });

  it('allows only the draft owner to designate an already joined member as deputy', async () => {
    const store = repository();
    store.members.push({ userId: 'member-1', role: 'member' });
    await assignDeputy({ tripId: 'trip-1', ownerUserId: 'owner', memberUserId: 'member-1' }, store);
    expect(store.members).toContainEqual({ userId: 'member-1', role: 'deputy' });
    await expect(assignDeputy({ tripId: 'trip-1', ownerUserId: 'member-1', memberUserId: 'owner' }, store)).rejects.toThrow('Only the trip owner');
  });
});
