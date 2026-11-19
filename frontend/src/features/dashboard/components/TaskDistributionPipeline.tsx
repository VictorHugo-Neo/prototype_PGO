import type { DashboardTaskStat } from '../../../types';

interface TaskDistributionPipelineProps {
  data: DashboardTaskStat[];
  totalTasks: number;
  completionRate: number;
  effectiveIndex: number | null;
  selectedSlug: string | null;
}

export function TaskDistributionPipeline({
  data,
  totalTasks,
  completionRate,
  effectiveIndex,
  selectedSlug,
}: TaskDistributionPipelineProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium">
        <span>Esteira Contínua do Fluxo</span>
        <span className="font-semibold text-gray-700">{completionRate}% Concluído</span>
      </div>
      <div
        className="w-full h-2.5 rounded-full overflow-hidden flex bg-gray-100 p-0.5 gap-0.5 shadow-2xs"
        role="progressbar"
        aria-valuenow={completionRate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso geral do fluxo: ${completionRate}% concluído`}
      >
        {data.map((item) => {
          const pct = totalTasks > 0 ? (item.value / totalTasks) * 100 : 0;
          if (pct <= 0) return null;
          const isSelected = selectedSlug === (item.slug || item.name);
          return (
            <div
              key={item.slug || item.name}
              style={{
                width: `${pct}%`,
                backgroundColor: item.color,
                opacity: effectiveIndex === null || isSelected ? 1 : 0.45,
              }}
              className="h-full rounded-full transition-all duration-300"
              title={`${item.name}: ${item.value} tarefas (${Math.round(pct)}%)`}
            />
          );
        })}
      </div>
    </div>
  );
}
