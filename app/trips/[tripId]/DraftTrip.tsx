'use client';

import { useState } from 'react';

const locationFix = (): Promise<{ latitude: number; longitude: number; accuracyMeters: number; capturedAt: string; source: 'gps' } | undefined> => new Promise((resolve) => {
  if (!navigator.geolocation) return resolve(undefined);
  navigator.geolocation.getCurrentPosition((position) => resolve({
    latitude: position.coords.latitude, longitude: position.coords.longitude, accuracyMeters: position.coords.accuracy,
    capturedAt: new Date(position.timestamp).toISOString(), source: 'gps',
  }), () => resolve(undefined), { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 });
});

export function DraftTrip({ tripId, routeName, plannedFinishAt, guardians, members, isOwner }: { tripId: string; routeName: string; plannedFinishAt: string; guardians: string[]; members: Array<{ id: string; name: string; role: string }>; isOwner: boolean }) {
  const [notice, setNotice] = useState<string>();
  const [inviteUrl, setInviteUrl] = useState<string>();
  const start = async () => {
    const location = await locationFix();
    if (!location) { setNotice('需取得目前 GPS 才能開始登山。'); return; }
    const response = await fetch(`/api/trips/${tripId}/start`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ location, idempotencyKey: crypto.randomUUID() }) });
    if (!response.ok) { setNotice('無法開始行程，請確認登入、GPS 與留守綁定。'); return; }
    window.location.reload();
  };
  const invite = async () => {
    const response = await fetch(`/api/trips/${tripId}/invites`, { method: 'POST' });
    const body = await response.json() as { token?: string; error?: string };
    if (!response.ok || !body.token) { setNotice(body.error ?? '無法建立邀請連結。'); return; }
    setInviteUrl(`${window.location.origin}/trips/join/${body.token}`);
  };
  const deputy = async (memberUserId: string) => {
    const response = await fetch(`/api/trips/${tripId}/members/deputy`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ memberUserId }) });
    setNotice(response.ok ? '已指定副領隊。' : '無法指定副領隊。');
    if (response.ok) window.location.reload();
  };

  return <section aria-label="行程草稿">
    <h1>行程草稿</h1>
    <dl>
      <div><dt>路線</dt><dd>{routeName}</dd></div>
      <div><dt>預計下山</dt><dd>{new Date(plannedFinishAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</dd></div>
      <div><dt>留守人</dt><dd>{guardians.join('、') || '尚未綁定留守人'}</dd></div>
      <div><dt>隊員</dt><dd>{members.map((member) => `${member.name}（${member.role === 'deputy' ? '副領隊' : member.role === 'leader' ? '隊長' : '隊員'}）`).join('、')}</dd></div>
    </dl>
    {isOwner && <><button onClick={() => void invite()}>建立小隊邀請連結</button>{inviteUrl && <p role="status">邀請連結：{inviteUrl}</p>}
      {members.filter((member) => member.role === 'member').map((member) => <button key={member.id} onClick={() => void deputy(member.id)}>指定 {member.name} 為副領隊</button>)}</>}
    <button onClick={() => void start()}>開始登山並通知</button>
    {notice && <p role="status">{notice}</p>}
  </section>;
}
