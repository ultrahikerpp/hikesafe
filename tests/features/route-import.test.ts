import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  analyzeRouteCatalog,
  canonicalHundredPeakNames,
  importRouteCatalog,
  normalizeStoredRouteSourceReferences,
  requiredSmallHundredPeakDesignations,
  requiredSuburbanRouteNames,
  type RouteCatalogDatabase,
  type RouteCatalogTransaction,
  type RouteInput,
  type StoredRouteVersion,
  validateRouteInput,
} from '@/src/features/routes/import';
import {
  canonicalHundredPeakNamesFixture,
  validRoute,
} from '@/tests/fixtures/routes';

const sourceRegistry = [
  {
    organization: validRoute.sourceOrganization,
    url: validRoute.sourceUrl,
  },
  {
    organization: '農業部林業及自然保育署',
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=140',
  },
];

const routeWithSourceReferences = {
  ...validRoute,
  sourceReferences: [
    {
      organization: validRoute.sourceOrganization,
      url: validRoute.sourceUrl,
      fields: ['startLat', 'startLng'],
      tier: 'official' as const,
    },
    {
      organization: '農業部林業及自然保育署',
      url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=140',
      fields: [
        'distanceKm',
        'durationMinutes',
        'difficulty',
        'checkpoints',
        'permitNotes',
      ],
      tier: 'official' as const,
    },
  ],
};

const routeFor = (
  mountainName: string,
  kind: 'hundred_peak' | 'suburban',
  index: number,
) => ({
  ...routeWithSourceReferences,
  slug: `${kind.replace('_', '-')}-${index}`,
  mountainName,
  kind,
});

const launchCatalog = [
  ...canonicalHundredPeakNamesFixture.map((name, index) =>
    routeFor(name, 'hundred_peak', index),
  ),
  ...requiredSuburbanRouteNames.map((name, index) => ({
    ...routeFor(name, 'suburban', index),
    designations: [requiredSmallHundredPeakDesignations[index]],
  })),
];

it('requires traceable source and review metadata', () => {
  expect(validateRouteInput(routeWithSourceReferences).sourceUrl).toMatch(
    /^https:/,
  );
  expect(() =>
    validateRouteInput({ ...routeWithSourceReferences, sourceUrl: '' }),
  ).toThrow();
  expect(() =>
    validateRouteInput({ ...routeWithSourceReferences, checkpoints: [] }),
  ).toThrow();
  expect(
    () => validateRouteInput({ ...routeWithSourceReferences, elevationDifferenceM: -1 }),
  ).toThrow();
});

it('accepts a null distance, duration, or difficulty when no official source publishes an exact value', () => {
  const routeWithGaps = validateRouteInput({
    ...routeWithSourceReferences,
    distanceKm: null,
    durationMinutes: null,
    difficulty: null,
  });

  expect(routeWithGaps).toMatchObject({
    distanceKm: null,
    durationMinutes: null,
    difficulty: null,
  });
});

it('defaults a source reference to the official tier and accepts an explicit community tier', () => {
  const officialDefault = validateRouteInput(routeWithSourceReferences);
  expect(officialDefault.sourceReferences.every(({ tier }) => tier === 'official')).toBe(true);

  const withCommunitySource = validateRouteInput({
    ...routeWithSourceReferences,
    sourceReferences: [
      ...routeWithSourceReferences.sourceReferences,
      {
        organization: '健行筆記',
        url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=69',
        fields: ['distanceKm', 'durationMinutes'],
        tier: 'community',
      },
    ],
  });
  expect(withCommunitySource.sourceReferences.at(-1)).toMatchObject({
    organization: '健行筆記',
    tier: 'community',
  });

  expect(() =>
    validateRouteInput({
      ...routeWithSourceReferences,
      sourceReferences: [
        { ...routeWithSourceReferences.sourceReferences[0], tier: 'unofficial' },
      ],
    }),
  ).toThrow();
});

it('requires ordered field-level official source references', () => {
  expect(validateRouteInput(routeWithSourceReferences).sourceReferences).toEqual(
    routeWithSourceReferences.sourceReferences,
  );
  expect(() =>
    validateRouteInput({
      ...routeWithSourceReferences,
      sourceReferences: [],
    }),
  ).toThrow();
  expect(() =>
    validateRouteInput({
      ...routeWithSourceReferences,
      sourceReferences: [
        {
          ...routeWithSourceReferences.sourceReferences[0],
          fields: [],
        },
      ],
    }),
  ).toThrow();
});

