import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react/pure';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TripForm } from '@/app/trips/new/TripForm';
import type { QuickRouteOption } from '@/app/trips/new/quick-trip-form';
import { copy } from '@/src/features/i18n/copy';

const copyName = (value: string) => new RegExp(value
  .split('\n')
  .map((line) => line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('\\s+'));

const route: QuickRouteOption = {
  id: 'route-version-1',
  region: '南投縣',
  mountainName: '合歡山主峰',
  routeName: '合歡山主峰線',
  durationMinutes: 240,
  sourceOrganization: '太魯閣國家公園管理處',
  sourceUrl: 'https://www.taroko.gov.tw/',
  sourceVersion: '2026-07-12',
  reviewedAt: '2026-07-12',
};

const binding = {
  id: 'binding-1', sourceType: 'user', displayName: '小玉',
  sourceId: 'U-guardian', boundAt: '2026-07-18T00:00:00.000Z',
};

const defaults = {
  routeVersionId: route.id,
  guardianBindingIds: [binding.id],
  vehicle: '汽車 ABC-1234',
  equipment: ['頭燈'],
  leaderPhone: '0912345678',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json' },
});

const installFetch = (options: {
  defaultsResponse?: Promise<Response>;
  defaultsStatus?: number;
  routes?: QuickRouteOption[][];
  routesStatus?: number;
  tripReject?: boolean;
  tripStatus?: number;
} = {}) => {
  let routeRequests = 0;
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (input === undefined) return json({});
    if (url === '/api/routes') return options.routesStatus
      ? json({ error: 'Route catalog unavailable' }, options.routesStatus)
      : json({ routes: options.routes?.[routeRequests++] ?? [route] });
    if (url === '/api/guardian-bindings') return json({ bindings: [binding] });
    if (url === '/api/trips/quick-defaults') return options.defaultsResponse
      ?? (options.defaultsStatus
      ? json({ error: 'Quick defaults unavailable' }, options.defaultsStatus)
      : json({ defaults }));
    if (url === '/api/trips' && init?.method === 'POST') {
      if (options.tripReject) throw new Error('Network unavailable');
      return options.tripStatus
      ? json({ error: 'Guardian binding is not active' }, options.tripStatus)
      : json({ tripId: 'trip-1' }, 201);
    }
    throw new Error(`Unexpected fetch: ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('TripForm quick creation', () => {
  beforeEach(() => installFetch());
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('requires an explicit previous-route action and keeps a manually edited finish time', async () => {
    render(<TripForm />);

    const routeSelect = await screen.findByRole('combobox', { name: copyName(copy.route) });
    expect(routeSelect).toHaveValue('');
    fireEvent.click(await screen.findByRole('button', { name: copyName(copy.useLastRoute(route.routeName)) }));
    expect(routeSelect).toHaveValue(route.id);

    fireEvent.change(screen.getByLabelText(copyName(copy.startsAt)), { target: { value: '2026-07-18T08:00' } });
    expect(screen.getByLabelText(copyName(copy.plannedFinishAt))).toHaveValue('2026-07-18T12:00');

    fireEvent.change(screen.getByLabelText(copyName(copy.plannedFinishAt)), { target: { value: '2026-07-18T13:00' } });
    fireEvent.change(screen.getByLabelText(copyName(copy.startsAt)), { target: { value: '2026-07-18T09:00' } });
    expect(screen.getByLabelText(copyName(copy.plannedFinishAt))).toHaveValue('2026-07-18T13:00');
  });

  it('prefills active guardians and emergency details but requires final confirmation', async () => {
    render(<TripForm />);
    fireEvent.click(await screen.findByRole('button', { name: copyName(copy.useLastRoute(route.routeName)) }));

    expect(await screen.findByRole('checkbox', { name: '小玉' })).toBeChecked();
    fireEvent.click(screen.getByText(copyName(copy.tripEmergencyDetails)));
    expect(screen.getByLabelText(copyName(copy.vehicle))).toHaveValue('汽車 ABC-1234');
    expect(screen.getByLabelText(copyName(copy.equipment))).toHaveValue('頭燈');
    expect(screen.getByLabelText(copyName(copy.leaderPhone))).toHaveValue('0912345678');

    const submit = screen.getByRole('button', { name: copyName(copy.createTripDraft) });
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: copyName(copy.confirmTripDetails) }));
    expect(submit).toBeEnabled();
  });

  it('shows an unavailable-duration note and does not auto-fill the finish time for a route with no published duration', async () => {
    const routeWithoutDuration = { ...route, id: 'route-version-3', durationMinutes: null };
    vi.unstubAllGlobals();
    installFetch({ routes: [[routeWithoutDuration]] });
    render(<TripForm />);

    await screen.findByRole('option', { name: '南投縣｜合歡山主峰｜合歡山主峰線' });
    fireEvent.change(screen.getByLabelText(copyName(copy.route)), { target: { value: routeWithoutDuration.id } });

    expect(screen.getByText(copyName(copy.routeSourceMissingDuration(route.sourceOrganization, route.sourceVersion, route.reviewedAt)))).toBeInTheDocument();
    expect(screen.getByLabelText(copyName(copy.plannedFinishAt))).toHaveValue('');
  });

  it('warns when the selected route cites a community source', async () => {
    const communityRoute = {
      ...route,
      id: 'route-version-4',
      sourceReferences: [
        { organization: '健行筆記', url: 'https://hiking.biji.co/', fields: ['distanceKm'], tier: 'community' as const },
      ],
    };
    vi.unstubAllGlobals();
    installFetch({ routes: [[communityRoute]] });
    render(<TripForm />);

    await screen.findByRole('option', { name: '南投縣｜合歡山主峰｜合歡山主峰線' });
    fireEvent.change(screen.getByLabelText(copyName(copy.route)), { target: { value: communityRoute.id } });

    expect(screen.getByText(copyName(copy.communitySourceWarning))).toBeInTheDocument();
  });

  it('keeps a confirmed selected route visible when searching for another route', async () => {
    const alternateRoute = { ...route, id: 'route-version-2', routeName: '奇萊山主峰線' };
    vi.unstubAllGlobals();
    installFetch({ routes: [[route, alternateRoute]] });
    render(<TripForm />);

    await screen.findByRole('option', { name: '南投縣｜合歡山主峰｜奇萊山主峰線' });
    fireEvent.change(screen.getByLabelText(copyName(copy.route)), { target: { value: route.id } });
    fireEvent.click(screen.getByRole('checkbox', { name: copyName(copy.confirmTripDetails) }));
    fireEvent.change(screen.getByLabelText(copyName(copy.searchVerifiedRoutes)), { target: { value: '奇萊' } });

    expect(screen.getByLabelText(copyName(copy.route))).toHaveValue(route.id);
    expect(screen.getByRole('option', { name: '南投縣｜合歡山主峰｜合歡山主峰線' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: copyName(copy.createTripDraft) })).toBeEnabled();
  });

  it('remains usable from empty fields when quick defaults are unavailable', async () => {
    vi.unstubAllGlobals();
    installFetch({ defaultsStatus: 503 });
    render(<TripForm />);

    expect(await screen.findByRole('option', { name: '南投縣｜合歡山主峰｜合歡山主峰線' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /使用上次路線|Use previous route/ })).not.toBeInTheDocument();
  });

  it('blocks creation when the verified route catalog is unavailable', async () => {
    vi.unstubAllGlobals();
    installFetch({ routesStatus: 503 });
    render(<TripForm />);

    expect(await screen.findByRole('alert')).toHaveTextContent(copyName(copy.routeLoadError()));
    expect(screen.getByRole('button', { name: copyName(copy.createTripDraft) })).toBeDisabled();
  });

  it('uses the existing create endpoint and refreshes stale server-validated choices', async () => {
    vi.unstubAllGlobals();
    const fetchMock = installFetch({ tripStatus: 422 });
    render(<TripForm />);
    fireEvent.click(await screen.findByRole('button', { name: copyName(copy.useLastRoute(route.routeName)) }));
    fireEvent.click(screen.getByRole('checkbox', { name: copyName(copy.confirmTripDetails) }));
    fireEvent.click(screen.getByRole('button', { name: copyName(copy.createTripDraft) }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Guardian binding is not active');
    const createCall = fetchMock.mock.calls.find(([url, init]) =>
      url === '/api/trips' && init?.method === 'POST');
    expect(createCall).toBeDefined();
    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({
      routeVersionId: route.id,
      guardianBindingIds: [binding.id],
      members: [],
      vehicle: '汽車 ABC-1234',
    });
    await waitFor(() => {
      expect(fetchMock.mock.calls.filter(([url]) => url === '/api/routes')).toHaveLength(2);
      expect(fetchMock.mock.calls.filter(([url]) => url === '/api/guardian-bindings')).toHaveLength(2);
    });
  });

  it('clears a selected route that is removed during failed-creation refresh', async () => {
    vi.unstubAllGlobals();
    const fetchMock = installFetch({ routes: [[route], []], tripStatus: 422 });
    render(<TripForm />);
    fireEvent.click(await screen.findByRole('button', { name: copyName(copy.useLastRoute(route.routeName)) }));
    fireEvent.click(screen.getByRole('checkbox', { name: copyName(copy.confirmTripDetails) }));
    const submit = screen.getByRole('button', { name: copyName(copy.createTripDraft) });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => {
      expect(fetchMock.mock.calls.filter(([url]) => url === '/api/routes')).toHaveLength(2);
      expect(screen.getByLabelText(copyName(copy.route))).toHaveValue('');
    });
    expect(submit).toBeDisabled();
  });

  it('does not let late defaults overwrite user-confirmed choices', async () => {
    let resolveDefaults: (response: Response) => void;
    const defaultsResponse = new Promise<Response>((resolve) => { resolveDefaults = resolve; });
    const alternateRoute = { ...route, id: 'route-version-2', routeName: '合歡山東峰線' };
    vi.unstubAllGlobals();
    installFetch({ defaultsResponse, routes: [[route, alternateRoute]] });
    render(<TripForm />);

    await screen.findByRole('option', { name: '南投縣｜合歡山主峰｜合歡山東峰線' });
    fireEvent.change(screen.getByLabelText(copyName(copy.route)), { target: { value: route.id } });
    fireEvent.change(screen.getByLabelText(copyName(copy.startsAt)), { target: { value: '2026-07-18T08:00' } });
    fireEvent.click(screen.getByRole('checkbox', { name: '小玉' }));
    fireEvent.click(screen.getByText(copyName(copy.tripEmergencyDetails)));
    fireEvent.change(screen.getByLabelText(copyName(copy.vehicle)), { target: { value: '步行' } });
    fireEvent.change(screen.getByLabelText(copyName(copy.equipment)), { target: { value: '雨衣' } });
    fireEvent.change(screen.getByLabelText(copyName(copy.leaderPhone)), { target: { value: '0987654321' } });
    fireEvent.click(screen.getByRole('checkbox', { name: copyName(copy.confirmTripDetails) }));

    resolveDefaults(json({
      defaults: { ...defaults, routeVersionId: alternateRoute.id, vehicle: '汽車 XYZ-5678', equipment: ['頭燈'], leaderPhone: '0912345678' },
    }));

    await waitFor(() => expect(screen.getByLabelText(copyName(copy.route))).toHaveValue(route.id));
    expect(screen.getByLabelText(copyName(copy.vehicle))).toHaveValue('步行');
    expect(screen.getByLabelText(copyName(copy.equipment))).toHaveValue('雨衣');
    expect(screen.getByLabelText(copyName(copy.leaderPhone))).toHaveValue('0987654321');
    expect(screen.getByRole('checkbox', { name: '小玉' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: copyName(copy.confirmTripDetails) })).toBeChecked();
  });

  it('recovers from a rejected create request without showing success', async () => {
    vi.unstubAllGlobals();
    const fetchMock = installFetch({ tripReject: true });
    render(<TripForm />);
    fireEvent.click(await screen.findByRole('button', { name: copyName(copy.useLastRoute(route.routeName)) }));
    fireEvent.click(screen.getByRole('checkbox', { name: copyName(copy.confirmTripDetails) }));
    fireEvent.click(screen.getByRole('button', { name: copyName(copy.createTripDraft) }));

    expect(await screen.findByRole('alert')).toHaveTextContent(copyName(copy.createTripError));
    expect(screen.getByRole('button', { name: copyName(copy.createTripDraft) })).toBeDisabled();
    await waitFor(() => {
      expect(fetchMock.mock.calls.filter(([url]) => url === '/api/routes')).toHaveLength(2);
      expect(fetchMock.mock.calls.filter(([url]) => url === '/api/guardian-bindings')).toHaveLength(2);
    });
  });
});
