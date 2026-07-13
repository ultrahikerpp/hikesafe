'use client';

import { useEffect, useState } from 'react';
import { LiffBootstrap } from '@/app/LiffBootstrap';

export function GuardianViewer({ tripId, grant }: { tripId: string; grant: string }) {
  const [viewer, setViewer] = useState<{ route: string; team: string[]; report: string }>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!viewer && !error) return;
  }, [viewer, error]);
  const load = async () => {
    const response = await fetch(`/api/trips/${tripId}/guardian-viewer?grant=${encodeURIComponent(grant)}`);
    if (!response.ok) { setError('無法取得留守行程，請確認 LINE 登入與授權連結。'); return; }
    setViewer(await response.json());
  };
  return <main><LiffBootstrap onReady={() => void load()} /><h1>留守行程資訊</h1>{viewer && <><p>{viewer.route}</p><p>隊伍：{viewer.team.join('、')}</p><pre>{viewer.report}</pre></>}{error && <p role="alert">{error}</p>}</main>;
}
