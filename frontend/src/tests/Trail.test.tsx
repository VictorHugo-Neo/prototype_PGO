import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Trail from '../pages/Trail';
import * as service from '../services/trailService';


vi.spyOn(service, 'getStudentTasks').mockResolvedValue([
  { id: 1, order: 1, title: 'Tarefa 1', description: 'Desc', time_estimate: 'HJ', status: 'pendente' },
  { id: 2, order: 2, title: 'Tarefa 2', description: 'Desc', time_estimate: 'AM', status: 'concluido' }
]);
vi.spyOn(service, 'toggleTaskStatus').mockResolvedValue('concluido');

describe('Trilha Page', () => {
  it('renders tasks and progress correctly', async () => {
    render(<Trail />);

    await waitFor(() => {
      expect(screen.getByText('Tarefa 1')).toBeInTheDocument();
    });

    
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('updates progress when task is clicked', async () => {
    render(<Trail />);
    await waitFor(() => screen.getByText('Tarefa 1'));

    const task1 = screen.getByTestId('task-1');

    
    fireEvent.click(task1);

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });
});