import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Home from '@/app/page';
import { copy } from '@/src/features/i18n/copy';

describe('home navigation', () => {
  it('keeps the four primary trip actions available as semantic navigation', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: copy.homeTitle })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: copy.primaryActions })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.createTrip })).toHaveAttribute('href', '/trips/new');
    expect(screen.getByRole('link', { name: copy.startHike })).toHaveAttribute('href', '/trips/active');
    expect(screen.getByRole('link', { name: copy.progressReport })).toHaveAttribute('href', '/trips/active#check-in');
    expect(screen.getByRole('link', { name: copy.safeDown })).toHaveAttribute('href', '/trips/active#finish');
  });
});
