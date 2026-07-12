import { z } from 'zod';

import { routeInputSchema, type RouteInput } from './import';

export const routeSearchQuerySchema = z.object({
  q: z.string().optional(),
  region: z.string().optional(),
  kind: z.enum(['hundred_peak', 'suburban']).optional(),
});

export type RouteSearchQuery = z.infer<typeof routeSearchQuerySchema>;

export type RouteCatalogRecord = RouteInput & {
  id: string;
  routeId: string;
  isActive: boolean;
};

const normalize = (value: string) =>
  value.normalize('NFKC').trim().toLocaleLowerCase('zh-Hant-TW');

export const filterRoutes = (
  routes: readonly RouteCatalogRecord[],
  query: RouteSearchQuery,
) => {
  const parsedQuery = routeSearchQuerySchema.parse(query);
  const q = parsedQuery.q ? normalize(parsedQuery.q) : '';
  const region = parsedQuery.region ? normalize(parsedQuery.region) : undefined;

  return routes.filter((route) => {
    if (!route.isActive) return false;
    if (parsedQuery.kind && route.kind !== parsedQuery.kind) return false;
    if (region && normalize(route.region) !== region) return false;
    if (!q) return true;
    return normalize(
      `${route.mountainName} ${route.routeName} ${route.region}`,
    ).includes(q);
  });
};

const loadActiveRoutes = async (): Promise<RouteCatalogRecord[]> => {
  const [{ eq }, { db }, { routes, routeVersions }] = await Promise.all([
    import('drizzle-orm'),
    import('@/src/db/client'),
    import('@/src/db/schema'),
  ]);
  const rows = await db
    .select({ route: routes, version: routeVersions })
    .from(routeVersions)
    .innerJoin(routes, eq(routes.id, routeVersions.routeId))
    .where(eq(routeVersions.isActive, true));

  return rows.map(({ route, version }) => ({
    id: version.id,
    routeId: route.id,
    isActive: version.isActive,
    ...routeInputSchema.parse({
      slug: route.slug,
      mountainName: version.mountainName,
      routeName: version.routeName,
      region: version.region,
      kind: version.kind,
      startLat: version.startLatitude,
      startLng: version.startLongitude,
      distanceKm: version.distanceKm,
      elevationGainM: version.elevationGainMeters,
      durationMinutes: version.durationMinutes,
      difficulty: version.difficulty,
      checkpoints: version.checkpoints,
      evacuationPoints: version.evacuationPoints,
      permitNotes: version.permitNotes,
      sourceOrganization: version.sourceOrganization,
      sourceUrl: version.sourceUrl,
      sourceVersion: version.sourceVersion,
      reviewedAt: version.reviewedAt.toISOString().slice(0, 10),
    }),
  }));
};

export const searchRoutes = async (query: RouteSearchQuery) =>
  filterRoutes(await loadActiveRoutes(), query);
