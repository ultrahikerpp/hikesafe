import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Home from '@/app/page';

describe('home navigation', () => {
  it('keeps the four primary trip actions available as semantic navigation', () => {
    render(<Home />);
    expect(screen.getByRole('navigation', { name: '主要操作' })).toBeInTheDocument();
    for (const label of ['建立行程', '開始登山', '進度回報', '安全下山']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });
});
