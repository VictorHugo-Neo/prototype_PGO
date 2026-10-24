import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { KpiCards } from './KpiCards';
import { GuidanceCard } from './GuidanceCard';
import type { DashboardStats, StudentGuidance, GuidanceKanbanSummary } from '../../../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Dashboard Integration with Kanban - Usability & Architecture', () => {
  const sampleStats: DashboardStats = {
    total_students: 3,
    total_tasks: 15,
    completed_tasks: 9,
    in_progress_tasks: 4,
    pending_meetings: 2,
    confirmed_meetings: 3,
    overall_progress: 60,
    task_stats: [
      { name: 'Pendente', slug: 'pending', value: 2, color: '#9CA3AF' },
      { name: 'Em Andamento', slug: 'in_progress', value: 4, color: '#3B82F6' },
      { name: 'Concluído', slug: 'completed', value: 9, color: '#10B981' },
    ],
    student_ranking: [
      { name: 'Lucas', progress: 100, guidance_id: 1, full_name: 'Lucas Silva', total_tasks: 5, completed_tasks: 5 },
      { name: 'Beatriz', progress: 60, guidance_id: 2, full_name: 'Beatriz Costa', total_tasks: 5, completed_tasks: 3 },
    ],
  };

  const sampleGuidance: StudentGuidance = {
    id: 1,
    theme: 'Deep Learning na Detecção de Falhas',
    defense_date: '2026-12-10T14:00:00',
    created_at: '2026-03-01T10:00:00',
    student: {
      id: 101,
      name: 'Lucas Silva',
      email: 'lucas@pgo.edu.br',
    },
  };

  const sampleSummary: GuidanceKanbanSummary = {
    guidance_id: 1,
    total_tasks: 6,
    completed_tasks: 4,
    in_progress_tasks: 1,
    pending_tasks: 1,
    progress: 67,
    pending_meetings: 1,
    confirmed_meetings: 2,
    columns: [
      { title: 'A Fazer', slug: 'pending', color: 'bg-gray-100', task_count: 1 },
      { title: 'Em Andamento', slug: 'in_progress', color: 'bg-blue-50', task_count: 1 },
      { title: 'Concluído', slug: 'completed', color: 'bg-green-50', task_count: 4 },
    ],
  };

  it('renders KpiCards with complete Kanban-aligned workload metrics', () => {
    render(<KpiCards stats={sampleStats} />);

    expect(screen.getByText('Total de Alunos')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    expect(screen.getByText('Tarefas Concluídas')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('/ 15 total')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();

    expect(screen.getByText('Em Andamento (WIP)')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    expect(screen.getByText('Reuniões Pendentes')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/Aguardando resposta/i)).toBeInTheDocument();
  });

  it('renders GuidanceCard with Kanban progress bar, mini column chips and meeting alert', () => {
    render(
      <MemoryRouter>
        <GuidanceCard guidance={sampleGuidance} summary={sampleSummary} />
      </MemoryRouter>
    );

    expect(screen.getByText('Lucas Silva')).toBeInTheDocument();
    expect(screen.getByText('Deep Learning na Detecção de Falhas')).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText(/de 6 concluídas/i)).toBeInTheDocument();

    expect(screen.getByText(/A Fazer:/)).toBeInTheDocument();
    expect(screen.getByText(/Em Andamento:/)).toBeInTheDocument();
    expect(screen.getByText(/Concluído:/)).toBeInTheDocument();

    expect(screen.getByText(/1 reunião/)).toBeInTheDocument();
    expect(screen.getByText('Ver Kanban')).toBeInTheDocument();
  });

  it('navigates to guidance Kanban when GuidanceCard is clicked or pressed Enter', () => {
    render(
      <MemoryRouter>
        <GuidanceCard guidance={sampleGuidance} summary={sampleSummary} />
      </MemoryRouter>
    );

    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(mockNavigate).toHaveBeenCalledWith('/guidance/1');

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/guidance/1');
  });
});
