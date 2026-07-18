'use client';

import { useState } from 'react';

import { copy } from '@/src/features/i18n/copy';

const locationFix = (): Promise<{ latitude: number; longitude: number; accuracyMeters: number; capturedAt: string; source: 'gps' } | undefined> => new Promise((resolve) => {
  if (!navigator.geolocation) return resolve(undefined);
  navigator.geolocation.getCurrentPosition((position) => resolve({
    latitude: position.coords.latitude, longitude: position.coords.longitude, accuracyMeters: position.coords.accuracy,
    capturedAt: new Date(position.timestamp).toISOString(), source: 'gps',
  }), () => resolve(undefined), { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 });
});

export function DraftTrip({ tripId, routeName, plannedFinishAt, guardians, members, isOwner }: { tripId: string; routeName: string; plannedFinishAt: string; guardians: Array<string | undefined>; members: Array<{ id: string; name: string; role: string }>; isOwner: boolean }) {
  const [notice, setNotice] = useState<string>();
  const [inviteUrl, setInviteUrl] = useState<string>();
  const start = async () => {
    const location = await locationFix();
    if (!location) { setNotice(copy.gpsRequiredToStart); return; }
    const response = await fetch(`/api/trips/${tripId}/start`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ location, idempotencyKey: crypto.randomUUID() }) });
    if (!response.ok) { setNotice(copy.startTripError); return; }
    window.location.reload();
  };
  const invite = async () => {
    const response = await fetch(`/api/trips/${tripId}/invites`, { method: 'POST' });
    const body = await response.json() as { token?: string; error?: string };
    if (!response.ok || !body.token) { setNotice(body.error ?? copy.inviteLinkError); return; }
    setInviteUrl(`${window.location.origin}/trips/join/${body.token}`);
  };
  const deputy = async (memberUserId: string) => {
    const response = await fetch(`/api/trips/${tripId}/members/deputy`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ memberUserId }) });
    setNotice(response.ok ? copy.deputyAssigned : copy.deputyAssignmentError);
    if (response.ok) window.location.reload();
  };

  return <section aria-label={copy.tripDraft}>
    <h1>{copy.tripDraft}</h1>
    <dl>
      <div><dt>{copy.route}</dt><dd>{routeName}</dd></div>
      <div><dt>{copy.plannedFinish}</dt><dd>{new Date(plannedFinishAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</dd></div>
      <div><dt>{copy.guardians}</dt><dd>{guardians.length ? copy.guardianNames(guardians) : copy.noBoundGuardian}</dd></div>
      <div><dt>{copy.members}</dt><dd>{copy.memberNames(members)}</dd></div>
    </dl>
    {isOwner && <><button onClick={() => void invite()}>{copy.createSquadInvite}</button>{inviteUrl && <p role="status">{copy.inviteLink(inviteUrl)}</p>}
      {members.filter((member) => member.role === 'member').map((member) => <button key={member.id} onClick={() => void deputy(member.id)}>{copy.assignDeputy(member.name)}</button>)}</>}
    <button onClick={() => void start()}>{copy.startAndNotify}</button>
    {notice && <p role="status">{notice}</p>}
  </section>;
}
