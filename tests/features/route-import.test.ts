import { describe, expect, it } from 'vitest';

import {
  analyzeRouteCatalog,
  canonicalHundredPeakNames,
  importRouteCatalog,
  requiredSuburbanRouteNames,
  type RouteCatalogDatabase,
  type RouteCatalogTransaction,
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
];

const routeFor = (
  mountainName: string,
  kind: 'hundred_peak' | 'suburban',
  index: number,
) => ({
  ...validRoute,
  slug: `${kind.replace('_', '-')}-${index}`,
  mountainName,
  kind,
});

const launchCatalog = [
  ...canonicalHundredPeakNamesFixture.map((name, index) =>
    routeFor(name, 'hundred_peak', index),
  ),
  ...requiredSuburbanRouteNames.map((name, index) =>
    routeFor(name, 'suburban', index),
  ),
];

it('requires traceable source and review metadata', () => {
  expect(validateRouteInput(validRoute).sourceUrl).toMatch(/^https:/);
  expect(() => validateRouteInput({ ...validRoute, sourceUrl: '' })).toThrow();
  expect(() => validateRouteInput({ ...validRoute, checkpoints: [] })).toThrow();
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
    return this.versions.find(
      (version) => version.routeId === routeId && version.isActive,
    );
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

  async createVersion(routeId: string, input: typeof validRoute) {
    this.versions.push({
      id: `version-${this.versions.length + 1}`,
      routeId,
      input: validateRouteInput({
        ...input,
        startLat: Number(input.startLat.toFixed(6)),
        startLng: Number(input.startLng.toFixed(6)),
        distanceKm: Number(input.distanceKm.toFixed(2)),
      }),
      isActive: true,
    });
  }
}

describe('route catalog import', () => {
  it('deactivates routes withdrawn from the full catalog', async () => {
    const tx = new MemoryRouteTransaction();
    const database: RouteCatalogDatabase = {
      transaction: async (callback) => callback(tx),
    };
    const withdrawnRoute = {
      ...validRoute,
      slug: 'qilai-main',
      mountainName: '奇萊主山',
    };

    await importRouteCatalog([validRoute, withdrawnRoute], database);
    await importRouteCatalog([validRoute], database);

    expect(
      (await tx.findActiveVersions()).map(({ slug }) => slug),
    ).toEqual([validRoute.slug]);
  });

  it('canonicalizes database numeric precision before comparing versions', async () => {
    const tx = new MemoryRouteTransaction();
    const database: RouteCatalogDatabase = {
      transaction: async (callback) => callback(tx),
    };
    const highPrecisionRoute = {
      ...validRoute,
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
        [validRoute, { ...validRoute, slug: 'invalid slug' }],
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

    await importRouteCatalog([validRoute], database);
    await importRouteCatalog([validRoute], database);
    await importRouteCatalog(
      [{ ...validRoute, sourceVersion: '2026-07-13', reviewedAt: '2026-07-13' }],
      database,
    );
    await importRouteCatalog(
      [
        {
          ...validRoute,
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
  it('loads the reviewed canonical hundred peak baseline', () => {
    expect(canonicalHundredPeakNames).toEqual(canonicalHundredPeakNamesFixture);
    expect(new Set(canonicalHundredPeakNames).size).toBe(100);
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
    const report = analyzeRouteCatalog([validRoute], []);

    expect(report.valid).toBe(false);
    expect(report.hundredPeaks).toBe(1);
    expect(report.suburbanRoutes).toBe(0);
    expect(report.missingSources).toBe(1);
    expect(report.errors).toContain('Expected exactly 100 hundred peaks, found 1');
    expect(report.errors).toContain('Expected at least 30 suburban routes, found 0');
  });

  it('reports duplicate slugs', () => {
    const report = analyzeRouteCatalog(
      [validRoute, validRoute],
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