class MemoryRouteTransaction implements RouteCatalogTransaction {
  routes = new Map<string, string>();
  versions: StoredRouteVersion[] = [];

  async findRouteId(slug: string) {
    return this.routes.get(slug);
  }

  async createRoute(slug: string) {
    const id = `route-${this.routes.size + 1}`;
    this.routes.set(slug, id);
    return id;
  }

  async findActiveVersion(routeId: string, _slug: string) {
    const version = this.versions.find(
      (version) => version.routeId === routeId && version.isActive,
    );
    if (!version) return undefined;
    return {
      ...version,
      input: validateRouteInput({
        ...version.input,
        sourceReferences: normalizeStoredRouteSourceReferences(
          version.input.sourceOrganization,
          version.input.sourceUrl,
          version.input.sourceReferences,
        ),
      }),
    };
  }

  async deactivateVersion(id: string) {
    const version = this.versions.find((candidate) => candidate.id === id);
    if (version) version.isActive = false;
  }

  async findActiveVersions() {
    return this.versions
      .filter(({ isActive }) => isActive)
      .map((version) => ({
        id: version.id,
        slug:
          [...this.routes].find(([, routeId]) => routeId === version.routeId)?.[0] ??
          '',
      }));
  }

  async createVersion(routeId: string, input: RouteInput) {
    this.versions.push({
      id: `version-${this.versions.length + 1}`,
      routeId,
      input: validateRouteInput({
        ...input,
        startLat:
          input.startLat === null ? null : Number(input.startLat.toFixed(6)),
        startLng:
          input.startLng === null ? null : Number(input.startLng.toFixed(6)),
        distanceKm:
          input.distanceKm === null ? null : Number(input.distanceKm.toFixed(2)),
      }),
      isActive: true,
    });
  }

  addLegacyVersion(routeId: string) {
    this.versions.push({
      id: `version-${this.versions.length + 1}`,
      routeId,
      input: {
        ...routeWithSourceReferences,
        sourceReferences: [],
      } as unknown as RouteInput,
      isActive: true,
    });
  }
}

