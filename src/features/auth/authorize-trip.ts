import { and, eq, gt } from 'drizzle-orm';

import { hashViewerGrant } from '@/src/lib/idempotency';

export interface AuthorizeTripViewerRequest {
  tripId: string;
  userId?: string;
  viewerToken?: string;
  now?: Date;
}

export interface TripViewerAuthorizationRepository {
  hasActiveViewerGrant(tripId: string, tokenHash: string, now: Date): Promise<boolean>;
}

const databaseRepository: TripViewerAuthorizationRepository = {
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
  if (!request.userId || !request.viewerToken) return false;
  return repository.hasActiveViewerGrant(
    request.tripId,
    hashViewerGrant(request.viewerToken),
    request.now ?? new Date(),
  );
};
