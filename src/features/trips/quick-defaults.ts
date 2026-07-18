export interface QuickTripDefaults {
  routeVersionId: string | null;
  guardianBindingIds: string[];
  vehicle: string;
  equipment: string[];
  leaderPhone: string;
}

interface LatestTripSetup {
  id: string;
  routeVersionId: string;
  routeIsActive: boolean;
  vehicle: string;
  equipment: unknown;
  leaderPhone: string;
}

export interface QuickTripDefaultsRepository {
  findLatestTripForOwner(ownerUserId: string): Promise<LatestTripSetup | undefined>;
  findActiveGuardianBindingIds(ownerUserId: string, tripId: string): Promise<string[]>;
}

const emptyDefaults = (): QuickTripDefaults => ({
  routeVersionId: null,
  guardianBindingIds: [],
  vehicle: '',
  equipment: [],
  leaderPhone: '',
});

const stringList = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export const loadQuickTripDefaults = async (
  ownerUserId: string,
  repository: QuickTripDefaultsRepository = databaseRepository,
): Promise<QuickTripDefaults> => {
  const latest = await repository.findLatestTripForOwner(ownerUserId);
  if (!latest) return emptyDefaults();

  return {
    routeVersionId: latest.routeIsActive ? latest.routeVersionId : null,
    guardianBindingIds: await repository.findActiveGuardianBindingIds(ownerUserId, latest.id),
    vehicle: latest.vehicle,
    equipment: stringList(latest.equipment),
    leaderPhone: latest.leaderPhone,
  };
};

const databaseRepository: QuickTripDefaultsRepository = {
  async findLatestTripForOwner(ownerUserId) {
    const [{ desc, eq }, { db }, { routeVersions, trips }] = await Promise.all([
      import('drizzle-orm'),
      import('@/src/db/client'),
      import('@/src/db/schema'),
    ]);
    const [trip] = await db.select({
      id: trips.id,
      routeVersionId: trips.routeVersionId,
      routeIsActive: routeVersions.isActive,
      vehicle: trips.vehicle,
      equipment: trips.equipment,
      leaderPhone: trips.leaderPhone,
    }).from(trips)
      .innerJoin(routeVersions, eq(routeVersions.id, trips.routeVersionId))
      .where(eq(trips.ownerUserId, ownerUserId))
      .orderBy(desc(trips.createdAt))
      .limit(1);
    return trip;
  },

  async findActiveGuardianBindingIds(ownerUserId, tripId) {
    const [{ and, eq, isNotNull, isNull }, { db }, { guardians, lineBindings }] = await Promise.all([
      import('drizzle-orm'),
      import('@/src/db/client'),
      import('@/src/db/schema'),
    ]);
    const bindings = await db.select({ id: lineBindings.id })
      .from(guardians)
      .innerJoin(lineBindings, eq(lineBindings.id, guardians.lineBindingId))
      .where(and(
        eq(guardians.tripId, tripId),
        eq(lineBindings.userId, ownerUserId),
        isNotNull(lineBindings.boundAt),
        isNotNull(lineBindings.sourceId),
        isNull(lineBindings.revokedAt),
      ));
    return bindings.map(({ id }) => id);
  },
};
