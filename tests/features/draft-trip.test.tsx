import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DraftTrip } from '@/app/trips/[tripId]/DraftTrip';
import { copy } from '@/src/features/i18n/copy';

describe('DraftTrip', () => {
  it('shows participants the planned trip and guardians with the start journey', () => {
    render(<DraftTrip tripId="trip-1" routeName="玉山主峰線" plannedFinishAt="2026-07-12T09:00:00.000Z" guardians={['小玉', '留守群組']} members={[{ id: 'member-1', name: '阿山', role: 'leader' }]} isOwner />);

    expect(screen.getByRole('heading', { name: copy.tripDraft })).toBeInTheDocument();
    expect(screen.getByText('玉山主峰線')).toBeInTheDocument();
    const guardianNames = copy.guardianNames(['小玉', '留守群組']);
    expect(screen.getByText((_, element) => element?.textContent === guardianNames)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: copy.startAndNotify })).toBeInTheDocument();
  });
});
