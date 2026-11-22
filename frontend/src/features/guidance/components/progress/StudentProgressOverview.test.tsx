import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { StudentProgressOverview } from './StudentProgressOverview';
import type { KanbanColumn, Meeting, Task } from '../../../../types';

const columns: KanbanColumn[] = [
  { id: 1, guidance_id: 1, title: 'A Fazer', slug: 'pending', color: 'bg-gray-100', order: 0 },
  { id: 2, guidance_id: 1, title: 'Em Andamento', slug: 'in_progress', color: 'bg-blue-50', order: 1 },
  { id: 3, guidance_id: 1, title: 'Concluído', slug: 'completed', color: 'bg-green-50', order: 2 },
];

const tasks: Task[] = [
  { id: 101, title: 'Revisão Bibliográfica', status: 'completed', guidance_id: 1 },
  { id: 102, title: 'Desenvolvimento do Modelo Neural', status: 'in_progress', guidance_id: 1 },
  { id: 103, title: 'Escrita dos Resultados', status: 'pending', guidance_id: 1 },
];

const meeting = (id: number, date: string, status: Meeting['status'], topic: string): Meeting => ({
  id,
  date,
  status,
  topic,
  guidance_id: 1,
});

function renderOverview(props: Partial<React.ComponentProps<typeof StudentProgressOverview>> = {}) {
  const onTaskClick = vi.fn();
  const onOpenCreateTask = vi.fn();
  const onOpenMeetingsModal = vi.fn();
  render(
    <StudentProgressOverview
      tasks={tasks}
      columns={columns}
      meetings={[]}
      onTaskClick={onTaskClick}
      onOpenCreateTask={onOpenCreateTask}
      onOpenMeetingsModal={onOpenMeetingsModal}
      {...props}
    />
  );
  return { onTaskClick, onOpenCreateTask, onOpenMeetingsModal };
}

describe('StudentProgressOverview', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-21T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows only the current task, overall progress and next meeting', () => {
    renderOverview({
      meetings: [meeting(1, '2026-11-28T14:30:00', 'confirmed', 'Alinhamento dos Resultados')],
    });

    expect(screen.getByText('Em Andamento')).toBeInTheDocument();
    expect(screen.getByText('Desenvolvimento do Modelo Neural')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument();
    expect(screen.getByText('1 de 3 tarefas')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Tarefas concluídas' })).toHaveAttribute('aria-valuenow', '33');
    expect(screen.getByText('Alinhamento dos Resultados')).toBeInTheDocument();
  });

  it('opens the in-progress task', () => {
    const { onTaskClick } = renderOverview();
    fireEvent.click(screen.getByRole('button', { name: /continuar tarefa/i }));
    expect(onTaskClick).toHaveBeenCalledWith(tasks[1]);
  });

  it('recommends the first open task when nothing is in progress', () => {
    const { onTaskClick } = renderOverview({
      tasks: [
        { id: 1, title: 'Artigo Inicial', status: 'completed', guidance_id: 1 },
        { id: 2, title: 'Definir Arquitetura', status: 'pending', guidance_id: 1 },
      ],
    });

    expect(screen.getByText('A Fazer')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /iniciar tarefa/i }));
    expect(onTaskClick).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
  });

  it('shows a quiet completed state without a task action', () => {
    renderOverview({
      tasks: [{ id: 1, title: 'Entrega', status: 'completed', guidance_id: 1 }],
    });

    expect(screen.getByText('Todas concluídas')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /tarefa/i })).not.toBeInTheDocument();
  });

  it('offers task creation when there are no tasks', () => {
    const { onOpenCreateTask } = renderOverview({ tasks: [] });

    expect(screen.getByText('Nenhuma tarefa criada')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /criar tarefa/i }));
    expect(onOpenCreateTask).toHaveBeenCalledTimes(1);
  });

  it('treats a custom column between entry and completion as active work', () => {
    const { onTaskClick } = renderOverview({
      columns: [
        columns[0],
        columns[1],
        { id: 4, guidance_id: 1, title: 'Revisão do Orientador', slug: 'revisao', color: 'bg-purple-50', order: 2 },
        { ...columns[2], order: 3 },
      ],
      tasks: [
        { id: 1, title: 'Capítulo 1', status: 'in_progress', guidance_id: 1 },
        { id: 2, title: 'Capítulo 2', status: 'revisao', guidance_id: 1 },
        { id: 3, title: 'Resumo', status: 'completed', guidance_id: 1 },
      ],
    });

    expect(screen.getByText('Revisão do Orientador')).toBeInTheDocument();
    expect(screen.getByText('1 de 3 tarefas')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /continuar tarefa/i }));
    expect(onTaskClick).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
  });

  it('does not count or prioritize a column added after completion', () => {
    renderOverview({
      columns: [
        ...columns,
        { id: 4, guidance_id: 1, title: 'Ideias Futuras', slug: 'ideias', color: 'bg-purple-50', order: 3 },
      ],
      tasks: [
        { id: 1, title: 'Ideia', status: 'ideias', guidance_id: 1 },
        { id: 2, title: 'Capítulo atual', status: 'in_progress', guidance_id: 1 },
        { id: 3, title: 'Resumo', status: 'completed', guidance_id: 1 },
      ],
    });

    expect(screen.getByText('Capítulo atual')).toBeInTheDocument();
    expect(screen.getByText('1 de 3 tarefas')).toBeInTheDocument();
  });

  it('uses the last column as completion on fully custom boards, following column order', () => {
    renderOverview({
      columns: [
        { id: 7, guidance_id: 1, title: 'Aprovado', slug: 'aprovado', color: 'bg-green-50', order: 2 },
        { id: 5, guidance_id: 1, title: 'Ideias', slug: 'ideias', color: 'bg-gray-100', order: 0 },
        { id: 6, guidance_id: 1, title: 'Escrita', slug: 'escrita', color: 'bg-blue-50', order: 1 },
      ],
      tasks: [
        { id: 1, title: 'Introdução', status: 'aprovado', guidance_id: 1 },
        { id: 2, title: 'Metodologia', status: 'escrita', guidance_id: 1 },
      ],
    });

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Escrita')).toBeInTheDocument();
    expect(screen.getByText('Metodologia')).toBeInTheDocument();
  });

  it('picks the nearest future meeting and ignores past or rejected ones', () => {
    renderOverview({
      meetings: [
        meeting(1, '2026-11-10T10:00:00', 'confirmed', 'Reunião passada'),
        meeting(2, '2026-11-23T10:00:00', 'rejected', 'Reunião recusada'),
        meeting(3, '2026-12-05T10:00:00', 'confirmed', 'Reunião distante'),
        meeting(4, '2026-11-25T10:00:00', 'pending', 'Reunião próxima'),
      ],
    });

    const card = within(screen.getByTestId('student-next-meeting'));
    expect(card.getByText('Reunião próxima')).toBeInTheDocument();
    expect(card.getByText('Aguardando')).toBeInTheDocument();
    expect(card.queryByText('Reunião passada')).not.toBeInTheDocument();
  });

  it('opens meetings from the meeting summary, including its empty state', () => {
    const { onOpenMeetingsModal } = renderOverview({
      meetings: [meeting(1, '2026-11-10T10:00:00', 'confirmed', 'Reunião passada')],
    });

    expect(screen.getByText('Nenhuma agendada')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('student-next-meeting'));
    expect(onOpenMeetingsModal).toHaveBeenCalledTimes(1);
  });
});
