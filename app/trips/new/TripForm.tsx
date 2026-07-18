'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  calculatePlannedFinish,
  canSubmitQuickTrip,
  currentStartValue,
  type QuickRouteOption,
  type QuickTripDefaultsResponse,
} from './quick-trip-form';

interface GuardianBinding {
  id: string;
  sourceType: 'user' | 'group' | 'room' | null;
  displayName: string | null;
  sourceId: string | null;
  boundAt: string | null;
}

const splitLines = (value: string) => value
  .split(/\n|,/)
  .map((item) => item.trim())
  .filter(Boolean);

export function TripForm() {
  const [routes, setRoutes] = useState<QuickRouteOption[]>([]);
  const [routeQuery, setRouteQuery] = useState('');
  const [routeVersionId, setRouteVersionId] = useState('');
  const [lastRouteVersionId, setLastRouteVersionId] = useState<string | null>(null);
  const [catalogAvailable, setCatalogAvailable] = useState(false);
  const [bindings, setBindings] = useState<GuardianBinding[]>([]);
  const [guardianBindingIds, setGuardianBindingIds] = useState<string[]>([]);
  const [bindingCode, setBindingCode] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [startsAt, setStartsAt] = useState(() => currentStartValue());
  const [plannedFinishAt, setPlannedFinishAt] = useState('');
  const [finishWasEdited, setFinishWasEdited] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [error, setError] = useState('');
  const defaultsTouched = useRef({
    confirmed: false,
    equipment: false,
    guardians: false,
    leaderPhone: false,
    route: false,
    vehicle: false,
  });

  const refreshRoutes = useCallback(async () => {
    const response = await fetch('/api/routes');
    if (!response.ok) throw new Error('Route catalog unavailable');
    const body = await response.json() as { routes: QuickRouteOption[] };
    setRoutes(body.routes);
    setRouteVersionId((id) => body.routes.some((route) => route.id === id) ? id : '');
    setCatalogAvailable(true);
    setConfirmed(false);
  }, []);

  const refreshBindings = useCallback(async () => {
    const response = await fetch('/api/guardian-bindings');
    if (!response.ok) throw new Error('Guardian bindings unavailable');
    setBindings((await response.json() as { bindings: GuardianBinding[] }).bindings);
  }, []);

  useEffect(() => {
    void refreshRoutes().catch(() => {
      setCatalogAvailable(false);
      setError('目前沒有可用的已啟用路線版本。正式路線目錄尚未通過安全驗證時，無法建立行程。');
    });
    void refreshBindings().catch(() => setError('請先完成 LINE 登入，才能管理留守綁定。'));
    void fetch('/api/trips/quick-defaults').then(async (response) => {
      if (!response.ok) return;
      const { defaults } = await response.json() as { defaults: QuickTripDefaultsResponse };
      if (defaultsTouched.current.confirmed) return;
      let applied = false;
      if (!defaultsTouched.current.route) {
        setLastRouteVersionId(defaults.routeVersionId);
      }
      if (!defaultsTouched.current.guardians) {
        setGuardianBindingIds(defaults.guardianBindingIds);
        applied = true;
      }
      if (!defaultsTouched.current.vehicle) {
        setVehicle(defaults.vehicle);
        applied = true;
      }
      if (!defaultsTouched.current.equipment) {
        setEquipment(defaults.equipment.join('\n'));
        applied = true;
      }
      if (!defaultsTouched.current.leaderPhone) {
        setLeaderPhone(defaults.leaderPhone);
        applied = true;
      }
      if (applied) setConfirmed(false);
    }).catch(() => undefined);
  }, [refreshBindings, refreshRoutes]);

  const activeBindings = useMemo(() => bindings.filter(
    (binding) => binding.boundAt && binding.sourceId,
  ), [bindings]);
  const activeBindingIds = useMemo(
    () => new Set(activeBindings.map(({ id }) => id)),
    [activeBindings],
  );
  const selectedGuardianBindingIds = guardianBindingIds.filter((id) => activeBindingIds.has(id));
  const selectedRoute = routes.find(({ id }) => id === routeVersionId);
  const lastRoute = routes.find(({ id }) => id === lastRouteVersionId);
  const visibleRoutes = useMemo(() => {
    const query = routeQuery.normalize('NFKC').trim().toLocaleLowerCase('zh-Hant-TW');
    if (!query) return routes;
    return routes.filter((route) =>
      `${route.region} ${route.mountainName} ${route.routeName}`
        .normalize('NFKC')
        .toLocaleLowerCase('zh-Hant-TW')
        .includes(query),
    );
  }, [routeQuery, routes]);

  const chooseRoute = (id: string) => {
    defaultsTouched.current.route = true;
    setRouteVersionId(id);
    setConfirmed(false);
    const route = routes.find((item) => item.id === id);
    if (route && !finishWasEdited) {
      setPlannedFinishAt(calculatePlannedFinish(startsAt, route.durationMinutes));
    }
  };

  const changeStart = (value: string) => {
    setStartsAt(value);
    setConfirmed(false);
    if (selectedRoute && !finishWasEdited) {
      setPlannedFinishAt(calculatePlannedFinish(value, selectedRoute.durationMinutes));
    }
  };

  const createBinding = async () => {
    setError('');
    const response = await fetch('/api/guardian-bindings', { method: 'POST' });
    const body = await response.json() as { code?: string; error?: string };
    if (!response.ok || !body.code) {
      setError(body.error ?? '無法建立綁定碼');
      return;
    }
    setBindingCode(body.code);
    await refreshBindings();
  };

  const canSubmit = catalogAvailable && !submitting && canSubmitQuickTrip({
    routeVersionId,
    guardianBindingIds: selectedGuardianBindingIds,
    startsAt,
    plannedFinishAt,
    vehicle,
    confirmed,
  });

  const refreshStaleChoices = async () => {
    setSubmitting(false);
    await Promise.allSettled([refreshRoutes(), refreshBindings()]);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          routeVersionId,
          startsAt: new Date(startsAt).toISOString(),
          plannedFinishAt: new Date(plannedFinishAt).toISOString(),
          members: [],
          guardianBindingIds: selectedGuardianBindingIds,
          vehicle: vehicle.trim(),
          equipment: splitLines(equipment),
          leaderPhone,
          idempotencyKey,
        }),
      });
      const body = await response.json() as { tripId?: string; error?: string };
      if (!response.ok || !body.tripId) {
        setError(body.error ?? '無法建立行程');
        await refreshStaleChoices();
        return;
      }
      window.location.assign(`/trips/${body.tripId}`);
    } catch {
      setError('無法建立行程');
      await refreshStaleChoices();
    }
  };

  return <form className="trip-form" onSubmit={submit}>
    <h1>快速建立行程</h1>
    <p>僅能使用已驗證、已啟用的路線。建立後仍需在登山口取得 GPS 才能開始行程。</p>

    {lastRoute && <button type="button" className="secondary-action" onClick={() => chooseRoute(lastRoute.id)}>
      使用上次路線：{lastRoute.routeName}
    </button>}

    <label>搜尋已驗證路線
      <input type="search" value={routeQuery} onChange={(event) => setRouteQuery(event.target.value)} />
    </label>
    <label>路線
      <select required value={routeVersionId} onChange={(event) => chooseRoute(event.target.value)}>
        <option value="">請選擇</option>
        {visibleRoutes.map((route) => <option key={route.id} value={route.id}>
          {route.region}｜{route.mountainName}｜{route.routeName}
        </option>)}
      </select>
    </label>
    {selectedRoute && <p className="source-note">官方預估 {selectedRoute.durationMinutes} 分鐘；來源：<a href={selectedRoute.sourceUrl}>{selectedRoute.sourceOrganization}</a>；版本 {selectedRoute.sourceVersion}；覆核 {selectedRoute.reviewedAt}</p>}

    <div className="quick-time-grid">
      <label>出發時間
        <input required type="datetime-local" value={startsAt} onChange={(event) => changeStart(event.target.value)} />
      </label>
      <label>預計下山時間
        <input required type="datetime-local" value={plannedFinishAt} onChange={(event) => {
          setPlannedFinishAt(event.target.value);
          setFinishWasEdited(true);
          setConfirmed(false);
        }} />
      </label>
    </div>

    <fieldset>
      <legend>本次留守人</legend>
      {activeBindings.map((binding) => <label key={binding.id}>
        <input type="checkbox" checked={guardianBindingIds.includes(binding.id)} onChange={(event) => {
          defaultsTouched.current.guardians = true;
          setConfirmed(false);
          setGuardianBindingIds((ids) => event.target.checked
            ? [...new Set([...ids, binding.id])]
            : ids.filter((id) => id !== binding.id));
        }} />
        {binding.displayName || (binding.sourceType === 'group' ? '已綁定群組' : '已綁定留守人')}
      </label>)}
      {activeBindings.length === 0 && <p>尚無有效留守綁定，請先建立綁定碼。</p>}
      <button type="button" className="secondary-action" onClick={() => void createBinding()}>建立留守綁定碼</button>
      {bindingCode && <p role="status">本次綁定碼：{bindingCode}（10 分鐘有效）。請在 HikeSafe 官方帳號私訊、群組或聊天室輸入「綁定 {bindingCode}」。</p>}
    </fieldset>

    <details>
      <summary>行程與緊急資料</summary>
      <label>交通工具
        <input required value={vehicle} onChange={(event) => {
          defaultsTouched.current.vehicle = true;
          setVehicle(event.target.value);
          setConfirmed(false);
        }} />
      </label>
      <label>裝備（每行一項）
        <textarea value={equipment} onChange={(event) => {
          defaultsTouched.current.equipment = true;
          setEquipment(event.target.value);
        }} />
      </label>
      <label>領隊聯絡電話（供留守聯絡）
        <input type="tel" value={leaderPhone} onChange={(event) => {
          defaultsTouched.current.leaderPhone = true;
          setLeaderPhone(event.target.value);
        }} />
      </label>
    </details>

    <label className="confirmation-row">
      <input type="checkbox" checked={confirmed} onChange={(event) => {
        defaultsTouched.current.confirmed = true;
        setConfirmed(event.target.checked);
      }} />
      我已確認路線、預計下山時間與留守人
    </label>
    <button type="submit" disabled={!canSubmit}>{submitting ? '建立中…' : '建立行程草稿'}</button>
    {error && <p role="alert">{error}</p>}
  </form>;
}
