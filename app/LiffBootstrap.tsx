'use client';

import { useEffect, useState } from 'react';

import { copy } from '@/src/features/i18n/copy';

export function LiffBootstrap({ onReady }: { onReady?: () => void }) {
  const [state, setState] = useState<'loading' | 'ready' | 'unconfigured' | 'error'>('loading');

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) { setState('unconfigured'); return; }
    void (async () => {
      try {
        const { default: liff } = await import('@line/liff');
        await liff.init({ liffId });
        if (!liff.isLoggedIn()) { liff.login(); return; }
        const idToken = liff.getIDToken();
        if (!idToken) throw new Error('LINE ID token unavailable');
        const response = await fetch('/api/auth/line', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idToken }) });
        if (!response.ok) throw new Error('LINE login failed');
        setState('ready'); onReady?.();
      } catch { setState('error'); }
    })();
  }, []);

  if (state === 'ready') return null;
  if (state === 'unconfigured') return <p role="status">{copy.liffUnconfigured}</p>;
  if (state === 'error') return <p role="alert">{copy.liffLoginError}</p>;
  return <p role="status">{copy.liffLoading}</p>;
}
