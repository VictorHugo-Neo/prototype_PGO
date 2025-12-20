import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from '../pages/Dashboard';
import * as service from '../services/guidanceService';

vi.spyOn(service, 'getDashboardDate').mockResolvedValue([
  { id: 1, nameStudent: 'Teste User', theme: 'TCC Teste', progress: 50, status: 'ativo' }
]);

describe('Dashboard Page', () => {
  it('renders student cards after loading', async () => {
    render(<Dashboard />);

    expect(await screen.findByText(/Carregando painel.../i)).toBeInTheDocument();

   
    await waitFor(() => {
      expect(screen.getByText('Teste User')).toBeInTheDocument();
    });


    expect(screen.getByText('TCC Teste')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});