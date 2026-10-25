import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { KanbanCard } from './KanbanCard';
import { TaskDetailsModal } from './TaskDetailsModal';
import { KanbanBoard } from './KanbanBoard';
import type { Task, KanbanColumn } from '../../../types';

function renderKanbanCard(task: Task) {
  return render(
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="test-droppable">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <KanbanCard task={task} index={0} onClick={() => {}} />
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

describe('Task Creator Identification', () => {
  const advisorTask: Task = {
    id: 1,
    title: 'Capítulo 1 - Revisão Bibliográfica',
    description: 'Elaborar revisão com base nos artigos da IEEE',
    status: 'pending',
    guidance_id: 10,
    time_estimate: '2026-11-01T00:00:00Z',
    creator_id: 101,
    creator: {
      id: 101,
      name: 'Prof. Carlos Alberto',
      email: 'carlos@universidade.edu',
      type: 'advisor',
    },
  };

  const studentTask: Task = {
    id: 2,
    title: 'Coleta de Dados em Campo',
    description: 'Entrevistas realizadas com a equipe técnica',
    status: 'pending',
    guidance_id: 10,
    time_estimate: '2026-11-05T00:00:00Z',
    creator_id: 202,
    creator: {
      id: 202,
      name: 'Mariana Lima',
      email: 'mariana@aluno.edu',
      type: 'student',
    },
  };

  const legacyTask: Task = {
    id: 3,
    title: 'Tarefa Antiga sem Criador',
    description: 'Tarefa criada antes do sistema registrar o autor',
    status: 'in_progress',
    guidance_id: 10,
  };

  const sampleColumns: KanbanColumn[] = [
    { id: 1, guidance_id: 10, title: 'A Fazer', slug: 'pending', color: 'bg-gray-100', order: 0 },
    { id: 2, guidance_id: 10, title: 'Em Andamento', slug: 'in_progress', color: 'bg-blue-50', order: 1 },
    { id: 3, guidance_id: 10, title: 'Concluído', slug: 'completed', color: 'bg-green-50', order: 2 },
  ];

  describe('KanbanCard badges', () => {
    it('renders "Orientador" badge when creator is an advisor', () => {
      renderKanbanCard(advisorTask);

      const badge = screen.getByTestId('badge-advisor');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Orientador');
      expect(badge).toHaveAttribute('title', expect.stringContaining('Prof. Carlos Alberto'));
      expect(screen.queryByTestId('badge-student')).not.toBeInTheDocument();
    });

    it('renders "Aluno" badge when creator is a student', () => {
      renderKanbanCard(studentTask);

      const badge = screen.getByTestId('badge-student');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Aluno');
      expect(badge).toHaveAttribute('title', expect.stringContaining('Mariana Lima'));
      expect(screen.queryByTestId('badge-advisor')).not.toBeInTheDocument();
    });

    it('renders card gracefully without badges when creator is missing', () => {
      renderKanbanCard(legacyTask);

      expect(screen.getByText('Tarefa Antiga sem Criador')).toBeInTheDocument();
      expect(screen.queryByTestId('badge-advisor')).not.toBeInTheDocument();
      expect(screen.queryByTestId('badge-student')).not.toBeInTheDocument();
    });
  });

  describe('TaskDetailsModal creator information', () => {
    it('displays creator name and role for advisor-created task', () => {
      render(
        <TaskDetailsModal
          task={advisorTask}
          comments={[]}
          attachments={[]}
          columns={sampleColumns}
          onClose={() => {}}
          onUpdateStatus={async () => {}}
          onUpdateTask={async () => advisorTask}
          onDeleteTask={async () => {}}
          onAddComment={async () => {}}
          onUploadAttachment={async () => {}}
        />
      );

      const creatorInfo = screen.getByTestId('task-creator-info');
      expect(creatorInfo).toBeInTheDocument();
      expect(creatorInfo).toHaveTextContent('Prof. Carlos Alberto');
      expect(creatorInfo).toHaveTextContent('Orientador');
    });

    it('displays creator name and role for student-created task', () => {
      render(
        <TaskDetailsModal
          task={studentTask}
          comments={[]}
          attachments={[]}
          columns={sampleColumns}
          onClose={() => {}}
          onUpdateStatus={async () => {}}
          onUpdateTask={async () => studentTask}
          onDeleteTask={async () => {}}
          onAddComment={async () => {}}
          onUploadAttachment={async () => {}}
        />
      );

      const creatorInfo = screen.getByTestId('task-creator-info');
      expect(creatorInfo).toBeInTheDocument();
      expect(creatorInfo).toHaveTextContent('Mariana Lima');
      expect(creatorInfo).toHaveTextContent('Aluno');
    });
  });

  describe('KanbanBoard author filtering', () => {
    const allTasks = [advisorTask, studentTask, legacyTask];

    it('shows filter toolbar with task counts and filters columns by author', () => {
      render(
        <KanbanBoard
          tasks={allTasks}
          columns={sampleColumns}
          isAdvisor={true}
          onDragEnd={() => {}}
          onTaskClick={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /todas \(3\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /orientador \(1\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /aluno \(1\)/i })).toBeInTheDocument();

      expect(screen.getByText('Capítulo 1 - Revisão Bibliográfica')).toBeInTheDocument();
      expect(screen.getByText('Coleta de Dados em Campo')).toBeInTheDocument();
      expect(screen.getByText('Tarefa Antiga sem Criador')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /orientador \(1\)/i }));

      expect(screen.getByText('Capítulo 1 - Revisão Bibliográfica')).toBeInTheDocument();
      expect(screen.queryByText('Coleta de Dados em Campo')).not.toBeInTheDocument();
      expect(screen.queryByText('Tarefa Antiga sem Criador')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /aluno \(1\)/i }));

      expect(screen.getByText('Coleta de Dados em Campo')).toBeInTheDocument();
      expect(screen.queryByText('Capítulo 1 - Revisão Bibliográfica')).not.toBeInTheDocument();
      expect(screen.queryByText('Tarefa Antiga sem Criador')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /todas \(3\)/i }));

      expect(screen.getByText('Capítulo 1 - Revisão Bibliográfica')).toBeInTheDocument();
      expect(screen.getByText('Coleta de Dados em Campo')).toBeInTheDocument();
      expect(screen.getByText('Tarefa Antiga sem Criador')).toBeInTheDocument();
    });
  });
});
