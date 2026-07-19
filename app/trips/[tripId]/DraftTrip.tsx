'use client';

import { useState } from 'react';

import { copy } from '@/src/features/i18n/copy';
import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Notice } from '@/app/components/Notice';

const locationFix = (): Promise<{ latitude: number; longitude: number; accuracyMeters: number; capturedAt: string; source: 'gps' } | undefined> => new Promise((resolve) => {
  if (!navigator.geolocation) return resolve(undefined);
  navigator.geolocation.getCurrentPosition((position) => resolve({
    latitude: position.coords.latitude, longitude: position.coords.longitude, accuracyMeters: position.coords.accuracy,
    capturedAt: new Date(position.timestamp).toISOString(), source: 'gps',
  }), () => resolve(undefined), { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 });
});

export function DraftTrip({ tripId, routeName, plannedFinishAt, guardians, members, isOwner }: { tripId: string; routeName: string; plannedFinishAt: string; guardians: Array<string | undefined>; members: Array<{ id: string; name: string; role: string }>; isOwner: boolean }) {
  const [notice, setNotice] = useState<{ tone: 'success' | 'warning' | 'error'; text: string }>();
  const [inviteUrl, setInviteUrl] = useState<string>();
  const start = async () => {
    const location = await locationFix();
    if (!location) { setNotice({ tone: 'warning', text: copy.gpsRequiredToStart }); return; }
    const response = await fetch(`/api/trips/${tripId}/start`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ location, idempotencyKey: crypto.randomUUID() }) });
    if (!response.ok) { setNotice({ tone: 'error', text: copy.startTripError }); return; }
    window.location.reload();
  };
  const invite = async () => {
    const response = await fetch(`/api/trips/${tripId}/invites`, { method: 'POST' });
    const body = await response.json() as { token?: string; error?: string };
    if (!response.ok || !body.token) { setNotice({ tone: 'error', text: body.error ?? copy.inviteLinkError }); return; }
    setInviteUrl(`${window.location.origin}/trips/join/${body.token}`);
  };
  const deputy = async (memberUserId: string) => {
    const response = await fetch(`/api/trips/${tripId}/members/deputy`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ memberUserId }) });
    setNotice(response.ok ? { tone: 'success', text: copy.deputyAssigned } : { tone: 'error', text: copy.deputyAssignmentError });
    if (response.ok) window.location.reload();
  };

  return <section aria-label={copy.tripDraft}>
    <h1>{copy.tripDraft}</h1>
    <Card>
      <dl className="status-list">
        <div><dt>{copy.route}</dt><dd>{routeName}</dd></div>
        <div><dt>{copy.plannedFinish}</dt><dd>{new Date(plannedFinishAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</dd></div>
        <div><dt>{copy.guardians}</dt><dd>{guardians.length ? copy.guardianNames(guardians) : copy.noBoundGuardian}</dd></div>
        <div><dt>{copy.members}</dt><dd>{copy.memberNames(members)}</dd></div>
      </dl>
    </Card>
    {isOwner && <Card>
      <Button variant="secondary" onClick={() => void invite()}>{copy.createSquadInvite}</Button>
      {inviteUrl && <Notice tone="success">{copy.inviteLink(inviteUrl)}</Notice>}
      {members.filter((member) => member.role === 'member').map((member) =>
        <Button key={member.id} variant="ghost" onClick={() => void deputy(member.id)}>
          {copy.assignDeputy(member.name)}
        </Button>)}
    </Card>}
    <Button onClick={() => void start()}>{copy.startAndNotify}</Button>
    {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
  </section>;
}
