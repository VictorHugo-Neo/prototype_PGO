import React from 'react';
import { Plus, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';
import type { Task, TaskStatus, KanbanColumn as KanbanColumnItem } from '../../../types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  id: TaskStatus;
  column: KanbanColumnItem;
  tasks: Task[];
  color: string;
  icon: React.ReactNode;
  onClickTask: (task: Task) => void;
  onOpenCreateTask?: (status: TaskStatus) => void;
  isAdvisor?: boolean;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  onEditColumn?: (col: KanbanColumnItem) => void;
  onDeleteColumn?: (col: KanbanColumnItem) => void;
  onMoveColumnLeft?: (col: KanbanColumnItem) => void;
  onMoveColumnRight?: (col: KanbanColumnItem) => void;
}

export function KanbanColumn({
  id,
  column,
  tasks,
  color,
  icon,
  onClickTask,
  onOpenCreateTask,
  isAdvisor,
  canMoveLeft,
  canMoveRight,
  onEditColumn,
  onDeleteColumn,
  onMoveColumnLeft,
  onMoveColumnRight,
}: KanbanColumnProps) {
  const { title } = column;

  return (
    <div className={`flex flex-col rounded-xl p-4 min-h-[500px] w-80 min-w-[20rem] flex-shrink-0 ${color}`}>
      <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
        <div className="shrink-0">{icon}</div>
        <h3 className="truncate font-semibold text-sm text-gray-800" title={title}>
          {title}
        </h3>
        <span className="bg-white px-2 py-0.5 rounded-full text-xs shadow-2xs text-gray-500 border border-gray-100 font-bold">
          {tasks.length}
        </span>

        {isAdvisor && (
          <div className="ml-auto flex items-center gap-0.5 bg-white/70 backdrop-blur-xs p-0.5 rounded-lg border border-gray-200/60 shadow-2xs">
            {onMoveColumnLeft && (
              <button
                type="button"
                onClick={() => onMoveColumnLeft(column)}
                disabled={!canMoveLeft}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors"
                title={canMoveLeft ? 'Mover coluna para a esquerda' : 'Primeira coluna'}
                aria-label={`Mover coluna ${title} para a esquerda`}
              >
                <ChevronLeft size={14} />
              </button>
            )}

            {onMoveColumnRight && (
              <button
                type="button"
                onClick={() => onMoveColumnRight(column)}
                disabled={!canMoveRight}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors"
                title={canMoveRight ? 'Mover coluna para a direita' : 'Última coluna'}
                aria-label={`Mover coluna ${title} para a direita`}
              >
                <ChevronRight size={14} />
              </button>
            )}

            {onEditColumn && (
              <button
                type="button"
                onClick={() => onEditColumn(column)}
                className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-white transition-colors"
                title={`Editar coluna "${title}"`}
                aria-label={`Editar coluna "${title}"`}
              >
                <Pencil size={13} />
              </button>
            )}

            {onDeleteColumn && (
              <button
                type="button"
                onClick={() => onDeleteColumn(column)}
                className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-white transition-colors"
                title={`Excluir coluna "${title}"`}
                aria-label={`Excluir coluna "${title}"`}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}

        {onOpenCreateTask && (
          <button
            type="button"
            onClick={() => onOpenCreateTask(id)}
            className={`p-1 hover:bg-white rounded-lg text-gray-400 hover:text-blue-600 transition-colors shadow-none hover:shadow-xs ${
              !isAdvisor ? 'ml-auto' : ''
            }`}
            title={`Adicionar tarefa em ${title}`}
            aria-label={`Adicionar tarefa em ${title}`}
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-3 transition-colors flex flex-col ${
              snapshot.isDraggingOver ? 'bg-blue-100/30 rounded-lg p-1' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={index}
                onClick={onClickTask}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-28 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center p-3 text-gray-400 mt-2">
                <p className="text-xs">Nenhuma tarefa nesta etapa</p>
                {onOpenCreateTask && (
                  <button
                    type="button"
                    onClick={() => onOpenCreateTask(id)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    + Criar Tarefa
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Droppable>

      {onOpenCreateTask && tasks.length > 0 && (
        <button
          type="button"
          onClick={() => onOpenCreateTask(id)}
          className="mt-3 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-white/80 rounded-lg transition-colors border border-dashed border-transparent hover:border-gray-200"
        >
          <Plus size={14} /> Adicionar tarefa
        </button>
      )}
    </div>
  );
}
