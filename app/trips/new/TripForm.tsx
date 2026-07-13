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
interface GuardianBinding { id: string; sourceType: 'user' | 'group' | 'room' | null; displayName: string | null; sourceId: string | null; boundAt: string | null; }

const splitLines = (value: string) => value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);

export function TripForm() {
  const [step, setStep] = useState(1);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [routeVersionId, setRouteVersionId] = useState('');
  const [region, setRegion] = useState('');
  const [mountain, setMountain] = useState('');
  const [bindings, setBindings] = useState<GuardianBinding[]>([]);
  const [guardianBindingIds, setGuardianBindingIds] = useState<string[]>([]);
  const [bindingCode, setBindingCode] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
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
  const refreshBindings = async () => {
    const response = await fetch('/api/guardian-bindings');
    if (!response.ok) throw new Error('Guardian bindings unavailable');
    setBindings((await response.json() as { bindings: GuardianBinding[] }).bindings);
  };
  useEffect(() => { void refreshBindings().catch(() => setError('請先完成 LINE 登入，才能管理留守綁定。')); }, []);
  const createBinding = async () => {
    setError('');
    const response = await fetch('/api/guardian-bindings', { method: 'POST' });
    const body = await response.json() as { code?: string; error?: string };
    if (!response.ok || !body.code) { setError(body.error ?? '無法建立綁定碼'); return; }
    setBindingCode(body.code);
    await refreshBindings();
  };

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
    const response = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        routeVersionId,
        startsAt: new Date(startsAt).toISOString(),
        plannedFinishAt: new Date(plannedFinishAt).toISOString(),
        members: [],
        guardianBindingIds,
        vehicle,
        equipment: splitLines(equipment),
        leaderPhone,
        idempotencyKey,
      }),
    });
    const body = await response.json() as { tripId?: string; error?: string };
    if (!response.ok || !body.tripId) {
      setError(body.error ?? '無法建立行程');
      return;
    }
    setCreatedTripId(body.tripId);
    window.location.assign(`/trips/${body.tripId}`);
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
      <p>目前版本預設單人行程，登入者會自動設為隊長。小隊邀請與加入流程尚未提供，因此不會要求輸入任何使用者 ID。</p>
      <button type="button" onClick={() => setStep(1)}>上一步</button>
      <button type="button" onClick={() => setStep(3)}>下一步</button>
    </section>}
    {step === 3 && <section>
      <h2>3. 留守與行程資訊</h2>
      <h3>留守綁定</h3>
      <p>建立綁定碼後，請在 HikeSafe 官方帳號私訊、群組或聊天室輸入「綁定 {bindingCode || '六碼綁定碼'}」。不需要也不能手動輸入內部 ID。</p>
      <button type="button" onClick={() => void createBinding()}>建立留守綁定碼</button>
      {bindingCode && <p role="status">本次綁定碼：{bindingCode}（10 分鐘有效）</p>}
      {bindings.filter((binding) => binding.boundAt && binding.sourceId).map((binding) => <label key={binding.id}>
        <input type="checkbox" checked={guardianBindingIds.includes(binding.id)} onChange={(event) => setGuardianBindingIds((ids) => event.target.checked ? [...ids, binding.id] : ids.filter((id) => id !== binding.id))} />
        {binding.displayName || binding.sourceType === 'group' ? '已綁定群組' : '已綁定留守人'}
      </label>)}
      <label>交通工具<input required value={vehicle} onChange={(event) => setVehicle(event.target.value)} /></label>
      <label>裝備（每行一項）<textarea value={equipment} onChange={(event) => setEquipment(event.target.value)} /></label>
      <label>領隊聯絡電話（供留守聯絡）<input type="tel" value={leaderPhone} onChange={(event) => setLeaderPhone(event.target.value)} /></label>
      <label>出發時間<input required type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></label>
      <label>預計結束<input required type="datetime-local" value={plannedFinishAt} onChange={(event) => setPlannedFinishAt(event.target.value)} /></label>
      <button type="button" onClick={() => setStep(2)}>上一步</button>
      <button type="submit">建立草稿</button>
    </section>}
    {error && <p role="alert">{error}</p>}
  </form>;
}
