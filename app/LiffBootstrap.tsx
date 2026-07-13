'use client';

import { useEffect, useState } from 'react';

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
  if (state === 'unconfigured') return <p role="status">LINE LIFF 憑證尚未設定；目前無法登入或建立正式行程。</p>;
  if (state === 'error') return <p role="alert">LINE 登入未完成。請在 LINE 內重新開啟 HikeSafe 後再試。</p>;
  return <p role="status">正在確認 LINE 登入…</p>;
}
