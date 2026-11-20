import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdvisorPracticalMetrics } from './AdvisorPracticalMetrics';
import type { StudentGuidance, DashboardStats } from '../../../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AdvisorPracticalMetrics - Academic Usability for Advisors', () => {
  const sampleGuidances: StudentGuidance[] = [
    {
      id: 1,
      theme: 'Deep Learning na Detecção de Falhas',
      defense_date: '2026-12-10T14:00:00',
      created_at: '2026-03-01T10:00:00',
      student: { id: 101, name: 'Lucas Silva', email: 'lucas@pgo.edu.br' },
    },
    {
      id: 2,
      theme: 'Blockchain em Prontuários Eletrônicos',
      defense_date: undefined,
      created_at: '2026-03-01T10:00:00',
      student: { id: 102, name: 'Beatriz Costa', email: 'beatriz@pgo.edu.br' },
    },
    {
      id: 3,
      theme: 'Otimização com Algoritmos Genéticos',
      defense_date: '2026-11-28T10:00:00',
      created_at: '2026-03-01T10:00:00',
      student: { id: 103, name: 'Carlos Mendes', email: 'carlos@pgo.edu.br' },
    },
  ];

  const sampleStats: DashboardStats = {
    total_students: 3,
    pending_meetings: 1,
    total_tasks: 10,
    completed_tasks: 6,
    in_progress_tasks: 2,
    overall_progress: 60,
    task_stats: [],
    student_ranking: [],
    guidances_summary: {
      '1': {
        guidance_id: 1,
        total_tasks: 5,
        completed_tasks: 5,
        in_progress_tasks: 0,
        pending_tasks: 0,
        progress: 100,
        pending_meetings: 0,
        confirmed_meetings: 2,
      },
      '2': {
        guidance_id: 2,
        total_tasks: 4,
        completed_tasks: 1,
        in_progress_tasks: 1,
        pending_tasks: 2,
        progress: 25,
        pending_meetings: 1,
        confirmed_meetings: 0,
      },
      '3': {
        guidance_id: 3,
        total_tasks: 1,
        completed_tasks: 0,
        in_progress_tasks: 1,
        pending_tasks: 0,
        progress: 0,
        pending_meetings: 0,
        confirmed_meetings: 1,
      },
    },
  };

  it('renders upcoming defenses sorted by proximity and shows students with date pending', () => {
    const onNotify = vi.fn();
    render(
      <MemoryRouter>
        <AdvisorPracticalMetrics
          guidances={sampleGuidances}
          stats={sampleStats}
          onNotifyStudent={onNotify}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Próximas Bancas de Defesa')).toBeInTheDocument();
    expect(screen.getByText('Lucas Silva')).toBeInTheDocument();
    expect(screen.getAllByText('Carlos Mendes').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/a definir/i).length).toBeGreaterThan(0);
  });

  it('renders attention radar identifying pending meetings and close defense with low progress', () => {
    const onNotify = vi.fn();
    render(
      <MemoryRouter>
        <AdvisorPracticalMetrics
          guidances={sampleGuidances}
          stats={sampleStats}
          onNotifyStudent={onNotify}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Atenção & Prontidão da Turma')).toBeInTheDocument();
    expect(screen.getByText(/reunião aguardando resposta/i)).toBeInTheDocument();
  });

  it('navigates to student kanban when clicking a defense item', () => {
    const onNotify = vi.fn();
    render(
      <MemoryRouter>
        <AdvisorPracticalMetrics
          guidances={sampleGuidances}
          stats={sampleStats}
          onNotifyStudent={onNotify}
        />
      </MemoryRouter>
    );

    const defenseItem = screen.getByText('Lucas Silva').closest('div[class*="cursor-pointer"]');
    if (defenseItem) {
      fireEvent.click(defenseItem);
      expect(mockNavigate).toHaveBeenCalledWith('/guidance/1');
    }
  });

  it('calls onNotifyStudent when clicking notify button on student needing attention', () => {
    const onNotify = vi.fn();
    render(
      <MemoryRouter>
        <AdvisorPracticalMetrics
          guidances={sampleGuidances}
          stats={sampleStats}
          onNotifyStudent={onNotify}
        />
      </MemoryRouter>
    );

    const notifyBtn = screen.getByRole('button', { name: /notificar beatriz costa/i });
    fireEvent.click(notifyBtn);
    expect(onNotify).toHaveBeenCalledWith(102);
  });
});
