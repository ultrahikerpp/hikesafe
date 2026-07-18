import { beforeEach, describe, expect, it, vi } from 'vitest';

import { validRoute } from '@/tests/fixtures/routes';

vi.mock('@/src/features/routes/catalog', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/src/features/routes/catalog')>();
  return { ...original, searchRoutes: vi.fn() };
});

import { GET } from '@/app/api/routes/route';
import {
  filterRoutes,
  searchRoutes,
  type RouteCatalogRecord,
} from '@/src/features/routes/catalog';

const activeRoute: RouteCatalogRecord = {
  id: 'version-active',
  routeId: 'route-1',
  isActive: true,
  ...validRoute,
  designations: ['taiwan_small_hundred_peak:001'],
  sourceReferences: [
    {
      organization: validRoute.sourceOrganization,
      url: validRoute.sourceUrl,
      fields: ['startLat', 'startLng'],
      tier: 'official' as const,
    },
    {
      organization: validRoute.sourceOrganization,
      url: validRoute.sourceUrl,
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

describe('route catalog search', () => {
  it('normalizes substring queries and excludes superseded versions', () => {
    const routes = [
      activeRoute,
      {
        ...activeRoute,
        id: 'version-old',
        sourceVersion: '2026-07-11',
        reviewedAt: '2026-07-11',
        isActive: false,
      },
      {
        ...activeRoute,
        id: 'version-other',
        routeId: 'route-2',
        slug: 'qilai-main',
        mountainName: '奇萊主山',
      },
    ];

    expect(
      filterRoutes(routes, { q: '  合歡  ', kind: 'hundred_peak' }).map(
        ({ id }) => id,
      ),
    ).toEqual(['version-active']);
  });

  it('filters by region', () => {
    expect(filterRoutes([activeRoute], { region: '花蓮縣' })).toEqual([]);
  });
});

describe('GET /api/routes', () => {
  beforeEach(() => vi.mocked(searchRoutes).mockReset());

  it('returns approved versions with source metadata', async () => {
    vi.mocked(searchRoutes).mockResolvedValue([activeRoute]);

    const response = await GET(
      new Request(
        'http://localhost/api/routes?q=%E5%90%88%E6%AD%A1&kind=hundred_peak',
      ),
    );
    const body = await response.json();

    expect(searchRoutes).toHaveBeenCalledWith({
      q: '合歡',
      region: undefined,
      kind: 'hundred_peak',
    });
    expect(body.routes).toEqual([
      expect.objectContaining({
        id: 'version-active',
        designations: ['taiwan_small_hundred_peak:001'],
        elevationGainM: null,
        elevationDifferenceM: 597,
        sourceUrl: 'https://www.taroko.gov.tw/',
        sourceReferences: activeRoute.sourceReferences,
        sourceVersion: '2026-07-12',
        reviewedAt: '2026-07-12',
      }),
    ]);
  });

  it('returns official source gaps without inferred replacements', async () => {
    vi.mocked(searchRoutes).mockResolvedValue([
      {
        ...activeRoute,
        startLat: null,
        startLng: null,
        permitNotes: null,
        difficulty: 0,
      },
    ]);

    const response = await GET(new Request('http://localhost/api/routes'));
    const body = await response.json();

    expect(body.routes[0]).toMatchObject({
      startLat: null,
      startLng: null,
      permitNotes: null,
      difficulty: 0,
    });
  });

  it('returns a null distance, duration, or difficulty when no source publishes an exact value', async () => {
    vi.mocked(searchRoutes).mockResolvedValue([
      {
        ...activeRoute,
        distanceKm: null,
        durationMinutes: null,
        difficulty: null,
        sourceReferences: [
          ...activeRoute.sourceReferences,
          {
            organization: '健行筆記',
            url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=69',
            fields: ['distanceKm'],
            tier: 'community',
          },
        ],
      },
    ]);

    const response = await GET(new Request('http://localhost/api/routes'));
    const body = await response.json();

    expect(body.routes[0]).toMatchObject({
      distanceKm: null,
      durationMinutes: null,
      difficulty: null,
    });
    expect(body.routes[0].sourceReferences.at(-1)).toMatchObject({ tier: 'community' });
  });
});
