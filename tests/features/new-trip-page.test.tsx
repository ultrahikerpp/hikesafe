import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/LiffBootstrap', () => ({
  LiffBootstrap: ({ onReady }: { onReady?: () => void }) => (
    <button type="button" onClick={onReady}>LINE 登入完成</button>
  ),
}));

vi.mock('@/app/trips/new/TripForm', () => ({
  TripForm: () => <p>快速建立行程表單</p>,
}));

import NewTripPage from '@/app/trips/new/page';

describe('new trip page authentication gate', () => {
  it('does not render the form until the LINE session is ready', () => {
    render(<NewTripPage />);

    expect(screen.queryByText('快速建立行程表單')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'LINE 登入完成' }));
    expect(screen.getByText('快速建立行程表單')).toBeInTheDocument();
  });
});
