import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react/pure';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TripForm } from '@/app/trips/new/TripForm';

const route = {
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

const installFetch = (options: { defaultsStatus?: number; routesStatus?: number; tripStatus?: number } = {}) => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (input === undefined) return json({});
    if (url === '/api/routes') return options.routesStatus
      ? json({ error: 'Route catalog unavailable' }, options.routesStatus)
      : json({ routes: [route] });
    if (url === '/api/guardian-bindings') return json({ bindings: [binding] });
    if (url === '/api/trips/quick-defaults') return options.defaultsStatus
      ? json({ error: 'Quick defaults unavailable' }, options.defaultsStatus)
      : json({ defaults });
    if (url === '/api/trips' && init?.method === 'POST') return options.tripStatus
      ? json({ error: 'Guardian binding is not active' }, options.tripStatus)
      : json({ tripId: 'trip-1' }, 201);
    throw new Error(`Unexpected fetch: ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('TripForm quick creation', () => {
  beforeEach(() => installFetch());
  afterEach(cleanup);

  it('requires an explicit previous-route action and keeps a manually edited finish time', async () => {
    render(<TripForm />);

    const routeSelect = await screen.findByRole('combobox', { name: '路線' });
    expect(routeSelect).toHaveValue('');
    fireEvent.click(await screen.findByRole('button', { name: '使用上次路線：合歡山主峰線' }));
    expect(routeSelect).toHaveValue(route.id);

    fireEvent.change(screen.getByLabelText('出發時間'), { target: { value: '2026-07-18T08:00' } });
    expect(screen.getByLabelText('預計下山時間')).toHaveValue('2026-07-18T12:00');

    fireEvent.change(screen.getByLabelText('預計下山時間'), { target: { value: '2026-07-18T13:00' } });
    fireEvent.change(screen.getByLabelText('出發時間'), { target: { value: '2026-07-18T09:00' } });
    expect(screen.getByLabelText('預計下山時間')).toHaveValue('2026-07-18T13:00');
  });

  it('prefills active guardians and emergency details but requires final confirmation', async () => {
    render(<TripForm />);
    fireEvent.click(await screen.findByRole('button', { name: '使用上次路線：合歡山主峰線' }));

    expect(await screen.findByRole('checkbox', { name: '小玉' })).toBeChecked();
    fireEvent.click(screen.getByText('行程與緊急資料'));
    expect(screen.getByLabelText('交通工具')).toHaveValue('汽車 ABC-1234');
    expect(screen.getByLabelText('裝備（每行一項）')).toHaveValue('頭燈');
    expect(screen.getByLabelText('領隊聯絡電話（供留守聯絡）')).toHaveValue('0912345678');

    const submit = screen.getByRole('button', { name: '建立行程草稿' });
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: '我已確認路線、預計下山時間與留守人' }));
    expect(submit).toBeEnabled();
  });

  it('remains usable from empty fields when quick defaults are unavailable', async () => {
    vi.unstubAllGlobals();
    installFetch({ defaultsStatus: 503 });
    render(<TripForm />);

    expect(await screen.findByRole('option', { name: '南投縣｜合歡山主峰｜合歡山主峰線' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /使用上次路線/ })).not.toBeInTheDocument();
  });

  it('blocks creation when the verified route catalog is unavailable', async () => {
    vi.unstubAllGlobals();
    installFetch({ routesStatus: 503 });
    render(<TripForm />);

    expect(await screen.findByRole('alert')).toHaveTextContent('目前沒有可用的已啟用路線版本');
    expect(screen.getByRole('button', { name: '建立行程草稿' })).toBeDisabled();
  });

  it('uses the existing create endpoint and refreshes stale server-validated choices', async () => {
    vi.unstubAllGlobals();
    const fetchMock = installFetch({ tripStatus: 422 });
    render(<TripForm />);
    fireEvent.click(await screen.findByRole('button', { name: '使用上次路線：合歡山主峰線' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '我已確認路線、預計下山時間與留守人' }));
    fireEvent.click(screen.getByRole('button', { name: '建立行程草稿' }));

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
});
