import type { HTMLAttributes, ReactNode } from 'react';

export function Card({
  title,
  className,
  children,
  ...props
}: Omit<HTMLAttributes<HTMLElement>, 'title'> & { title?: ReactNode }) {
  return <section className={['card', className].filter(Boolean).join(' ')} {...props}>
    {title != null && <h2 className="card-title">{title}</h2>}
    {children}
  </section>;
}
