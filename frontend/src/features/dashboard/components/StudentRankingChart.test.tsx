import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudentRankingChart } from './StudentRankingChart';
import type { StudentRanking } from '../../../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('StudentRankingChart - Academic Progress Ranking', () => {
  const sampleData: StudentRanking[] = [
    {
      id: 1,
      guidance_id: 10,
      name: 'Lucas',
      full_name: 'Lucas Silva',
      theme: 'Deep Learning',
      progress: 100,
      total_tasks: 5,
      completed_tasks: 5,
    },
    {
      id: 2,
      guidance_id: 20,
      name: 'Beatriz',
      full_name: 'Beatriz Costa',
      theme: 'Blockchain',
      progress: 60,
      total_tasks: 5,
      completed_tasks: 3,
    },
  ];

  it('renders correctly with title, student count, and class average badge', () => {
    render(
      <MemoryRouter>
        <StudentRankingChart data={sampleData} />
      </MemoryRouter>
    );

    expect(screen.getByText('Progresso dos Alunos (%)')).toBeInTheDocument();
    expect(screen.getByText(/2 alunos/i)).toBeInTheDocument();
    expect(screen.getByText(/Média da Turma:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/80%/i).length).toBeGreaterThan(0);
  });

  it('renders accessible empty state when data is empty', () => {
    render(
      <MemoryRouter>
        <StudentRankingChart data={[]} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Nenhum aluno com progresso registrado/i)).toBeInTheDocument();
    expect(screen.getByText(/Conclua tarefas nas colunas dos quadros Kanban/i)).toBeInTheDocument();
  });
});
