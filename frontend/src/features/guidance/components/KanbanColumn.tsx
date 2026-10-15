import React from 'react';
import { Plus } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';
import type { Task, TaskStatus } from '../../../types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
  icon: React.ReactNode;
  onClickTask: (task: Task) => void;
  onOpenCreateTask?: (status: TaskStatus) => void;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  color,
  icon,
  onClickTask,
  onOpenCreateTask,
}: KanbanColumnProps) {
  return (
    <div className={`flex flex-col rounded-xl p-4 min-h-[500px] ${color}`}>
      <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
        {icon}
        <h3>{title}</h3>
        <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-xs shadow-sm text-gray-500 border border-gray-100">
          {tasks.length}
        </span>
        {onOpenCreateTask && (
          <button
            type="button"
            onClick={() => onOpenCreateTask(id)}
            className="p-1 hover:bg-white rounded-lg text-gray-400 hover:text-blue-600 transition-colors shadow-none hover:shadow-sm"
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
