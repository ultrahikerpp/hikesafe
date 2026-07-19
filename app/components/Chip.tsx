import type { ReactNode } from 'react';

export function Chip({
  tone = 'neutral',
  children,
}: { tone?: 'success' | 'neutral' | 'warning' | 'danger'; children: ReactNode }) {
  return <span className={`chip chip-${tone}`}>{children}</span>;
}
