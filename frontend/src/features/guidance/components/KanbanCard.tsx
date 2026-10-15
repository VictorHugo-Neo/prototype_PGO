import { Calendar } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '../../../types';

interface KanbanCardProps {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
}

export function KanbanCard({ task, index, onClick }: KanbanCardProps) {
  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          style={{ ...provided.draggableProps.style }}
          className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative ${
            snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-blue-500 z-50' : ''
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClick(task);
            }
          }}
        >
          <h4 className="font-medium text-gray-800 break-words line-clamp-2">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{task.description}</p>
          )}
          {task.time_estimate && (
            <div className="flex items-center gap-1 mt-3 text-[10px] text-gray-400 bg-gray-50 w-fit px-2 py-1 rounded">
              <Calendar size={10} aria-hidden="true" />{' '}
              {new Date(task.time_estimate).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
