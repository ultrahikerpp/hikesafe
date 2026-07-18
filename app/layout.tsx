import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { copy } from '@/src/features/i18n/copy';
import './globals.css';

export const metadata: Metadata = {
  title: copy.homeTitle,
  description: copy.metadataDescription,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
