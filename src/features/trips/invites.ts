import { createHash, randomBytes } from 'node:crypto';

const hash = (token: string) => createHash('sha256').update(token).digest('hex');

export interface TripInviteRepository {
  transaction<T>(operation: (repository: TripInviteRepository) => Promise<T>): Promise<T>;
  isDraftOwner(tripId: string, userId: string): Promise<boolean>;
  insertInvite(input: { tripId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  consumeInvite(input: { tokenHash: string; userId: string; now: Date }): Promise<string | undefined>;
  addMember(input: { tripId: string; userId: string }): Promise<void>;
  designateDeputy(input: { tripId: string; userId: string }): Promise<void>;
}

const assertOwner = async (tripId: string, userId: string, repository: TripInviteRepository) => {
  if (!await repository.isDraftOwner(tripId, userId)) throw new Error('Only the trip owner may manage invitations');
};

export const createTripInvite = async (
  { tripId, ownerUserId, now }: { tripId: string; ownerUserId: string; now: Date },
  repository: TripInviteRepository = databaseRepository,
  dependencies: { token?: () => string } = {},
) => repository.transaction(async (transaction) => {
  await assertOwner(tripId, ownerUserId, transaction);
  const token = dependencies.token?.() ?? randomBytes(32).toString('base64url');
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60_000);
  await transaction.insertInvite({ tripId, tokenHash: hash(token), expiresAt });
  return { token, expiresAt };
});

export const acceptTripInvite = async (
  { token, userId, now }: { token: string; userId: string; now: Date },
  repository: TripInviteRepository = databaseRepository,
) => repository.transaction(async (transaction) => {
  const tripId = await transaction.consumeInvite({ tokenHash: hash(token), userId, now });
  if (!tripId) throw new Error('Invite is invalid or expired');
  await transaction.addMember({ tripId, userId });
  return { tripId };
});

export const assignDeputy = async (
  { tripId, ownerUserId, memberUserId }: { tripId: string; ownerUserId: string; memberUserId: string },
  repository: TripInviteRepository = databaseRepository,
) => repository.transaction(async (transaction) => {
  await assertOwner(tripId, ownerUserId, transaction);
  await transaction.designateDeputy({ tripId, userId: memberUserId });
});

const databaseRepository: TripInviteRepository = {
  ...databaseTransaction(undefined),
  transaction: async (operation) => {
    const { db } = await import('@/src/db/client');
    return db.transaction(async (transaction) => operation(databaseTransaction(transaction)));
  },
};

function databaseTransaction(database: any): TripInviteRepository {
  return {
    transaction: async (operation) => operation(databaseTransaction(database)),
    async isDraftOwner(tripId, userId) {
      const [{ and, eq }, { trips }] = await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
      const [trip] = await database.select({ id: trips.id }).from(trips).where(and(eq(trips.id, tripId), eq(trips.ownerUserId, userId), eq(trips.status, 'draft'))).limit(1);
      return Boolean(trip);
    },
    async insertInvite(value) {
      const [{ tripInvites }] = await Promise.all([import('@/src/db/schema')]);
      await database.insert(tripInvites).values(value);
    },
    async consumeInvite({ tokenHash, userId, now }) {
      const [{ and, eq, gt, isNull }, { tripInvites, trips }] = await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
      const [candidate] = await database.select({ id: tripInvites.id, tripId: tripInvites.tripId }).from(tripInvites)
        .innerJoin(trips, eq(trips.id, tripInvites.tripId))
        .where(and(eq(tripInvites.tokenHash, tokenHash), gt(tripInvites.expiresAt, now), isNull(tripInvites.acceptedAt), eq(trips.status, 'draft'))).for('update').limit(1);
      if (!candidate) return undefined;
      const [invite] = await database.update(tripInvites).set({ acceptedByUserId: userId, acceptedAt: now })
        .where(and(eq(tripInvites.id, candidate.id), isNull(tripInvites.acceptedAt))).returning({ tripId: tripInvites.tripId });
      return invite?.tripId;
    },
    async addMember({ tripId, userId }) {
      const [{ tripMembers }] = await Promise.all([import('@/src/db/schema')]);
      const [member] = await database.insert(tripMembers).values({ tripId, userId, role: 'member' }).onConflictDoNothing().returning({ id: tripMembers.id });
      if (!member) throw new Error('Already a trip member');
    },
    async designateDeputy({ tripId, userId }) {
      const [{ and, eq, sql }, { tripMembers }] = await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
      const [member] = await database.select({ id: tripMembers.id }).from(tripMembers).where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId))).limit(1);
      if (!member) throw new Error('Trip membership is required');
      await database.update(tripMembers).set({ role: 'member' }).where(and(eq(tripMembers.tripId, tripId), sql`${tripMembers.role} = 'deputy'`));
      await database.update(tripMembers).set({ role: 'deputy' }).where(eq(tripMembers.id, member.id));
    },
  };
}
