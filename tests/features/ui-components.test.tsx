import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Chip } from '@/app/components/Chip';
import { Expander } from '@/app/components/Expander';
import { Notice } from '@/app/components/Notice';

describe('Button', () => {
  it('defaults to a non-submitting primary button', () => {
    render(<Button>送出</Button>);
    const button = screen.getByRole('button', { name: '送出' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('btn', 'btn-primary');
  });

  it('applies the requested variant and keeps custom class names', () => {
    render(<Button variant="danger" className="extra">求助</Button>);
    expect(screen.getByRole('button', { name: '求助' })).toHaveClass('btn', 'btn-danger', 'extra');
  });
});

describe('Card', () => {
  it('renders an optional title as a heading with its content', () => {
    render(<Card title="路線"><p>七星山</p></Card>);
    expect(screen.getByRole('heading', { name: '路線' })).toBeInTheDocument();
    expect(screen.getByText('七星山')).toBeInTheDocument();
  });
});

describe('Chip', () => {
  it('applies the tone class', () => {
    render(<Chip tone="success">進行中</Chip>);
    expect(screen.getByText('進行中')).toHaveClass('chip', 'chip-success');
  });
});

describe('Notice', () => {
  it('announces errors assertively and other tones politely', () => {
    render(<><Notice tone="error">錯誤</Notice><Notice tone="warning">警告</Notice></>);
    expect(screen.getByRole('alert')).toHaveTextContent('錯誤');
    expect(screen.getByRole('status')).toHaveTextContent('警告');
  });
});

const ExpanderHarness = () => {
  const [open, setOpen] = useState(false);
  return <Expander label="回報平安" open={open} onToggle={() => setOpen((value) => !value)}>
    <p>展開內容</p>
  </Expander>;
};

describe('Expander', () => {
  it('shows its body only while expanded', () => {
    render(<ExpanderHarness />);
    expect(screen.queryByText('展開內容')).not.toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: '回報平安' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(screen.getByText('展開內容')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});
