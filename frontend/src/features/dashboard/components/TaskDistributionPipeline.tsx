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
    <div className="space-y-2 p-3 bg-gray-50/70 rounded-xl border border-gray-100">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-gray-700">Esteira Contínua do Fluxo</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-emerald-700 text-xs">{completionRate}% Concluído</span>
        </div>
      </div>

      <div
        className="w-full h-3 rounded-full overflow-hidden flex bg-gray-200/80 p-0.5 gap-0.5 shadow-inner"
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
                opacity: effectiveIndex === null || isSelected ? 1 : 0.4,
              }}
              className="h-full rounded-full transition-all duration-300 hover:brightness-110"
              title={`${item.name}: ${item.value} tarefas (${Math.round(pct)}%)`}
            />
          );
        })}
      </div>
    </div>
  );
}
