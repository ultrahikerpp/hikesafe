import { z } from 'zod';

export const routeInputSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  mountainName: z.string().min(1),
  routeName: z.string().min(1),
  region: z.string().min(1),
  kind: z.enum(['hundred_peak', 'suburban']),
  startLat: z.number().min(21).max(26),
  startLng: z.number().min(119).max(123),
  distanceKm: z.number().positive(),
  elevationGainM: z.number().nonnegative(),
  durationMinutes: z.number().int().positive(),
  difficulty: z.number().int().min(1).max(5),
  checkpoints: z
    .array(
      z.object({
        name: z.string().min(1),
        order: z.number().int().positive(),
      }),
    )
    .min(1),
  evacuationPoints: z
    .array(
      z.object({
        name: z.string().min(1),
        order: z.number().int().positive(),
      }),
    )
    .min(1),
  permitNotes: z.string(),
  sourceOrganization: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceVersion: z.string().min(1),
  reviewedAt: z.iso.date(),
});

export type RouteInput = z.infer<typeof routeInputSchema>;

export const validateRouteInput = (input: unknown) =>
  routeInputSchema.parse(input);

export const routeSourceSchema = z.object({
  organization: z.string().min(1),
  url: z.string().url(),
});

export type RouteSource = z.infer<typeof routeSourceSchema>;

export const requiredSuburbanRouteNames = [
  '七星山主峰東峰',
  '大屯山主峰',
  '面天山向天山',
  '劍潭山',
  '金面山',
  '皇帝殿東西峰',
  '五寮尖',
  '筆架連峰',
  '南插天山',
  '北插天山',
  '姜子寮山',
  '無耳茶壺山半屏山',
  '桃源谷',
  '東眼山',
  '拉拉山',
  '飛鳳山',
  '鵝公髻山',
  '加里山',
  '火炎山',
  '八仙山',
  '馬崙山',
  '屋我尾山',
  '波津加山',
  '東卯山',
  '唐麻丹山',
  '白毛山',
  '大塔山',
  '尾寮山',
  '里龍山',
  '都蘭山',
] as const;

export type RouteCatalogReport = {
  valid: boolean;
  hundredPeaks: number;
  suburbanRoutes: number;
  missingSources: number;
  duplicateSlugs: number;
  errors: string[];
};

export const analyzeRouteCatalog = (
  catalogInput: unknown,
  sourcesInput: unknown,
): RouteCatalogReport => {
  const errors: string[] = [];
  const catalogResult = z.array(routeInputSchema).safeParse(catalogInput);
  const sourcesResult = z.array(routeSourceSchema).safeParse(sourcesInput);
  if (!catalogResult.success) errors.push('Catalog schema validation failed');
  if (!sourcesResult.success) errors.push('Source registry validation failed');

  const catalog = catalogResult.success ? catalogResult.data : [];
  const sources = sourcesResult.success ? sourcesResult.data : [];
  const hundredPeaks = catalog.filter(
    ({ kind }) => kind === 'hundred_peak',
  ).length;
  const suburbanRoutes = catalog.filter(({ kind }) => kind === 'suburban').length;
  if (hundredPeaks !== 100) {
    errors.push(`Expected exactly 100 hundred peaks, found ${hundredPeaks}`);
  }
  if (suburbanRoutes < 30) {
    errors.push(`Expected at least 30 suburban routes, found ${suburbanRoutes}`);
  }

  const slugCounts = new Map<string, number>();
  for (const { slug } of catalog) {
    slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1);
  }
  const duplicateSlugNames = [...slugCounts]
    .filter(([, count]) => count > 1)
    .map(([slug]) => slug);
  if (duplicateSlugNames.length > 0) {
    errors.push(`Duplicate slugs: ${duplicateSlugNames.join(', ')}`);
  }

  const sourceKeys = new Set(
    sources.map(({ organization, url }) => `${organization}\u0000${url}`),
  );
  const missingSources = catalog.filter(
    ({ sourceOrganization, sourceUrl }) =>
      !sourceKeys.has(`${sourceOrganization}\u0000${sourceUrl}`),
  ).length;
  if (missingSources > 0) {
    errors.push(`Routes missing a registered source: ${missingSources}`);
  }

  const suburbanNames = new Set(
    catalog
      .filter(({ kind }) => kind === 'suburban')
      .map(({ mountainName }) => mountainName),
  );
  const missingSuburbanRoutes = requiredSuburbanRouteNames.filter(
    (name) => !suburbanNames.has(name),
  );
  if (missingSuburbanRoutes.length > 0) {
    errors.push(
      `Missing required suburban routes: ${missingSuburbanRoutes.join(', ')}`,
    );
  }

  return {
    valid: errors.length === 0,
    hundredPeaks,
    suburbanRoutes,
    missingSources,
    duplicateSlugs: duplicateSlugNames.length,
    errors,
  };
};

