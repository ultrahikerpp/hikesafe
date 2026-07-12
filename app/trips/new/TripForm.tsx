'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

interface RouteOption {
  id: string;
  region: string;
  mountainName: string;
  routeName: string;
  sourceOrganization: string;
  sourceUrl: string;
  sourceVersion: string;
  reviewedAt: string;
}

const splitLines = (value: string) => value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);

export function TripForm() {
  const [step, setStep] = useState(1);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [routeVersionId, setRouteVersionId] = useState('');
  const [region, setRegion] = useState('');
  const [mountain, setMountain] = useState('');
  const [deputyId, setDeputyId] = useState('');
  const [memberIds, setMemberIds] = useState('');
  const [guardianBindingIds, setGuardianBindingIds] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [plannedFinishAt, setPlannedFinishAt] = useState('');
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [error, setError] = useState('');
  const [createdTripId, setCreatedTripId] = useState('');

  useEffect(() => {
    void fetch('/api/routes').then(async (response) => {
      if (!response.ok) throw new Error('Route catalog unavailable');
      const body = await response.json() as { routes: RouteOption[] };
      setRoutes(body.routes);
    }).catch(() => setError('目前沒有可用的已啟用路線版本。正式路線目錄尚未通過安全驗證時，無法建立行程。'));
  }, []);

  const regions = useMemo(() => [...new Set(routes.map((route) => route.region))], [routes]);
  const mountains = useMemo(() => [...new Set(routes
    .filter((route) => !region || route.region === region)
    .map((route) => route.mountainName))], [region, routes]);
  const availableRoutes = useMemo(() => routes.filter((route) =>
    (!region || route.region === region) && (!mountain || route.mountainName === mountain),
  ), [mountain, region, routes]);
  const selectedRoute = routes.find((route) => route.id === routeVersionId);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const members = [
      ...(deputyId ? [{ userId: deputyId, role: 'deputy' }] : []),
      ...splitLines(memberIds).map((userId) => ({ userId, role: 'member' })),
    ];
    const response = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        routeVersionId,
        startsAt: new Date(startsAt).toISOString(),
        plannedFinishAt: new Date(plannedFinishAt).toISOString(),
        members,
        guardianBindingIds: splitLines(guardianBindingIds),
        vehicle,
        equipment: splitLines(equipment),
        idempotencyKey,
      }),
    });
    const body = await response.json() as { tripId?: string; error?: string };
    if (!response.ok || !body.tripId) {
      setError(body.error ?? '無法建立行程');
      return;
    }
    setCreatedTripId(body.tripId);
  };

  if (createdTripId) return <p>行程草稿已建立：{createdTripId}</p>;

  return <form className="trip-form" onSubmit={submit}>
    <h1>建立行程</h1>
    <p>步驟 {step} / 3</p>
    {step === 1 && <section>
      <h2>1. 選擇路線</h2>
      <p>只會列出資料庫中已啟用的 route version；這不是正式 catalog 已就緒的宣告。</p>
      <label>區域<select value={region} onChange={(event) => { setRegion(event.target.value); setMountain(''); setRouteVersionId(''); }}>
        <option value="">請選擇</option>{regions.map((value) => <option key={value}>{value}</option>)}
      </select></label>
      <label>山岳<select value={mountain} onChange={(event) => { setMountain(event.target.value); setRouteVersionId(''); }}>
        <option value="">請選擇</option>{mountains.map((value) => <option key={value}>{value}</option>)}
      </select></label>
      <label>路線<select required value={routeVersionId} onChange={(event) => setRouteVersionId(event.target.value)}>
        <option value="">請選擇</option>{availableRoutes.map((route) => <option key={route.id} value={route.id}>{route.routeName}</option>)}
      </select></label>
      {selectedRoute && <p>來源：<a href={selectedRoute.sourceUrl}>{selectedRoute.sourceOrganization}</a>；版本 {selectedRoute.sourceVersion}；覆核 {selectedRoute.reviewedAt}</p>}
      <button type="button" disabled={!routeVersionId} onClick={() => setStep(2)}>下一步</button>
    </section>}
    {step === 2 && <section>
      <h2>2. 隊員與角色</h2>
      <p>目前登入者會自動設為隊長。</p>
      <label>副領隊使用者 ID<input value={deputyId} onChange={(event) => setDeputyId(event.target.value)} /></label>
      <label>成員使用者 ID（每行一位）<textarea value={memberIds} onChange={(event) => setMemberIds(event.target.value)} /></label>
      <button type="button" onClick={() => setStep(1)}>上一步</button>
      <button type="button" onClick={() => setStep(3)}>下一步</button>
    </section>}
    {step === 3 && <section>
      <h2>3. 留守與行程資訊</h2>
      <label>留守綁定 ID（每行一個）<textarea value={guardianBindingIds} onChange={(event) => setGuardianBindingIds(event.target.value)} /></label>
      <p>尚未建立留守綁定時可留空；建立後請填入已綁定留守設定的 ID。</p>
      <label>交通工具<input required value={vehicle} onChange={(event) => setVehicle(event.target.value)} /></label>
      <label>裝備（每行一項）<textarea value={equipment} onChange={(event) => setEquipment(event.target.value)} /></label>
      <label>出發時間<input required type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></label>
      <label>預計結束<input required type="datetime-local" value={plannedFinishAt} onChange={(event) => setPlannedFinishAt(event.target.value)} /></label>
      <button type="button" onClick={() => setStep(2)}>上一步</button>
      <button type="submit">建立草稿</button>
    </section>}
    {error && <p role="alert">{error}</p>}
  </form>;
}
