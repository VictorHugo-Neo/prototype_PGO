import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from '../pages/Dashboard';
import Trail from '../pages/Trail';
import * as service from '../services/trailService';


vi.spyOn(service, 'getStudentTasks').mockResolvedValue([
  { id: 1, order: 1, title: 'Tarefa 1', description: 'Desc', time_estimate: 'HJ', status: 'pendente' }
]);

describe('Routing', () => {
    it('renders home by default', () => {
        render(<Dashboard />);
        
        expect(screen.getByText(/Carregando painel.../i)).toBeInTheDocument();
    });

    it('renders trail page correctly', async () => { 
        render(<Trail />);
        
        
        expect(await screen.findByText(/Tarefa 1/i)).toBeInTheDocument();
    });
});