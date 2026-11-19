import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskStatusChart } from './TaskStatusChart';
import type { DashboardTaskStat } from '../../../types';

describe('TaskStatusChart - Kanban Column Flow & Usability', () => {
  const sampleData: DashboardTaskStat[] = [
    { name: 'Pendente', slug: 'pending', value: 3, color: '#9CA3AF' },
    { name: 'Em Andamento', slug: 'in_progress', value: 5, color: '#3B82F6' },
    { name: 'Concluído', slug: 'completed', value: 12, color: '#10B981' },
  ];

  it('renders correctly with title, total count badge, pipeline stream, and column layout', () => {
    render(<TaskStatusChart data={sampleData} />);

    expect(screen.getByText('Distribuição no Kanban')).toBeInTheDocument();
    expect(screen.getByText('20 tarefas')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /gráfico de distribuição de tarefas/i })).toBeInTheDocument();

    expect(screen.getByText('Esteira Contínua do Fluxo')).toBeInTheDocument();
    expect(screen.getByText('60% Concluído')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60');
  });

  it('renders accessible empty state when data is empty or zero', () => {
    render(<TaskStatusChart data={[]} />);

    expect(screen.getByText(/Nenhuma tarefa computada nos quadros Kanban/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Crie tarefas nos quadros de orientação dos seus alunos/i)
    ).toBeInTheDocument();
  });

  it('renders interactive column chips with task counts and percentages', () => {
    render(<TaskStatusChart data={sampleData} />);

    expect(screen.getByRole('button', { name: 'Pendente: 3 tarefas (15%)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Em Andamento: 5 tarefas (25%)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Concluído: 12 tarefas (60%)' })).toBeInTheDocument();
  });

  it('switches between Columns view and Horizontal Bars view smoothly', () => {
    render(<TaskStatusChart data={sampleData} />);

    const barTab = screen.getByRole('tab', { name: /visualização em barras horizontais/i });
    fireEvent.click(barTab);
    expect(barTab).toHaveAttribute('aria-selected', 'true');

    const columnTab = screen.getByRole('tab', { name: /visualização em colunas kanban/i });
    fireEvent.click(columnTab);
    expect(columnTab).toHaveAttribute('aria-selected', 'true');
  });

  it('updates selection and spotlight when a column is clicked', () => {
    render(<TaskStatusChart data={sampleData} />);

    const inProgressChip = screen.getByRole('button', { name: 'Em Andamento: 5 tarefas (25%)' });

    fireEvent.click(inProgressChip);
    expect(inProgressChip).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Limpar destaque')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Limpar destaque'));
    expect(inProgressChip).toHaveAttribute('aria-pressed', 'false');
  });

  it('displays executive flow insight summarizing WIP and completion', () => {
    render(<TaskStatusChart data={sampleData} />);

    expect(screen.getByText(/5 tarefas ativas em andamento \(25% do WIP\)\. 60% já entregues\./i)).toBeInTheDocument();
  });

  it('supports full keyboard accessibility navigation on interactive controls', () => {
    render(<TaskStatusChart data={sampleData} />);

    const barTab = screen.getByRole('tab', { name: /visualização em barras horizontais/i });
    barTab.focus();
    expect(barTab).toHaveFocus();

    const columnChip = screen.getByRole('button', { name: 'Em Andamento: 5 tarefas (25%)' });
    columnChip.focus();
    expect(columnChip).toHaveFocus();

    fireEvent.keyDown(columnChip, { key: 'Enter' });
    fireEvent.click(columnChip);
    expect(columnChip).toHaveAttribute('aria-pressed', 'true');
  });
});
