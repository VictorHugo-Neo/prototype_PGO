import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuidanceCompactList } from './GuidanceCompactList';
import type { StudentGuidance, DashboardStats } from '../../../types';

describe('GuidanceCompactList - Minimalist Executive View', () => {
  const sampleGuidances: StudentGuidance[] = [
    {
      id: 1,
      theme: 'Machine Learning aplicado a Redes Elétricas',
      defense_date: '2026-12-15T10:00:00',
      created_at: '2026-03-01T10:00:00',
      student: { id: 101, name: 'Mariana Lima', email: 'mariana@pgo.edu.br' },
    },
    {
      id: 2,
      theme: 'Criptografia Pós-Quântica',
      defense_date: undefined,
      created_at: '2026-03-01T10:00:00',
      student: { id: 102, name: 'Gabriel Santos', email: 'gabriel@pgo.edu.br' },
      user_role: 'coadvisor',
    },
  ];

  const sampleStats: DashboardStats = {
    total_students: 2,
    total_tasks: 10,
    completed_tasks: 5,
    in_progress_tasks: 2,
    pending_meetings: 1,
    overall_progress: 50,
    task_stats: [],
    student_ranking: [],
    guidances_summary: {
      '1': {
        guidance_id: 1,
        total_tasks: 6,
        completed_tasks: 4,
        in_progress_tasks: 2,
        pending_tasks: 0,
        progress: 67,
        pending_meetings: 0,
        confirmed_meetings: 1,
      },
      '2': {
        guidance_id: 2,
        total_tasks: 4,
        completed_tasks: 1,
        in_progress_tasks: 0,
        pending_tasks: 3,
        progress: 25,
        pending_meetings: 1,
        confirmed_meetings: 0,
      },
    },
  };

  it('renders compact table with students, progress, and badges', () => {
    const onNavigate = vi.fn();
    const onNotify = vi.fn();

    render(
      <GuidanceCompactList
        guidances={sampleGuidances}
        stats={sampleStats}
        onNotifyStudent={onNotify}
        onNavigateGuidance={onNavigate}
      />
    );

    expect(screen.getByText('Mariana Lima')).toBeInTheDocument();
    expect(screen.getByText('Machine Learning aplicado a Redes Elétricas')).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('4/6 tarefas')).toBeInTheDocument();

    expect(screen.getByText('Gabriel Santos')).toBeInTheDocument();
    expect(screen.getByText('Coorientador')).toBeInTheDocument();
    expect(screen.getByText('1 pendente')).toBeInTheDocument();
  });

  it('calls onNavigateGuidance when clicking a row or pressing Enter', () => {
    const onNavigate = vi.fn();
    const onNotify = vi.fn();

    render(
      <GuidanceCompactList
        guidances={sampleGuidances}
        stats={sampleStats}
        onNotifyStudent={onNotify}
        onNavigateGuidance={onNavigate}
      />
    );

    const row = screen.getByLabelText(/orientação de mariana lima/i);
    fireEvent.click(row);
    expect(onNavigate).toHaveBeenCalledWith(1);

    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('calls onNotifyStudent when clicking notify button without propagating to row', () => {
    const onNavigate = vi.fn();
    const onNotify = vi.fn();

    render(
      <GuidanceCompactList
        guidances={sampleGuidances}
        stats={sampleStats}
        onNotifyStudent={onNotify}
        onNavigateGuidance={onNavigate}
      />
    );

    const notifyBtn = screen.getByRole('button', { name: /notificar mariana lima/i });
    fireEvent.click(notifyBtn);
    expect(onNotify).toHaveBeenCalledWith(101);
  });
});
