interface StudentProgressMeterProps {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

export function StudentProgressMeter({
  totalTasks,
  completedTasks,
  completionPercentage,
}: StudentProgressMeterProps) {
  const hasTasks = totalTasks > 0;
  const isComplete = hasTasks && completedTasks === totalTasks;

  return (
    <div
      data-testid="student-progress-meter"
      className="flex min-w-0 flex-col justify-center border-r border-gray-100 px-4 py-3 sm:px-5 sm:py-4"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs text-gray-500">Progresso</p>
        {hasTasks && (
          <p className="text-xs tabular-nums text-gray-500">
            {completedTasks} de {totalTasks} {totalTasks === 1 ? 'tarefa' : 'tarefas'}
          </p>
        )}
      </div>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-gray-900">
        {hasTasks ? `${completionPercentage}%` : 'Sem tarefas'}
      </p>
      {hasTasks && (
        <div
          role="progressbar"
          aria-valuenow={completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tarefas concluídas"
          className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-100"
        >
          <div
            className={`h-full rounded-full transition-[width] duration-200 ease-out motion-reduce:transition-none ${
              isComplete ? 'bg-emerald-600' : 'bg-blue-600'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
