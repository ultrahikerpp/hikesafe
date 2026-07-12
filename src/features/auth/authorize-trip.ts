import { and, eq, gt } from 'drizzle-orm';

import { hashViewerGrant } from '@/src/lib/idempotency';

export interface AuthorizeTripViewerRequest {
  tripId: string;
  userId?: string;
  viewerToken?: string;
  now?: Date;
}

export interface TripViewerAuthorizationRepository {
  isTripMember(tripId: string, userId: string): Promise<boolean>;
  hasActiveViewerGrant(tripId: string, tokenHash: string, now: Date): Promise<boolean>;
}

const databaseRepository: TripViewerAuthorizationRepository = {
  async isTripMember(tripId, userId) {
    const [{ db }, { tripMembers }] = await Promise.all([
      import('@/src/db/client'),
      import('@/src/db/schema'),
    ]);
    const [member] = await db.select({ id: tripMembers.id }).from(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId))).limit(1);
    return Boolean(member);
  },

  async hasActiveViewerGrant(tripId, tokenHash, now) {
    const [{ db }, { viewerGrants }] = await Promise.all([
      import('@/src/db/client'),
      import('@/src/db/schema'),
    ]);
    const [grant] = await db.select({ id: viewerGrants.id }).from(viewerGrants)
      .where(and(
        eq(viewerGrants.tripId, tripId),
        eq(viewerGrants.tokenHash, tokenHash),
        gt(viewerGrants.expiresAt, now),
      )).limit(1);
    return Boolean(grant);
  },
};

export const authorizeTripViewer = async (
  request: AuthorizeTripViewerRequest,
  repository: TripViewerAuthorizationRepository = databaseRepository,
) => {
  if (!request.userId) return false;
  if (await repository.isTripMember(request.tripId, request.userId)) return true;
  if (!request.viewerToken) return false;
  return repository.hasActiveViewerGrant(
    request.tripId,
    hashViewerGrant(request.viewerToken),
    request.now ?? new Date(),
  );
};