describe('route catalog import', () => {
  it('derives a primary-source reference when loading a legacy persisted row', () => {
    expect(
      normalizeStoredRouteSourceReferences(
        routeWithSourceReferences.sourceOrganization,
        routeWithSourceReferences.sourceUrl,
        [],
      ),
    ).toEqual([
      {
        organization: routeWithSourceReferences.sourceOrganization,
        url: routeWithSourceReferences.sourceUrl,
        fields: [
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
        ],
        tier: 'official',
      },
    ]);
  });

  it('reimports a legacy active version with empty persisted references', async () => {
    const tx = new MemoryRouteTransaction();
    const routeId = await tx.createRoute(routeWithSourceReferences.slug);
    tx.addLegacyVersion(routeId);
    const database: RouteCatalogDatabase = {
      transaction: async (callback) => callback(tx),
    };

    await importRouteCatalog([routeWithSourceReferences], database);

    expect(tx.versions).toHaveLength(2);
    expect(tx.versions.map(({ isActive }) => isActive)).toEqual([false, true]);
    expect(tx.versions[1]?.input.sourceReferences).toEqual(
      routeWithSourceReferences.sourceReferences,
    );
  });

  it('preserves official source gaps through validation and import', async () => {
    const routeWithOfficialGaps = validateRouteInput({
      ...routeWithSourceReferences,
      startLat: null,
      startLng: null,
      permitNotes: null,
      difficulty: 0,
    });
    const tx = new MemoryRouteTransaction();
    const database: RouteCatalogDatabase = {
      transaction: async (callback) => callback(tx),
    };

    await importRouteCatalog([routeWithOfficialGaps], database);

    expect(tx.versions[0]?.input).toMatchObject({
      startLat: null,
      startLng: null,
      permitNotes: null,
      difficulty: 0,
      sourceReferences: routeWithSourceReferences.sourceReferences,
    });
  });

  it('rejects inferred coordinates and out-of-range official difficulty', () => {
    expect(() =>
      validateRouteInput({ ...routeWithSourceReferences, difficulty: 7 }),
    ).toThrow();
    expect(() =>
      validateRouteInput({ ...routeWithSourceReferences, startLat: null }),
    ).toThrow();
    expect(() =>
      validateRouteInput({ ...routeWithSourceReferences, startLng: null }),
    ).toThrow();
  });

  it('deactivates routes withdrawn from the full catalog', async () => {
    const tx = new MemoryRouteTransaction();
    const database: RouteCatalogDatabase = {
      transaction: async (callback) => callback(tx),
    };
    const withdrawnRoute = {
      ...routeWithSourceReferences,
      slug: 'qilai-main',
      mountainName: '奇萊主山',
    };

    await importRouteCatalog(
      [routeWithSourceReferences, withdrawnRoute],
      database,
    );
    await importRouteCatalog([routeWithSourceReferences], database);

    expect(
      (await tx.findActiveVersions()).map(({ slug }) => slug),
    ).toEqual([routeWithSourceReferences.slug]);
  });

  it('canonicalizes database numeric precision before comparing versions', async () => {
    const tx = new MemoryRouteTransaction();
    const database: RouteCatalogDatabase = {
      transaction: async (callback) => callback(tx),
    };
    const highPrecisionRoute = {
      ...routeWithSourceReferences,
      startLat: 24.18191234,
      startLng: 121.28141234,
      distanceKm: 5.234,
    };

    await importRouteCatalog([highPrecisionRoute], database);
    await importRouteCatalog([highPrecisionRoute], database);

    expect(tx.versions).toHaveLength(1);
    expect(tx.versions[0]?.input).toMatchObject({
      startLat: 24.181912,
      startLng: 121.281412,
      distanceKm: 5.23,
    });
  });

  it('validates the whole catalog before opening a transaction', async () => {
    let transactionOpened = false;
    const database: RouteCatalogDatabase = {
      transaction: async () => {
        transactionOpened = true;
      },
    };

    await expect(
      importRouteCatalog(
        [
          routeWithSourceReferences,
          { ...routeWithSourceReferences, slug: 'invalid slug' },
        ],
        database,
      ),
    ).rejects.toThrow();
    expect(transactionOpened).toBe(false);
  });

  it('adds immutable versions for source or reviewed content changes', async () => {
    const tx = new MemoryRouteTransaction();
    const database: RouteCatalogDatabase = {
      transaction: async (callback) => callback(tx),
    };

    await importRouteCatalog([routeWithSourceReferences], database);
    await importRouteCatalog([routeWithSourceReferences], database);
    await importRouteCatalog(
      [
        {
          ...routeWithSourceReferences,
          sourceVersion: '2026-07-13',
          reviewedAt: '2026-07-13',
        },
      ],
      database,
    );
    await importRouteCatalog(
      [
        {
          ...routeWithSourceReferences,
          routeName: '小風口原路往返',
          sourceVersion: '2026-07-13',
          reviewedAt: '2026-07-13',
        },
      ],
      database,
    );

    expect(tx.versions).toHaveLength(3);
    expect(tx.versions.map(({ isActive }) => isActive)).toEqual([
      false,
      false,
      true,
    ]);
    expect(tx.versions[0]?.input.sourceVersion).toBe('2026-07-12');
  });
});

