import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/app/LiffBootstrap', () => ({ LiffBootstrap: () => <p>LIFF session pending</p> }));

import { GuardianViewer } from '@/app/trips/[tripId]/guardian-viewer/GuardianViewer';
import { JoinTrip } from '@/app/trips/join/[token]/JoinTrip';
import { copy } from '@/src/features/i18n/copy';

describe('LIFF deep links without a prior cookie', () => {
  afterEach(cleanup);
  it('keeps the invite token route visible but prevents join API calls until LIFF bootstrap establishes a session', () => {
    render(<JoinTrip token="invite-token" />);
    expect(screen.getByRole('button', { name: copy.joinTrip })).toBeDisabled();
    expect(screen.getByText('LIFF session pending')).toBeInTheDocument();
  });

  it('keeps the guardian grant in the client viewer component until bootstrap completes', () => {
    render(<GuardianViewer tripId="trip-1" grant="guardian-grant" />);
    expect(screen.getByRole('heading', { name: copy.guardianTripInfo })).toBeInTheDocument();
    expect(screen.getByText('LIFF session pending')).toBeInTheDocument();
  });
});
