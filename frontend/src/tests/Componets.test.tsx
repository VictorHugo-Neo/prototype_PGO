import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/StatusBadge';

describe('UI Components', () => {
  it('ProgressBar renders correct width', () => {
    render(<ProgressBar progress={50} />);
    const bar = screen.getByRole('progressbar');

    expect(bar).toHaveAttribute('aria-valuenow', '50');
    
    const innerDiv = bar.firstChild;
    expect(innerDiv).toHaveStyle({ width: '50%' });
  });

  it('StatusBadge renders correct text and color', () => {
    render(<StatusBadge status="atrasado" />);
    const badge = screen.getByText('ATRASADO');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-red-800');
  });
});