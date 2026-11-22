import { ArrowRight, Plus } from 'lucide-react';
import type { Task } from '../../../../types';
import type { NextStepState } from '../../hooks/useStudentProgressMetrics';

interface StudentNextActionProps {
  nextTask: Task | null;
  columnTitle: string;
  nextStepState: NextStepState;
  onTaskClick: (task: Task) => void;
  onOpenCreateTask?: () => void;
}

const ACTION_CLASS =
  'inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

export function StudentNextAction({
  nextTask,
  columnTitle,
  nextStepState,
  onTaskClick,
  onOpenCreateTask,
}: StudentNextActionProps) {
  const title =
    nextTask?.title ?? (nextStepState === 'all_completed' ? 'Todas concluídas' : 'Nenhuma tarefa criada');
  const label = nextTask ? columnTitle || 'Próxima tarefa' : nextStepState === 'all_completed' ? 'Tarefas' : 'Primeiro passo';

  return (
    <div data-testid="student-next-action" className="col-span-2 flex min-w-0 items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4 lg:col-span-1 lg:border-r lg:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-xs text-gray-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-gray-900" title={title}>
          {title}
        </p>
      </div>

      {nextTask && (
        <button type="button" onClick={() => onTaskClick(nextTask)} className={ACTION_CLASS}>
          {nextStepState === 'in_progress' ? 'Continuar tarefa' : 'Iniciar tarefa'}
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      )}

      {nextStepState === 'no_tasks' && onOpenCreateTask && (
        <button type="button" onClick={onOpenCreateTask} className={ACTION_CLASS}>
          <Plus size={14} aria-hidden="true" />
          Criar tarefa
        </button>
      )}
    </div>
  );
}