describe('launch catalog verification', () => {
  it('loads each official Small Hundred Peak number exactly once', () => {
    const canonicalSmallHundredPeakNumbers =
      requiredSmallHundredPeakDesignations.map((designation) =>
        Number(designation.slice(-3)),
      );

    expect(canonicalSmallHundredPeakNumbers).toEqual(
      Array.from({ length: 100 }, (_, index) => index + 1),
    );
    expect(new Set(canonicalSmallHundredPeakNumbers).size).toBe(100);
  });

  it('prints the Small Hundred Peak report count in the CLI', () => {
    const cli = readFileSync('scripts/verify-route-catalog.ts', 'utf8');

    expect(cli).toContain(
      "console.log('Small hundred peaks: ' + report.smallHundredPeaks);",
    );
  });

  it('loads the reviewed canonical hundred peak baseline', () => {
    expect(canonicalHundredPeakNames).toEqual(canonicalHundredPeakNamesFixture);
    expect(new Set(canonicalHundredPeakNames).size).toBe(100);
    expect(requiredSuburbanRouteNames).toHaveLength(100);
    expect(requiredSmallHundredPeakDesignations).toHaveLength(100);
  });

  it('counts Small Hundred Peak designations independently of route kind', () => {
    const report = analyzeRouteCatalog(launchCatalog, sourceRegistry);

    expect(report.valid).toBe(true);
    expect(report.suburbanRoutes).toBe(100);
    expect(report.smallHundredPeaks).toBe(100);
  });

  it('accepts a partial suburban and Small Hundred Peak catalog with warnings', () => {
    const partialCatalog = [
      ...canonicalHundredPeakNamesFixture.map((name, index) =>
        routeFor(name, 'hundred_peak', index),
      ),
      {
        ...routeFor(requiredSuburbanRouteNames[0], 'suburban', 0),
        designations: [requiredSmallHundredPeakDesignations[0]],
      },
    ];

    const report = analyzeRouteCatalog(partialCatalog, sourceRegistry);

    expect(report.valid).toBe(true);
    expect(report.warnings).toContain(
      'Expected at least 100 suburban routes, found 1',
    );
    expect(report.warnings).toContain(
      `Missing official Small Hundred Peak designations: ${requiredSmallHundredPeakDesignations.slice(1).join(', ')}`,
    );
  });

  it('requires every field-level source to be registered', () => {
    const catalog = launchCatalog.map((route, index) =>
      index === 0
        ? {
            ...route,
            sourceReferences: [
              {
                ...route.sourceReferences[0],
                url: 'https://example.gov.tw/unregistered',
              },
            ],
          }
        : route,
    );

    expect(analyzeRouteCatalog(catalog, sourceRegistry).valid).toBe(false);
  });

  it('rejects missing or duplicate Small Hundred Peak designations', () => {
    const missing = launchCatalog.map((route, index) =>
      index === 100 ? { ...route, designations: [] } : route,
    );
    const duplicated = launchCatalog.map((route, index) =>
      index === 101
        ? { ...route, designations: [requiredSmallHundredPeakDesignations[0]] }
        : route,
    );

    expect(analyzeRouteCatalog(missing, sourceRegistry).valid).toBe(true);
    expect(analyzeRouteCatalog(missing, sourceRegistry).warnings).toContain(
      'Missing official Small Hundred Peak designations: taiwan_small_hundred_peak:001',
    );
    expect(analyzeRouteCatalog(duplicated, sourceRegistry).valid).toBe(false);
  });

  it('reports unexpected Small Hundred Peak designations before schema rejection', () => {
    const catalog = launchCatalog.map((route, index) =>
      index === 100
        ? { ...route, designations: ['taiwan_small_hundred_peak:101'] }
        : route,
    );

    const report = analyzeRouteCatalog(catalog, sourceRegistry);

    expect(report.errors).toContain('Catalog schema validation failed');
    expect(report.errors).toContain(
      'Unexpected Small Hundred Peak designations: taiwan_small_hundred_peak:101',
    );
  });

  it('requires the exact canonical hundred peak set, not any 100 names', () => {
    expect(analyzeRouteCatalog(launchCatalog, sourceRegistry).valid).toBe(true);

    const arbitraryNames = launchCatalog.map((route, index) =>
      route.kind === 'hundred_peak'
        ? { ...route, mountainName: `任意山-${index}` }
        : route,
    );

    expect(analyzeRouteCatalog(arbitraryNames, sourceRegistry).valid).toBe(
      false,
    );
  });

  it('rejects a missing, duplicated, or misspelled canonical peak', () => {
    const missing = launchCatalog.filter(
      ({ mountainName }) => mountainName !== '玉山',
    );
    const duplicated = launchCatalog.map((route) =>
      route.mountainName === '雪山' ? { ...route, mountainName: '玉山' } : route,
    );
    const misspelled = launchCatalog.map((route) =>
      route.mountainName === '玉山' ? { ...route, mountainName: '玉山主峰' } : route,
    );

    for (const catalog of [missing, duplicated, misspelled]) {
      expect(analyzeRouteCatalog(catalog, sourceRegistry).valid).toBe(false);
    }
  });

  it('uses the approved suburban route names verbatim', () => {
    expect(requiredSuburbanRouteNames).toContain('鵝公髻山');
    expect(requiredSuburbanRouteNames).not.toContain('鵝公髮山');
  });

  it('blocks launch when required route coverage or sources are missing', () => {
    const report = analyzeRouteCatalog([routeWithSourceReferences], []);

    expect(report.valid).toBe(false);
    expect(report.hundredPeaks).toBe(1);
    expect(report.suburbanRoutes).toBe(0);
    expect(report.missingSources).toBe(1);
    expect(report.errors).toContain('Expected exactly 100 hundred peaks, found 1');
    expect(report.warnings).toContain('Expected at least 100 suburban routes, found 0');
  });

  it('reports duplicate slugs', () => {
    const report = analyzeRouteCatalog(
      [routeWithSourceReferences, routeWithSourceReferences],
      [
        {
          organization: validRoute.sourceOrganization,
          url: validRoute.sourceUrl,
        },
      ],
    );

    expect(report.duplicateSlugs).toBe(1);
    expect(report.errors).toContain(
      'Duplicate slugs: hehuan-north-xiaofengkou',
    );
  });
});
