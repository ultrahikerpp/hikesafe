'use client';

import { useEffect, useState } from 'react';
import { LiffBootstrap } from '@/app/LiffBootstrap';
import type { GuardianViewer as GuardianViewerData } from '@/src/features/guardian-viewer/service';
import { copy } from '@/src/features/i18n/copy';

export function GuardianViewer({ tripId, grant }: { tripId: string; grant: string }) {
  const [viewer, setViewer] = useState<GuardianViewerData>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!viewer && !error) return;
  }, [viewer, error]);
  const load = async () => {
    const response = await fetch(`/api/trips/${tripId}/guardian-viewer?grant=${encodeURIComponent(grant)}`);
    if (!response.ok) { setError(copy.guardianViewerError); return; }
    setViewer(await response.json());
  };
  const location = viewer?.lastCheckIn?.location;
  const accuracy = location ? copy.reportLocationAccuracy(location.source, location.accuracyMeters) : undefined;
  return <main><LiffBootstrap onReady={() => void load()} /><h1>{copy.guardianTripInfo}</h1>{viewer && <><p>{viewer.route}</p><p>{copy.viewerTeam(viewer.team)}</p>{location && <div><p>{copy.reportLocation(location.latitude, location.longitude)}</p><p>{copy.reportLocationTime(location.source, location.capturedAt)}</p>{accuracy && <p>{accuracy}</p>}</div>}<pre>{viewer.report}</pre></>}{error && <p role="alert">{error}</p>}</main>;
}
