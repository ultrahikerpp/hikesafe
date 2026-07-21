import { createHash, randomBytes } from 'node:crypto';

import type { DatabaseHandle } from '@/src/db/transaction';

const hash = (token: string) => createHash('sha256').update(token).digest('hex');

export const pendingInviteLimit = 10;
const inviteLifetimeMs = 24 * 60 * 60_000;

export type GuardianInviteStatus = 'pending' | 'expired' | 'used' | 'revoked';

export interface GuardianInviteRow {
  id: string;
  userId: string;
  inviterDisplayName: string;
  inviterLineUserId: string;
  expiresAt: Date;
  boundAt: Date | null;
  revokedAt: Date | null;
}

export type AcceptGuardianInviteResult =
  | { ok: true; bindingId: string; inviterDisplayName: string; inviterLineUserId: string }
  | { ok: false; reason: 'not_found' | 'expired' | 'used' | 'revoked' | 'already_bound' };

export interface GuardianInviteRepository {
  transaction<T>(operation: (repository: GuardianInviteRepository) => Promise<T>): Promise<T>;
  countPendingInvites(input: { userId: string; now: Date }): Promise<number>;
  insertInvite(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findInvite(tokenHash: string, lock?: boolean): Promise<GuardianInviteRow | undefined>;
  hasActiveBinding(input: { userId: string; lineUserId: string }): Promise<boolean>;
  bindInvite(input: { id: string; lineUserId: string; displayName: string; now: Date }): Promise<string | undefined>;
}

const statusOf = (row: GuardianInviteRow, now: Date): GuardianInviteStatus => {
  if (row.revokedAt) return 'revoked';
  if (row.boundAt) return 'used';
  if (row.expiresAt <= now) return 'expired';
  return 'pending';
};

export const createGuardianInvite = async (
  { userId, now }: { userId: string; now: Date },
  repository: GuardianInviteRepository = databaseRepository,
  dependencies: { token?: () => string } = {},
) => repository.transaction(async (transaction) => {
  if (await transaction.countPendingInvites({ userId, now }) >= pendingInviteLimit) {
    throw new Error('Too many pending guardian invites');
  }
  const token = dependencies.token?.() ?? randomBytes(32).toString('base64url');
  const expiresAt = new Date(now.getTime() + inviteLifetimeMs);
  await transaction.insertInvite({ userId, tokenHash: hash(token), expiresAt });
  return { token, expiresAt };
});

export const readGuardianInvite = async (
  { token, now }: { token: string; now: Date },
  repository: GuardianInviteRepository = databaseRepository,
) => {
  const row = await repository.findInvite(hash(token));
  if (!row) return undefined;
  return {
    inviterDisplayName: row.inviterDisplayName,
    expiresAt: row.expiresAt,
    status: statusOf(row, now),
  };
};

export const acceptGuardianInvite = async (
  { token, lineUserId, displayName, now }:
    { token: string; lineUserId: string; displayName: string; now: Date },
  repository: GuardianInviteRepository = databaseRepository,
): Promise<AcceptGuardianInviteResult> => repository.transaction(async (transaction) => {
  const row = await transaction.findInvite(hash(token), true);
  if (!row) return { ok: false, reason: 'not_found' };

  const status = statusOf(row, now);
  if (status !== 'pending') return { ok: false, reason: status };
  if (await transaction.hasActiveBinding({ userId: row.userId, lineUserId })) {
    return { ok: false, reason: 'already_bound' };
  }

  const bindingId = await transaction.bindInvite({ id: row.id, lineUserId, displayName, now });
  if (!bindingId) return { ok: false, reason: 'used' };
  return {
    ok: true,
    bindingId,
    inviterDisplayName: row.inviterDisplayName,
    inviterLineUserId: row.inviterLineUserId,
  };
});

const repositoryFor = (database: DatabaseHandle): GuardianInviteRepository => {
  return {
    transaction: async (operation) => operation(repositoryFor(database)),
    async countPendingInvites({ userId, now }) {
      const [{ and, eq, gt, isNotNull, isNull }, { lineBindings }] =
        await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
      const rows = await database.select({ id: lineBindings.id }).from(lineBindings).where(and(
        eq(lineBindings.userId, userId),
        isNotNull(lineBindings.inviteTokenHash),
        isNull(lineBindings.boundAt),
        isNull(lineBindings.revokedAt),
        gt(lineBindings.codeExpiresAt, now),
      ));
      return rows.length;
    },
    async insertInvite({ userId, tokenHash, expiresAt }) {
      const [{ lineBindings }] = await Promise.all([import('@/src/db/schema')]);
      await database.insert(lineBindings).values({
        userId, inviteTokenHash: tokenHash, codeExpiresAt: expiresAt,
      });
    },
    async findInvite(tokenHash, lock = false) {
      const [{ eq }, { lineBindings, users }] =
        await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
      const query = database.select({
        id: lineBindings.id, userId: lineBindings.userId,
        inviterDisplayName: users.displayName, inviterLineUserId: users.lineUserId,
        expiresAt: lineBindings.codeExpiresAt, boundAt: lineBindings.boundAt,
        revokedAt: lineBindings.revokedAt,
      }).from(lineBindings)
        .innerJoin(users, eq(lineBindings.userId, users.id))
        .where(eq(lineBindings.inviteTokenHash, tokenHash));
      const [row] = await (lock ? query.for('update') : query).limit(1);
      if (!row) return undefined;
      // codeExpiresAt is nullable at the column level (shared with the binding-code flow)
      // but always set on rows reachable via inviteTokenHash, since insertInvite writes both together.
      return { ...row, expiresAt: row.expiresAt as Date };
    },
    async hasActiveBinding({ userId, lineUserId }) {
      const [{ and, eq, isNotNull, isNull }, { lineBindings }] =
        await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
      const [row] = await database.select({ id: lineBindings.id }).from(lineBindings).where(and(
        eq(lineBindings.userId, userId),
        eq(lineBindings.sourceType, 'user'),
        eq(lineBindings.sourceId, lineUserId),
        isNotNull(lineBindings.boundAt),
        isNull(lineBindings.revokedAt),
      )).limit(1);
      return Boolean(row);
    },
    async bindInvite({ id, lineUserId, displayName, now }) {
      const [{ and, eq, gt, isNull }, { lineBindings }] =
        await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
      const [row] = await database.update(lineBindings).set({
        sourceType: 'user', sourceId: lineUserId, displayName, boundAt: now,
      }).where(and(
        eq(lineBindings.id, id),
        isNull(lineBindings.boundAt),
        isNull(lineBindings.revokedAt),
        gt(lineBindings.codeExpiresAt, now),
      )).returning({ id: lineBindings.id });
      return row?.id;
    },
  };
};

const databaseRepository: GuardianInviteRepository = {
  transaction: async (operation) => {
    const { db } = await import('@/src/db/client');
    return db.transaction(async (transaction) => operation(repositoryFor(transaction)));
  },
  countPendingInvites: (input) => databaseRepository.transaction((repository) => repository.countPendingInvites(input)),
  insertInvite: (input) => databaseRepository.transaction((repository) => repository.insertInvite(input)),
  findInvite: (tokenHash, lock) => databaseRepository.transaction((repository) => repository.findInvite(tokenHash, lock)),
  hasActiveBinding: (input) => databaseRepository.transaction((repository) => repository.hasActiveBinding(input)),
  bindInvite: (input) => databaseRepository.transaction((repository) => repository.bindInvite(input)),
};
