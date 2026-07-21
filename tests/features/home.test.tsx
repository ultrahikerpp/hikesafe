import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { HomeContent } from '@/app/HomeContent';
import { copy } from '@/src/features/i18n/copy';

describe('home content', () => {
  afterEach(cleanup);

  it('keeps the four primary trip actions available as semantic navigation', () => {
    render(<HomeContent />);
    expect(screen.getByRole('heading', { name: copy.homeTitle })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: copy.primaryActions })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.createTrip })).toHaveAttribute('href', '/trips/new');
    expect(screen.getByRole('link', { name: copy.startHike })).toHaveAttribute('href', '/trips/active');
    expect(screen.getByRole('link', { name: copy.progressReport })).toHaveAttribute('href', '/trips/active#check-in');
    expect(screen.getByRole('link', { name: copy.safeDown })).toHaveAttribute('href', '/trips/active#finish');
  });

  it('shows the active trip card with a link to the trip page when one exists', () => {
    render(<HomeContent activeTrip={{ id: 'trip-1', routeName: '七星山主峰步道', plannedFinishAt: '2026-07-20 17:30 Asia/Taipei' }} />);
    expect(screen.getByText('七星山主峰步道')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.goToTrip })).toHaveAttribute('href', '/trips/trip-1');
  });

  it('shows the create-first instructions when no trip is active', () => {
    render(<HomeContent />);
    expect(screen.getByText((_, element) => element?.textContent === copy.homeTripInstructions)).toBeInTheDocument();
  });

  it('links to the guardian management page', () => {
    render(<HomeContent />);

    expect(screen.getByRole('link', { name: copy.myGuardians })).toHaveAttribute('href', '/guardians');
  });
});
