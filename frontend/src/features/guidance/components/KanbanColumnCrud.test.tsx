import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditColumnModal } from './EditColumnModal';
import { DeleteColumnModal } from './DeleteColumnModal';
import { KanbanColumn } from './KanbanColumn';
import type { KanbanColumn as KanbanColumnItem, Task } from '../../../types';
import { DragDropContext } from '@hello-pangea/dnd';

describe('EditColumnModal', () => {
  const sampleColumn: KanbanColumnItem = {
    id: 10,
    guidance_id: 1,
    title: 'Em Revisão',
    slug: 'em_revisao',
    color: 'bg-purple-50',
    order: 1,
  };

  it('renders pre-filled data and allows updating column title and color', async () => {
    const handleUpdate = vi.fn().mockResolvedValue({});
    const handleClose = vi.fn();

    render(
      <EditColumnModal
        isOpen={true}
        column={sampleColumn}
        onClose={handleClose}
        onUpdate={handleUpdate}
      />
    );

    const input = screen.getByRole('textbox', { name: /nome da etapa/i }) as HTMLInputElement;
    expect(input.value).toBe('Em Revisão');

    fireEvent.change(input, { target: { value: 'Revisão Final do TCC' } });

    const greenBtn = screen.getByRole('button', { name: /verde/i });
    fireEvent.click(greenBtn);

    const submitBtn = screen.getByRole('button', { name: /salvar alterações/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalledWith(10, {
        title: 'Revisão Final do TCC',
        color: 'bg-emerald-50',
      });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('validates empty title and shows error message', async () => {
    const handleUpdate = vi.fn();
    const handleClose = vi.fn();

    render(
      <EditColumnModal
        isOpen={true}
        column={sampleColumn}
        onClose={handleClose}
        onUpdate={handleUpdate}
      />
    );

    const input = screen.getByRole('textbox', { name: /nome da etapa/i });
    fireEvent.change(input, { target: { value: '   ' } });

    const submitBtn = screen.getByRole('button', { name: /salvar alterações/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/o título da coluna é obrigatório/i)).toBeInTheDocument();
    expect(handleUpdate).not.toHaveBeenCalled();
  });
});

describe('DeleteColumnModal', () => {
  const colA: KanbanColumnItem = {
    id: 1,
    guidance_id: 1,
    title: 'A Fazer',
    slug: 'pending',
    color: 'bg-gray-100',
    order: 0,
  };
  const colB: KanbanColumnItem = {
    id: 2,
    guidance_id: 1,
    title: 'Em Andamento',
    slug: 'in_progress',
    color: 'bg-blue-50',
    order: 1,
  };

  it('prevents deletion when it is the only remaining column', () => {
    const handleDelete = vi.fn();
    const handleClose = vi.fn();

    render(
      <DeleteColumnModal
        isOpen={true}
        column={colA}
        tasksCount={0}
        availableColumns={[colA]}
        onClose={handleClose}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByText(/pelo menos uma coluna/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /sim, excluir/i })).not.toBeInTheDocument();
  });

  it('allows safe deletion when column has 0 tasks', async () => {
    const handleDelete = vi.fn().mockResolvedValue({});
    const handleClose = vi.fn();

    render(
      <DeleteColumnModal
        isOpen={true}
        column={colA}
        tasksCount={0}
        availableColumns={[colA, colB]}
        onClose={handleClose}
        onDelete={handleDelete}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /sim, excluir/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(handleDelete).toHaveBeenCalledWith(1, undefined);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('prompts to migrate tasks when column has tasks and migrates to selected column', async () => {
    const handleDelete = vi.fn().mockResolvedValue({});
    const handleClose = vi.fn();

    render(
      <DeleteColumnModal
        isOpen={true}
        column={colA}
        tasksCount={3}
        availableColumns={[colA, colB]}
        onClose={handleClose}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByText(/esta coluna possui 3 tarefas/i)).toBeInTheDocument();
    const select = screen.getByRole('combobox', { name: /mover tarefas para/i });
    expect(select).toBeInTheDocument();

    const migrateBtn = screen.getByRole('button', { name: /mover e excluir/i });
    fireEvent.click(migrateBtn);

    await waitFor(() => {
      expect(handleDelete).toHaveBeenCalledWith(1, 2);
      expect(handleClose).toHaveBeenCalled();
    });
  });
});

describe('KanbanColumn Role Permissions', () => {
  const col: KanbanColumnItem = {
    id: 1,
    guidance_id: 1,
    title: 'Planejado',
    slug: 'planejado',
    color: 'bg-gray-100',
    order: 0,
  };

  const tasks: Task[] = [];

  it('renders advisor management controls when isAdvisor is true', () => {
    render(
      <DragDropContext onDragEnd={() => {}}>
        <KanbanColumn
          id="planejado"
          column={col}
          tasks={tasks}
          color="bg-gray-100"
          icon={<span>icon</span>}
          onClickTask={() => {}}
          isAdvisor={true}
          canMoveLeft={true}
          canMoveRight={true}
          onEditColumn={() => {}}
          onDeleteColumn={() => {}}
          onMoveColumnLeft={() => {}}
          onMoveColumnRight={() => {}}
        />
      </DragDropContext>
    );

    expect(screen.getByTitle(/editar coluna/i)).toBeInTheDocument();
    expect(screen.getByTitle(/excluir coluna/i)).toBeInTheDocument();
    expect(screen.getByTitle(/mover coluna para a esquerda/i)).toBeInTheDocument();
    expect(screen.getByTitle(/mover coluna para a direita/i)).toBeInTheDocument();
  });

  it('hides advisor management controls when isAdvisor is false (student view)', () => {
    render(
      <DragDropContext onDragEnd={() => {}}>
        <KanbanColumn
          id="planejado"
          column={col}
          tasks={tasks}
          color="bg-gray-100"
          icon={<span>icon</span>}
          onClickTask={() => {}}
          isAdvisor={false}
          canMoveLeft={true}
          canMoveRight={true}
          onEditColumn={() => {}}
          onDeleteColumn={() => {}}
          onMoveColumnLeft={() => {}}
          onMoveColumnRight={() => {}}
        />
      </DragDropContext>
    );

    expect(screen.queryByTitle(/editar coluna/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/excluir coluna/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/mover coluna para a esquerda/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/mover coluna para a direita/i)).not.toBeInTheDocument();
  });
});
