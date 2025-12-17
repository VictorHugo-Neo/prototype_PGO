import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('Routing', () => {
  it('renders home by default', () => {
    render(<App />);
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
  });

});