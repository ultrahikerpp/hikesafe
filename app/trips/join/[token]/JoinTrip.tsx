'use client';

import { useState } from 'react';

export function JoinTrip({ token }: { token: string }) {
  const [notice, setNotice] = useState<string>();
  const join = async () => {
    const response = await fetch(`/api/trips/invites/${token}/join`, { method: 'POST' });
    const body = await response.json() as { tripId?: string; error?: string };
    if (!response.ok || !body.tripId) { setNotice(body.error ?? '邀請無效或已過期。'); return; }
    window.location.assign(`/trips/${body.tripId}`);
  };
  return <main><h1>加入 BeSafe 小隊</h1><p>請以 LINE 登入後確認加入；加入後由隊長指定副領隊。</p><button onClick={() => void join()}>加入行程</button>{notice && <p role="alert">{notice}</p>}</main>;
}
