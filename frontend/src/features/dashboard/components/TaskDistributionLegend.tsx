import type { DashboardTaskStat } from '../../../types';

interface TaskDistributionLegendProps {
  data: DashboardTaskStat[];
  totalTasks: number;
  activeIndex: number | null;
  selectedSlug: string | null;
  onItemToggle: (index: number) => void;
  onHoverIndex: (index: number | null) => void;
  onClearSelection: () => void;
}

export function TaskDistributionLegend({
  data,
  totalTasks,
  activeIndex,
  selectedSlug,
  onItemToggle,
  onHoverIndex,
  onClearSelection,
}: TaskDistributionLegendProps) {
  return (
    <div
      className="flex justify-center flex-wrap gap-2 pt-3 border-t border-gray-100"
      role="list"
      aria-label="Colunas e volumes do Kanban"
    >
      {data.map((entry, index) => {
        const pct = totalTasks > 0 ? Math.round((entry.value / totalTasks) * 100) : 0;
        const isSelected = selectedSlug === (entry.slug || entry.name);
        const isHovered = activeIndex === index;
        const isActive = isSelected || isHovered;

        return (
          <button
            key={entry.slug || entry.name || index}
            type="button"
            role="button"
            aria-pressed={isSelected}
            aria-label={`${entry.name}: ${entry.value} tarefas (${pct}%)`}
            onClick={() => onItemToggle(index)}
            onMouseEnter={() => onHoverIndex(index)}
            onMouseLeave={() => {
              if (selectedSlug === null) onHoverIndex(null);
            }}
            onFocus={() => onHoverIndex(index)}
            onBlur={() => {
              if (selectedSlug === null) onHoverIndex(null);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border ${
              isActive
                ? 'bg-blue-50/70 border-blue-200 text-gray-900 shadow-2xs'
                : 'bg-white border-gray-150 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="font-medium text-gray-700">{entry.name}:</span>
            <strong className="text-gray-900 font-semibold">{entry.value}</strong>
            <span className="text-[11px] text-gray-400 font-medium">({pct}%)</span>
          </button>
        );
      })}

      {selectedSlug && (
        <button
          type="button"
          onClick={onClearSelection}
          className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 font-medium cursor-pointer self-center"
        >
          Limpar destaque
        </button>
      )}
    </div>
  );
}
