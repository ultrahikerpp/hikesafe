'use client';

import { useState } from 'react';

import { LiffBootstrap } from '@/app/LiffBootstrap';

import { TripForm } from './TripForm';

export default function NewTripPage() {
  const [sessionReady, setSessionReady] = useState(false);

  return <main className="trip-new">
    <LiffBootstrap onReady={() => setSessionReady(true)} />
    {sessionReady
      ? <TripForm />
      : <p role="status">完成 LINE 登入後才能建立行程。</p>}
  </main>;
}
