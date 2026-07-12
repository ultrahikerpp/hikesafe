import { describe, expect, it } from 'vitest';

import {
  analyzeRouteCatalog,
  importRouteCatalog,
  requiredSuburbanRouteNames,
  type RouteCatalogDatabase,
  type RouteCatalogTransaction,
  type StoredRouteVersion,
  validateRouteInput,
} from '@/src/features/routes/import';
import { validRoute } from '@/tests/fixtures/routes';

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

  async createVersion(routeId: string, input: typeof validRoute) {
    this.versions.push({
      id: `version-${this.versions.length + 1}`,
      routeId,
      input: validateRouteInput(input),
      isActive: true,
    });
  }
}

describe('route catalog import', () => {
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
