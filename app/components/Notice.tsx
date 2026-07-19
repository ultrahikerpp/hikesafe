import type { ReactNode } from 'react';

export function Notice({
  tone = 'success',
  children,
}: { tone?: 'success' | 'warning' | 'error'; children: ReactNode }) {
  return <p role={tone === 'error' ? 'alert' : 'status'} className={`notice notice-${tone}`}>
    {children}
  </p>;
}
