'use client';

import { useState } from 'react';

import { LiffBootstrap } from '@/app/LiffBootstrap';
import { copy } from '@/src/features/i18n/copy';

import { TripForm } from './TripForm';

export default function NewTripPage() {
  const [sessionReady, setSessionReady] = useState(false);

  return <main className="trip-new">
    <LiffBootstrap onReady={() => setSessionReady(true)} />
    {sessionReady
      ? <TripForm />
      : <p role="status">{copy.loginToCreateTrip}</p>}
  </main>;
}
