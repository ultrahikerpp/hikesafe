'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  createIndexedDbCheckInStore,
  enqueueCheckIn,
  flushCheckIns,
  type QueuedCheckIn,
} from '@/src/offline/check-in-queue';
import type { ActiveTripInitialState } from '@/src/features/trips/active-trip';
import { copy } from '@/src/features/i18n/copy';

export type ActiveTripState = ActiveTripInitialState;

export const formatTime = (value?: string) => {
  if (!value) return copy.notAvailableYet;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')} Asia/Taipei`;
};

export const formatElapsed = (startedAt?: string, now = new Date().toISOString()) => {
  if (!startedAt) return copy.notAvailableYet;
  const minutes = Math.max(0, Math.floor((new Date(now).getTime() - new Date(startedAt).getTime()) / 60_000));
  const hours = Math.floor(minutes / 60);
  return copy.elapsedTime(hours, minutes % 60);
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
    const message = window.prompt(copy.reportPrompt);
    if (!message) return;
    const location = await locationFix();
    setGpsFreshness(location ? copy.freshLocationAt(new Date(location.capturedAt).toLocaleTimeString()) : copy.unavailableLocation());
    const item = { tripId, message, location, idempotencyKey: crypto.randomUUID() };
    try {
      await sendCheckIn(item);
      setNotice(copy.checkInSuccess());
    } catch {
      const queue = createIndexedDbCheckInStore();
      await enqueueCheckIn(item, queue);
      await refreshQueue();
      setNotice(copy.checkInPending);
    }
  };

  const retryPending = async () => {
    const queue = createIndexedDbCheckInStore();
    await flushCheckIns(queue, sendCheckIn);
    await refreshQueue();
  };

  const extend = async () => {
    const minutes = Number(window.prompt(copy.extensionPrompt, '30'));
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    const response = await fetch(`/api/trips/${tripId}/extend`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ plannedFinishAt: new Date(Date.now() + minutes * 60_000).toISOString(), idempotencyKey: crypto.randomUUID() }),
    });
    setNotice(response.ok ? copy.finishTimeExtended : copy.finishTimeExtensionError);
  };

  const finish = async () => {
    if (!window.confirm(copy.finishConfirmation)) return;
    const location = await locationFix();
    setGpsFreshness(location ? copy.freshLocationAt(new Date(location.capturedAt).toLocaleTimeString()) : copy.unavailableLocation());
    const response = await fetch(`/api/trips/${tripId}/finish`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ location, idempotencyKey: crypto.randomUUID() }),
    });
    setNotice(response.ok ? copy.tripFinished : copy.tripFinishError);
  };
  const help = async () => {
    const message = window.prompt(copy.helpPrompt) ?? undefined;
    const location = await locationFix();
    const response = await fetch(`/api/trips/${tripId}/help`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message, location, idempotencyKey: crypto.randomUUID() }) });
    setNotice(response.ok ? copy.helpConfirmation() : copy.helpError);
  };

  return <section aria-label={copy.activeTripLabel}>
    <p className="alert-label" aria-live="polite">{copy.safetyNotice}</p>
    <dl>
      <div><dt>{copy.elapsedTimeLabel}</dt><dd>{formatElapsed(initialState.startedAt, initialState.now)}</dd></div>
      <div><dt>{copy.plannedFinish}</dt><dd>{formatTime(initialState.plannedFinishAt)}</dd></div>
      <div><dt>{copy.lastSuccessfulCheckIn}</dt><dd>{formatTime(lastSuccessfulCheckInAt)}</dd></div>
      <div><dt>{copy.currentGps}</dt><dd>{gpsFreshness}</dd></div>
      <div><dt>{copy.pendingReports}</dt><dd>{copy.reportCount(pendingQueueCount)}</dd></div>
    </dl>
    {pendingQueueCount > 0 && <button onClick={() => void retryPending()}>{copy.retryPendingReports}</button>}
    <button onClick={() => void reportProgress()}>{copy.reportProgress}</button>
    <button onClick={() => void extend()}>{copy.extendFinishTime}</button>
    <button onClick={() => void help()}>{copy.needHelp}</button>
    <span id="finish-description" hidden>{copy.safeFinishDescription}</span>
    <button aria-describedby="finish-description" onClick={() => void finish()}>{copy.safeFinish}</button>
    {notice && <p role="status">{notice}</p>}
  </section>;
}
