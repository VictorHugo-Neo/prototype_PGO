import { Calendar, GraduationCap, User } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '../../../types';

interface KanbanCardProps {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
}

export function KanbanCard({ task, index, onClick }: KanbanCardProps) {
  const isAdvisor = task.creator?.type === 'advisor';
  const isStudent = task.creator?.type === 'student';

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
          {task.creator && (
            <div className="mb-2">
              {isAdvisor && (
                <span
                  data-testid="badge-advisor"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80"
                  title={`Criada pelo orientador: ${task.creator.name}`}
                >
                  <GraduationCap size={11} aria-hidden="true" />
                  Orientador
                </span>
              )}
              {isStudent && (
                <span
                  data-testid="badge-student"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                  title={`Criada pelo aluno: ${task.creator.name}`}
                >
                  <User size={11} aria-hidden="true" />
                  Aluno
                </span>
              )}
            </div>
          )}

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
