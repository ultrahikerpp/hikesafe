import type { ReactNode } from 'react';

import { Button, type ButtonVariant } from './Button';

export function Expander({
  label,
  open,
  onToggle,
  variant = 'ghost',
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  variant?: ButtonVariant;
  children: ReactNode;
}) {
  return <div className="expander">
    <Button variant={variant} aria-expanded={open} onClick={onToggle}>{label}</Button>
    {open && <div className="expander-body">{children}</div>}
  </div>;
}