export type StoredRouteVersion = {
  id: string;
  routeId: string;
  input: RouteInput;
  isActive: boolean;
};

export interface RouteCatalogTransaction {
  findRouteId(slug: string): Promise<string | undefined>;
  createRoute(slug: string): Promise<string>;
  findActiveVersion(
    routeId: string,
    slug: string,
  ): Promise<StoredRouteVersion | undefined>;
  deactivateVersion(id: string): Promise<void>;
  createVersion(routeId: string, input: RouteInput): Promise<void>;
}

export interface RouteCatalogDatabase {
  transaction(
    callback: (transaction: RouteCatalogTransaction) => Promise<void>,
  ): Promise<void>;
}

const sameReviewedContent = (left: RouteInput, right: RouteInput) =>
  JSON.stringify(left) === JSON.stringify(right);

const createDatabase = async (): Promise<RouteCatalogDatabase> => {
  const [{ and, eq }, { db }, { routes, routeVersions }] = await Promise.all([
    import('drizzle-orm'),
    import('@/src/db/client'),
    import('@/src/db/schema'),
  ]);

  return {
    transaction: async (callback) => {
      await db.transaction(async (transaction) => {
        const adapter: RouteCatalogTransaction = {
          findRouteId: async (slug) => {
            const [route] = await transaction
              .select({ id: routes.id })
              .from(routes)
              .where(eq(routes.slug, slug))
              .limit(1);
            return route?.id;
          },
          createRoute: async (slug) => {
            const [route] = await transaction
              .insert(routes)
              .values({ slug })
              .returning({ id: routes.id });
            if (!route) throw new Error(`Failed to create route: ${slug}`);
            return route.id;
          },
          findActiveVersion: async (routeId, slug) => {
            const [version] = await transaction
              .select()
              .from(routeVersions)
              .where(
                and(
                  eq(routeVersions.routeId, routeId),
                  eq(routeVersions.isActive, true),
                ),
              )
              .limit(1);
            if (!version) return undefined;
            return {
              id: version.id,
              routeId: version.routeId,
              isActive: version.isActive,
              input: {
                slug,
                mountainName: version.mountainName,
                routeName: version.routeName,
                region: version.region,
                kind: routeInputSchema.shape.kind.parse(version.kind),
                startLat: version.startLatitude,
                startLng: version.startLongitude,
                distanceKm: version.distanceKm,
                elevationGainM: version.elevationGainMeters,
                durationMinutes: version.durationMinutes,
                difficulty: version.difficulty,
                checkpoints: routeInputSchema.shape.checkpoints.parse(
                  version.checkpoints,
                ),
                evacuationPoints:
                  routeInputSchema.shape.evacuationPoints.parse(
                    version.evacuationPoints,
                  ),
                permitNotes: version.permitNotes,
                sourceOrganization: version.sourceOrganization,
                sourceUrl: version.sourceUrl,
                sourceVersion: version.sourceVersion,
                reviewedAt: version.reviewedAt.toISOString().slice(0, 10),
              },
            };
          },
          deactivateVersion: async (id) => {
            await transaction
              .update(routeVersions)
              .set({ isActive: false })
              .where(eq(routeVersions.id, id));
          },
          createVersion: async (routeId, input) => {
            await transaction.insert(routeVersions).values({
              routeId,
              mountainName: input.mountainName,
              routeName: input.routeName,
              region: input.region,
              kind: input.kind,
              startLatitude: input.startLat,
              startLongitude: input.startLng,
              distanceKm: input.distanceKm,
              elevationGainMeters: input.elevationGainM,
              durationMinutes: input.durationMinutes,
              difficulty: input.difficulty,
              checkpoints: input.checkpoints,
              evacuationPoints: input.evacuationPoints,
              permitNotes: input.permitNotes,
              sourceOrganization: input.sourceOrganization,
              sourceUrl: input.sourceUrl,
              sourceVersion: input.sourceVersion,
              reviewedAt: new Date(`${input.reviewedAt}T00:00:00.000Z`),
              isActive: true,
            });
          },
        };

        await callback(adapter);
      });
    },
  };
};

export const importRouteCatalog = async (
  inputs: readonly unknown[],
  database?: RouteCatalogDatabase,
) => {
  const catalog = z.array(routeInputSchema).parse(inputs);
  const target = database ?? (await createDatabase());

  await target.transaction(async (transaction) => {
    for (const input of catalog) {
      const existingRouteId = await transaction.findRouteId(input.slug);
      const routeId =
        existingRouteId ?? (await transaction.createRoute(input.slug));
      const activeVersion = await transaction.findActiveVersion(
        routeId,
        input.slug,
      );

      if (activeVersion && sameReviewedContent(activeVersion.input, input)) {
        continue;
      }
      if (activeVersion) {
        await transaction.deactivateVersion(activeVersion.id);
      }
      await transaction.createVersion(routeId, input);
    }
  });
};
