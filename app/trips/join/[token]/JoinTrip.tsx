'use client';

import { useState } from 'react';
import { LiffBootstrap } from '@/app/LiffBootstrap';
import { copy } from '@/src/features/i18n/copy';

export function JoinTrip({ token }: { token: string }) {
  const [notice, setNotice] = useState<string>();
  const [ready, setReady] = useState(false);
  const join = async () => {
    const response = await fetch(`/api/trips/invites/${token}/join`, { method: 'POST' });
    const body = await response.json() as { tripId?: string; error?: string };
    if (!response.ok || !body.tripId) { setNotice(body.error ?? copy.joinTripInvalid); return; }
    window.location.assign(`/trips/${body.tripId}`);
  };
  return <main><LiffBootstrap onReady={() => setReady(true)} /><h1>{copy.joinSquad}</h1><p>{copy.joinInstructions}</p><button disabled={!ready} onClick={() => void join()}>{copy.joinTrip}</button>{notice && <p role="alert">{notice}</p>}</main>;
}
