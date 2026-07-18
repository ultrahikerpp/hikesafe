import { z } from 'zod';

import canonicalHundredPeakNamesJson from '@/data/routes/hundred-peaks.json';
import smallHundredPeaksJson from '@/data/routes/small-hundred-peaks.json';
import suburbanRouteNamesJson from '@/data/routes/suburban-routes.json';

export const canonicalHundredPeakNames = z
  .array(z.string().min(1))
  .length(100)
  .parse(canonicalHundredPeakNamesJson);

const smallHundredPeakSchema = z.object({
  number: z.number().int().positive(),
});

const smallHundredPeakNumbers = z
  .array(smallHundredPeakSchema)
  .length(100)
  .parse(smallHundredPeaksJson)
  .map(({ number }) => number);

const requiredSmallHundredPeakNumbers = Array.from(
  { length: 100 },
  (_, index) => index + 1,
);
const smallHundredPeakNumberSet = new Set(smallHundredPeakNumbers);
if (
  smallHundredPeakNumberSet.size !== 100 ||
  requiredSmallHundredPeakNumbers.some(
    (number) => !smallHundredPeakNumberSet.has(number),
  )
) {
  throw new Error('Small Hundred Peak official numbers must be 1 through 100 exactly once');
}

export const requiredSmallHundredPeakDesignations =
  requiredSmallHundredPeakNumbers.map(
    (number) => `taiwan_small_hundred_peak:${String(number).padStart(3, '0')}`,
  );

const roundTo = (value: number, decimalPlaces: number) => {
  const factor = 10 ** decimalPlaces;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const orderedPlaceSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().positive(),
});

const routeSourceFieldSchema = z.enum([
  'slug',
  'mountainName',
  'routeName',
  'region',
  'kind',
  'startLat',
  'startLng',
  'distanceKm',
  'designations',
  'elevationGainM',
  'elevationDifferenceM',
  'durationMinutes',
  'difficulty',
  'checkpoints',
  'evacuationPoints',
  'permitNotes',
]);

export const routeSourceReferenceSchema = z.object({
  organization: z.string().min(1),
  url: z.string().url().refine((url) => new URL(url).protocol === 'https:', {
    message: 'Source reference URL must use HTTPS',
  }),
  fields: z.array(routeSourceFieldSchema).min(1),
  tier: z.enum(['official', 'community']).default('official'),
});

export const normalizeStoredRouteSourceReferences = (
  sourceOrganization: string,
  sourceUrl: string,
  sourceReferences: unknown,
) =>
  Array.isArray(sourceReferences) && sourceReferences.length === 0
    ? [{
        organization: sourceOrganization,
        url: sourceUrl,
        fields: routeSourceFieldSchema.options,
        tier: 'official' as const,
      }]
    : z.array(routeSourceReferenceSchema).min(1).parse(sourceReferences);

export const routeInputSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  mountainName: z.string().min(1),
  routeName: z.string().min(1),
  region: z.string().min(1),
  kind: z.enum(['hundred_peak', 'suburban']),
  startLat: z
    .number()
    .min(21)
    .max(26)
    .transform((value) => roundTo(value, 6))
    .nullable(),
  startLng: z
    .number()
    .min(119)
    .max(123)
    .transform((value) => roundTo(value, 6))
    .nullable(),
  distanceKm: z
    .number()
    .positive()
    .transform((value) => roundTo(value, 2))
    .pipe(z.number().positive())
    .nullable(),
  designations: z
    .array(
      z
        .string()
        .regex(/^taiwan_small_hundred_peak:(?:0(?:0[1-9]|[1-9][0-9])|100)$/),
    )
    .default([]),
  elevationGainM: z.number().int().nonnegative().nullable(),
  elevationDifferenceM: z.number().int().nonnegative().nullable(),
  durationMinutes: z.number().int().positive().nullable(),
  difficulty: z.number().int().min(0).max(6).nullable(),
  checkpoints: z.array(orderedPlaceSchema).min(1),
  evacuationPoints: z.array(orderedPlaceSchema),
  permitNotes: z.string().nullable(),
  sourceOrganization: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceReferences: z.array(routeSourceReferenceSchema).min(1),
  sourceVersion: z.string().min(1),
  reviewedAt: z.iso.date(),
}).refine(
  ({ startLat, startLng }) => (startLat === null) === (startLng === null),
  { message: 'Start coordinates must both be present or both be null' },
);

export type RouteInput = z.infer<typeof routeInputSchema>;

export const validateRouteInput = (input: unknown) =>
  routeInputSchema.parse(input);

export const routeSourceSchema = z.object({
  organization: z.string().min(1),
  url: z.string().url(),
});

export type RouteSource = z.infer<typeof routeSourceSchema>;

export const requiredSuburbanRouteNames = z
  .array(z.string().min(1))
  .length(100)
  .parse(suburbanRouteNamesJson);

export type RouteCatalogReport = {
  valid: boolean;
  warnings: string[];
  hundredPeaks: number;
  suburbanRoutes: number;
  smallHundredPeaks: number;
  missingSources: number;
  duplicateSlugs: number;
  errors: string[];
};

const countCatalogDesignations = (catalogInput: unknown) => {
  const designationCounts = new Map<string, number>();
  if (!Array.isArray(catalogInput)) return designationCounts;

  for (const route of catalogInput) {
    if (typeof route !== 'object' || route === null) continue;
    const { designations } = route as { designations?: unknown };
    if (!Array.isArray(designations)) continue;
    for (const designation of designations) {
      if (typeof designation !== 'string') continue;
      designationCounts.set(
        designation,
        (designationCounts.get(designation) ?? 0) + 1,
      );
    }
  }

  return designationCounts;
};

