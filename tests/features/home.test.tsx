import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Home from '@/app/page';

describe('home navigation', () => {
  it('keeps the four primary trip actions available as semantic navigation', () => {
    render(<Home />);
    expect(screen.getByRole('navigation', { name: '主要操作' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '建立行程' })).toHaveAttribute('href', '/trips/new');
    expect(screen.getByRole('link', { name: '開始登山' })).toHaveAttribute('href', '/trips/active');
    expect(screen.getByRole('link', { name: '進度回報' })).toHaveAttribute('href', '/trips/active#check-in');
    expect(screen.getByRole('link', { name: '安全下山' })).toHaveAttribute('href', '/trips/active#finish');
  });
});
