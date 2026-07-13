'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  createIndexedDbCheckInStore,
  enqueueCheckIn,
  flushCheckIns,
  type QueuedCheckIn,
} from '@/src/offline/check-in-queue';
import type { ActiveTripInitialState } from '@/src/features/trips/active-trip';

export type ActiveTripState = ActiveTripInitialState;

export const formatTime = (value?: string) => {
  if (!value) return '尚未取得';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')} Asia/Taipei`;
};

export const formatElapsed = (startedAt?: string, now = new Date().toISOString()) => {
  if (!startedAt) return '尚未取得';
  const minutes = Math.max(0, Math.floor((new Date(now).getTime() - new Date(startedAt).getTime()) / 60_000));
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours} 小時 ${minutes % 60} 分鐘` : `${minutes} 分鐘`;
};

const locationFix = (): Promise<{ latitude: number; longitude: number; accuracyMeters: number; capturedAt: string; source: 'gps' } | undefined> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(undefined);
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        capturedAt: new Date(position.timestamp).toISOString(),
        source: 'gps',
      }),
      () => resolve(undefined),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 },
    );
  });

export function TripActions({ tripId, initialState }: { tripId: string; initialState: ActiveTripState }) {
  const [lastSuccessfulCheckInAt, setLastSuccessfulCheckInAt] = useState(initialState.lastSuccessfulCheckInAt);
  const [gpsFreshness, setGpsFreshness] = useState(initialState.gpsFreshness);
  const [pendingQueueCount, setPendingQueueCount] = useState(initialState.pendingQueueCount);
  const [notice, setNotice] = useState<string>();

  const refreshQueue = useCallback(async () => {
    if (typeof indexedDB === 'undefined') return;
    const queue = createIndexedDbCheckInStore();
    setPendingQueueCount((await queue.list()).length);
  }, []);

  useEffect(() => { void refreshQueue(); }, [refreshQueue]);

  const sendCheckIn = useCallback(async (item: Pick<QueuedCheckIn, 'message' | 'location' | 'idempotencyKey'>) => {
    const response = await fetch(`/api/trips/${tripId}/check-ins`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Check-in was not accepted');
    setLastSuccessfulCheckInAt(new Date().toISOString());
  }, [tripId]);

  const reportProgress = async () => {
    const message = window.prompt('回報內容（可在無定位時只送文字）');
    if (!message) return;
    const location = await locationFix();
    setGpsFreshness(location ? `新鮮（${new Date(location.capturedAt).toLocaleTimeString()}）` : '未取得定位');
    const item = { tripId, message, location, idempotencyKey: crypto.randomUUID() };
    try {
      await sendCheckIn(item);
      setNotice('回報已成功送出');
    } catch {
      const queue = createIndexedDbCheckInStore();
      await enqueueCheckIn(item, queue);
      await refreshQueue();
      setNotice('目前待傳送；尚未視為成功送出');
    }
  };

  const retryPending = async () => {
    const queue = createIndexedDbCheckInStore();
    await flushCheckIns(queue, sendCheckIn);
    await refreshQueue();
  };

  const extend = async () => {
    const minutes = Number(window.prompt('延長分鐘數', '30'));
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    const response = await fetch(`/api/trips/${tripId}/extend`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ plannedFinishAt: new Date(Date.now() + minutes * 60_000).toISOString(), idempotencyKey: crypto.randomUUID() }),
    });
    setNotice(response.ok ? '下山時間已延長' : '無法延長下山時間');
  };

  const finish = async () => {
    if (!window.confirm('確認全隊已安全下山？')) return;
    const location = await locationFix();
    setGpsFreshness(location ? `新鮮（${new Date(location.capturedAt).toLocaleTimeString()}）` : '未取得定位');
    const response = await fetch(`/api/trips/${tripId}/finish`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ location, idempotencyKey: crypto.randomUUID() }),
    });
    setNotice(response.ok ? '行程已結束' : '無法結束行程');
  };
  const help = async () => {
    const message = window.prompt('求助內容（可在無定位時只送文字）') ?? undefined;
    const location = await locationFix();
    const response = await fetch(`/api/trips/${tripId}/help`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message, location, idempotencyKey: crypto.randomUUID() }) });
    setNotice(response.ok ? '求助通知已建立並送往留守人。' : '無法建立求助通知。');
  };

  return <section aria-label="進行中行程">
    <p className="alert-label" aria-live="polite">安全狀態：<strong>留意</strong>，請持續回報行程進度</p>
    <dl>
      <div><dt>經過時間</dt><dd>{formatElapsed(initialState.startedAt, initialState.now)}</dd></div>
      <div><dt>預計下山</dt><dd>{formatTime(initialState.plannedFinishAt)}</dd></div>
      <div><dt>最後成功送出</dt><dd>{formatTime(lastSuccessfulCheckInAt)}</dd></div>
      <div><dt>目前 GPS</dt><dd>{gpsFreshness}</dd></div>
      <div><dt>待傳送回報</dt><dd>{pendingQueueCount} 筆</dd></div>
    </dl>
    {pendingQueueCount > 0 && <button onClick={() => void retryPending()}>重試待傳送回報</button>}
    <button onClick={() => void reportProgress()}>回報目前進度</button>
    <button onClick={() => void extend()}>延長下山時間</button>
    <button onClick={() => void help()}>需要協助</button>
    <span id="finish-description" hidden>安全下山，確認全隊已安全下山</span>
    <button aria-describedby="finish-description" onClick={() => void finish()}>確認全隊安全下山</button>
    {notice && <p role="status">{notice}</p>}
  </section>;
}
