'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Expander } from '@/app/components/Expander';
import { Notice } from '@/app/components/Notice';
import {
  createIndexedDbCheckInStore,
  enqueueCheckIn,
  flushCheckIns,
  type QueuedCheckIn,
} from '@/src/offline/check-in-queue';
import type { ActiveTripInitialState } from '@/src/features/trips/active-trip';
import { copy } from '@/src/features/i18n/copy';
import { formatElapsed, formatTime } from '@/src/lib/format-time';

export { formatElapsed, formatTime };

export type ActiveTripState = ActiveTripInitialState;

type OpenAction = 'checkIn' | 'extend' | 'finish' | 'help';

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
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string }>();
  const [openAction, setOpenAction] = useState<OpenAction>();
  const [customMessage, setCustomMessage] = useState('');
  const [customMinutes, setCustomMinutes] = useState('30');
  const [helpMessage, setHelpMessage] = useState('');
  const [busy, setBusy] = useState(false);

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

  const toggleAction = (action: OpenAction) =>
    setOpenAction((current) => (current === action ? undefined : action));

  const captureLocation = async () => {
    const location = await locationFix();
    setGpsFreshness(location
      ? copy.freshLocationAt(new Date(location.capturedAt).toLocaleTimeString())
      : copy.unavailableLocation());
    return location;
  };

  const submitCheckIn = async (message: string) => {
    setBusy(true);
    const location = await captureLocation();
    const item = { tripId, message, location, idempotencyKey: crypto.randomUUID() };
    try {
      await sendCheckIn(item);
      setNotice({ tone: 'success', text: copy.checkInSuccess() });
    } catch {
      const queue = createIndexedDbCheckInStore();
      await enqueueCheckIn(item, queue);
      await refreshQueue();
      setNotice({ tone: 'success', text: copy.checkInPending });
    }
    setBusy(false);
    setOpenAction(undefined);
    setCustomMessage('');
  };

  const retryPending = async () => {
    const queue = createIndexedDbCheckInStore();
    await flushCheckIns(queue, sendCheckIn);
    await refreshQueue();
  };

  const extend = async (minutes: number) => {
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/extend`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          plannedFinishAt: new Date(Date.now() + minutes * 60_000).toISOString(),
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      setNotice(response.ok
        ? { tone: 'success', text: copy.finishTimeExtended }
        : { tone: 'error', text: copy.finishTimeExtensionError });
      setOpenAction(undefined);
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    try {
      const location = await captureLocation();
      const response = await fetch(`/api/trips/${tripId}/finish`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ location, idempotencyKey: crypto.randomUUID() }),
      });
      setNotice(response.ok
        ? { tone: 'success', text: copy.tripFinished }
        : { tone: 'error', text: copy.tripFinishError });
      setOpenAction(undefined);
    } finally {
      setBusy(false);
    }
  };

  const help = async () => {
    setBusy(true);
    try {
      const location = await captureLocation();
      const response = await fetch(`/api/trips/${tripId}/help`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: helpMessage.trim() || undefined,
          location,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      setNotice(response.ok
        ? { tone: 'success', text: copy.helpConfirmation() }
        : { tone: 'error', text: copy.helpError });
      setOpenAction(undefined);
      setHelpMessage('');
    } finally {
      setBusy(false);
    }
  };

  return <section aria-label={copy.activeTripLabel}>
    <Notice tone="warning">{copy.safetyNotice}</Notice>
    <Card>
      <dl className="status-list">
        <div><dt>{copy.elapsedTimeLabel}</dt><dd>{formatElapsed(initialState.startedAt, initialState.now)}</dd></div>
        <div><dt>{copy.plannedFinish}</dt><dd>{formatTime(initialState.plannedFinishAt)}</dd></div>
        <div><dt>{copy.lastSuccessfulCheckIn}</dt><dd>{formatTime(lastSuccessfulCheckInAt)}</dd></div>
        <div><dt>{copy.currentGps}</dt><dd>{gpsFreshness}</dd></div>
        <div><dt>{copy.pendingReports}</dt><dd>{copy.reportCount(pendingQueueCount)}</dd></div>
      </dl>
      {pendingQueueCount > 0 &&
        <Button variant="ghost" onClick={() => void retryPending()}>{copy.retryPendingReports}</Button>}
    </Card>

    <div id="check-in">
      <Expander label={copy.checkInAction} variant="primary"
        open={openAction === 'checkIn'} onToggle={() => toggleAction('checkIn')}>
        <Button disabled={busy} onClick={() => void submitCheckIn(copy.quickCheckInSafe)}>
          {copy.quickCheckInSafe}
        </Button>
        <Button variant="secondary" disabled={busy} onClick={() => void submitCheckIn(copy.quickCheckInShelter)}>
          {copy.quickCheckInShelter}
        </Button>
        <label>{copy.customCheckInLabel}
          <textarea value={customMessage} onChange={(event) => setCustomMessage(event.target.value)} />
        </label>
        <Button variant="secondary" disabled={busy || !customMessage.trim()}
          onClick={() => void submitCheckIn(customMessage.trim())}>
          {copy.sendCheckIn}
        </Button>
      </Expander>
    </div>

    <Expander label={copy.extendFinishTime}
      open={openAction === 'extend'} onToggle={() => toggleAction('extend')}>
      <div className="quick-time-grid">
        {[30, 60, 120].map((minutes) =>
          <Button key={minutes} variant="secondary" disabled={busy} onClick={() => void extend(minutes)}>
            {copy.extendByMinutes(minutes)}
          </Button>)}
      </div>
      <label>{copy.customMinutesLabel}
        <input type="number" min="1" value={customMinutes}
          onChange={(event) => setCustomMinutes(event.target.value)} />
      </label>
      <Button variant="secondary" disabled={busy} onClick={() => void extend(Number(customMinutes))}>
        {copy.confirmExtend}
      </Button>
    </Expander>

    <div id="finish">
      <Expander label={copy.finishAction}
        open={openAction === 'finish'} onToggle={() => toggleAction('finish')}>
        <p>{copy.finishConfirmation}</p>
        <span id="finish-description" hidden>{copy.safeFinishDescription}</span>
        <Button aria-describedby="finish-description" disabled={busy} onClick={() => void finish()}>
          {copy.safeFinish}
        </Button>
      </Expander>
    </div>

    <Expander label={copy.needHelp} variant="danger"
      open={openAction === 'help'} onToggle={() => toggleAction('help')}>
      <label>{copy.helpPrompt}
        <textarea value={helpMessage} onChange={(event) => setHelpMessage(event.target.value)} />
      </label>
      <Button variant="danger" disabled={busy} onClick={() => void help()}>{copy.confirmHelp}</Button>
    </Expander>

    {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
  </section>;
}
