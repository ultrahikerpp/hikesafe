import { createHash, timingSafeEqual } from 'node:crypto';

const retentionDays = 90;
const retentionMs = retentionDays * 24 * 60 * 60_000;

export interface ViewerGrant {
  tokenHash: string;
  finishedAt: Date | null;
  expiresAt: Date;
}

export interface ViewerGrantRepository {
  findDirectGuardianGrants(tripId: string, lineUserId: string): Promise<ViewerGrant[]>;
}

export interface AuthorizeViewerGrantInput {
  tripId: string;
  token: string;
  lineUserId: string;
  now?: Date;
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
const effectiveExpiry = ({ expiresAt, finishedAt }: ViewerGrant) => finishedAt
  ? new Date(Math.min(expiresAt.getTime(), finishedAt.getTime() + retentionMs))
  : expiresAt;

export const matchesViewerGrantToken = (token: string, tokenHash: string) => {
  const received = Buffer.from(hashToken(token), 'hex');
  const stored = Buffer.from(tokenHash, 'hex');
  return received.length === stored.length && timingSafeEqual(received, stored);
};

const databaseRepository: ViewerGrantRepository = {
  async findDirectGuardianGrants(tripId, lineUserId) {
    const [{ db }, { guardians, lineBindings, trips, viewerGrants }, { and, eq, isNotNull, isNull }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'), import('drizzle-orm'),
    ]);
    return db.select({ tokenHash: viewerGrants.tokenHash, finishedAt: trips.finishedAt, expiresAt: viewerGrants.expiresAt })
      .from(viewerGrants)
      .innerJoin(trips, eq(trips.id, viewerGrants.tripId))
      .innerJoin(guardians, and(eq(guardians.id, viewerGrants.guardianId), eq(guardians.tripId, viewerGrants.tripId)))
      .innerJoin(lineBindings, eq(lineBindings.id, guardians.lineBindingId))
      .where(and(
        eq(viewerGrants.tripId, tripId),
        eq(lineBindings.sourceType, 'user'),
        eq(lineBindings.sourceId, lineUserId),
        isNotNull(lineBindings.boundAt),
        isNull(lineBindings.revokedAt),
      ));
  },
};

export const authorizeViewerGrant = async (
  { tripId, token, lineUserId, now = new Date() }: AuthorizeViewerGrantInput,
  repository: ViewerGrantRepository = databaseRepository,
) => (await repository.findDirectGuardianGrants(tripId, lineUserId)).some((grant) => {
  if (effectiveExpiry(grant) <= now) return false;
  return matchesViewerGrantToken(token, grant.tokenHash);
});
