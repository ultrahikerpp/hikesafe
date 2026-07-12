import { expect, it } from 'vitest';

import {
  searchRoutes,
  type RouteCatalogRecord,
  type RouteCatalogRepository,
} from '@/src/features/routes/catalog';
import { validRoute } from '@/tests/fixtures/routes';

it('accepts an active-route repository for contract testing', () => {
  expect(searchRoutes.length).toBe(2);
});

it('searches repository records without mocking searchRoutes', async () => {
  const activeRoute: RouteCatalogRecord = {
    id: 'active-version',
    routeId: 'route-1',
    isActive: true,
    ...validRoute,
  };
  const repository: RouteCatalogRepository = {
    findActiveRoutes: async () => [
      activeRoute,
      { ...activeRoute, id: 'withdrawn-version', isActive: false },
    ],
  };

  await expect(
    searchRoutes({ q: '合歡', kind: 'hundred_peak' }, repository),
  ).resolves.toEqual([activeRoute]);
});