export const analyzeRouteCatalog = (
  catalogInput: unknown,
  sourcesInput: unknown,
): RouteCatalogReport => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const catalogResult = z.array(routeInputSchema).safeParse(catalogInput);
  const sourcesResult = z.array(routeSourceSchema).safeParse(sourcesInput);
  if (!catalogResult.success) errors.push('Catalog schema validation failed');
  if (!sourcesResult.success) errors.push('Source registry validation failed');

  const catalog = catalogResult.success ? catalogResult.data : [];
  const sources = sourcesResult.success ? sourcesResult.data : [];
  const designationCounts = countCatalogDesignations(catalogInput);
  const hundredPeaks = catalog.filter(
    ({ kind }) => kind === 'hundred_peak',
  ).length;
  const suburbanRoutes = catalog.filter(({ kind }) => kind === 'suburban').length;
  const smallHundredPeaks = [...designationCounts.values()].reduce(
    (total, count) => total + count,
    0,
  );
  if (hundredPeaks !== 100) {
    errors.push(`Expected exactly 100 hundred peaks, found ${hundredPeaks}`);
  }

  const hundredPeakNames = catalog
    .filter(({ kind }) => kind === 'hundred_peak')
    .map(({ mountainName }) => mountainName);
  const hundredPeakNameSet = new Set(hundredPeakNames);
  const missingHundredPeaks = canonicalHundredPeakNames.filter(
    (name) => !hundredPeakNameSet.has(name),
  );
  const unexpectedHundredPeaks = [...hundredPeakNameSet].filter(
    (name) => !canonicalHundredPeakNames.includes(name),
  );
  if (missingHundredPeaks.length > 0) {
    errors.push(`Missing canonical hundred peaks: ${missingHundredPeaks.join(', ')}`);
  }
  if (unexpectedHundredPeaks.length > 0) {
    errors.push(
      `Unexpected hundred peak names: ${unexpectedHundredPeaks.join(', ')}`,
    );
  }
  if (suburbanRoutes < 100) {
    warnings.push(`Expected at least 100 suburban routes, found ${suburbanRoutes}`);
  }

  const missingSmallHundredPeakDesignations =
    requiredSmallHundredPeakDesignations.filter(
      (designation) => !designationCounts.has(designation),
    );
  const duplicateSmallHundredPeakDesignations = [...designationCounts]
    .filter(([, count]) => count > 1)
    .map(([designation]) => designation);
  const unexpectedSmallHundredPeakDesignations = [...designationCounts]
    .filter(
      ([designation]) =>
        !requiredSmallHundredPeakDesignations.includes(designation),
    )
    .map(([designation]) => designation);
  if (missingSmallHundredPeakDesignations.length > 0) {
    warnings.push(
      `Missing official Small Hundred Peak designations: ${missingSmallHundredPeakDesignations.join(', ')}`,
    );
  }
  if (duplicateSmallHundredPeakDesignations.length > 0) {
    errors.push(
      `Duplicate Small Hundred Peak designations: ${duplicateSmallHundredPeakDesignations.join(', ')}`,
    );
  }
  if (unexpectedSmallHundredPeakDesignations.length > 0) {
    errors.push(
      `Unexpected Small Hundred Peak designations: ${unexpectedSmallHundredPeakDesignations.join(', ')}`,
    );
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
    ({ sourceOrganization, sourceUrl, sourceReferences }) =>
      !sourceKeys.has(`${sourceOrganization}\u0000${sourceUrl}`) ||
      sourceReferences.some(
        ({ organization, url }) => !sourceKeys.has(`${organization}\u0000${url}`),
      ),
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
    warnings.push(
      `Missing required suburban routes: ${missingSuburbanRoutes.join(', ')}`,
    );
  }

  return {
    valid: errors.length === 0,
    warnings,
    hundredPeaks,
    suburbanRoutes,
    smallHundredPeaks,
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
  findActiveVersions(): Promise<Array<{ id: string; slug: string }>>;
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
                designations: routeInputSchema.shape.designations.parse(
                  version.designations,
                ),
                elevationGainM: version.elevationGainMeters,
                elevationDifferenceM: version.elevationDifferenceMeters,
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
                sourceReferences: normalizeStoredRouteSourceReferences(
                  version.sourceOrganization,
                  version.sourceUrl,
                  version.sourceReferences,
                ),
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
          findActiveVersions: async () =>
            transaction
              .select({ id: routeVersions.id, slug: routes.slug })
              .from(routeVersions)
              .innerJoin(routes, eq(routes.id, routeVersions.routeId))
              .where(eq(routeVersions.isActive, true)),
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
              designations: input.designations,
              elevationGainMeters: input.elevationGainM,
              elevationDifferenceMeters: input.elevationDifferenceM,
              durationMinutes: input.durationMinutes,
              difficulty: input.difficulty,
              checkpoints: input.checkpoints,
              evacuationPoints: input.evacuationPoints,
              permitNotes: input.permitNotes,
              sourceOrganization: input.sourceOrganization,
              sourceUrl: input.sourceUrl,
              sourceReferences: input.sourceReferences,
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

    const importedSlugs = new Set(catalog.map(({ slug }) => slug));
    const activeVersions = await transaction.findActiveVersions();
    for (const version of activeVersions) {
      if (!importedSlugs.has(version.slug)) {
        await transaction.deactivateVersion(version.id);
      }
    }
  });
};
