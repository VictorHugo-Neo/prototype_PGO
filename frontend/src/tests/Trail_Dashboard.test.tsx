import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Dashboard from '../pages/Dashboard';
import Trail from '../pages/Trail'

describe('Routing', () => {
    it('renders home by default', () => {
        render(<Dashboard />);
        expect(screen.getByText(/Dashboard Advisor/i)).toBeInTheDocument();
    });
    it('renders home by default', () => {
        render(<Trail />);
        expect(screen.getByText(/Trail Student/i)).toBeInTheDocument();
    });
});