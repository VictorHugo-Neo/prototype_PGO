import { useState } from 'react';
import { BarChart3, AlignLeft, Layers } from 'lucide-react';
import type { DashboardTaskStat } from '../../../types';
import { useTaskDistributionMetrics } from '../hooks/useTaskDistributionMetrics';
import { TaskDistributionPipeline } from './TaskDistributionPipeline';
import { TaskDistributionBars } from './TaskDistributionBars';
import { TaskDistributionLegend } from './TaskDistributionLegend';
import { TaskDistributionInsight } from './TaskDistributionInsight';

interface TaskStatusChartProps {
  data?: DashboardTaskStat[];
}

type ViewOrientation = 'columns' | 'horizontal';

export function TaskStatusChart({ data = [] }: TaskStatusChartProps) {
  const [orientation, setOrientation] = useState<ViewOrientation>('columns');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const {
    totalTasks,
    hasData,
    completionRate,
    executiveInsight,
  } = useTaskDistributionMetrics(data);

  const effectiveIndex = activeIndex !== null
    ? activeIndex
    : selectedSlug !== null
    ? data.findIndex((d) => (d.slug || d.name) === selectedSlug)
    : null;

  const handleItemToggle = (index: number) => {
    const item = data[index];
    const key = item.slug || item.name;
    if (selectedSlug === key) {
      setSelectedSlug(null);
      setActiveIndex(null);
    } else {
      setSelectedSlug(key);
      setActiveIndex(index);
    }
  };

  const handleClearSelection = () => {
    setSelectedSlug(null);
    setActiveIndex(null);
  };

  return (
    <div
      className="bg-white p-5 rounded-2xl shadow-xs flex flex-col justify-between min-w-0 transition-all duration-200 hover:shadow-sm"
      role="region"
      aria-label="Gráfico de distribuição de tarefas no fluxo Kanban"
    >
      <div className="sr-only" aria-live="polite">
        Distribuição no Kanban: {totalTasks} tarefas no total.
        {data.map((item) => {
          const pct = totalTasks > 0 ? Math.round((item.value / totalTasks) * 100) : 0;
          return ` Coluna ${item.name}: ${item.value} tarefas (${pct}%).`;
        })}
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-900">Distribuição no Kanban</h3>
              {hasData && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                  {totalTasks} {totalTasks === 1 ? 'tarefa' : 'tarefas'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Carga de trabalho por coluna do fluxo dos seus orientandos
            </p>
          </div>

          {hasData && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <div
                className="flex items-center bg-gray-100/90 p-0.5 rounded-xl text-xs"
                role="tablist"
                aria-label="Layout do gráfico de colunas"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={orientation === 'columns'}
                  aria-label="Visualização em Colunas Kanban"
                  onClick={() => setOrientation('columns')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    orientation === 'columns'
                      ? 'bg-white text-blue-700 font-semibold shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  title="Exibir como Colunas verticais do Kanban"
                >
                  <BarChart3 size={13} aria-hidden="true" />
                  <span className="hidden xs:inline">Colunas</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={orientation === 'horizontal'}
                  aria-label="Visualização em Barras Horizontais"
                  onClick={() => setOrientation('horizontal')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    orientation === 'horizontal'
                      ? 'bg-white text-blue-700 font-semibold shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  title="Exibir como Barras horizontais"
                >
                  <AlignLeft size={13} aria-hidden="true" />
                  <span className="hidden xs:inline">Barras</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {!hasData ? (
          <div className="h-60 flex flex-col items-center justify-center text-center p-6 bg-gray-50/70 rounded-xl space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <Layers size={18} aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Nenhuma tarefa computada nos quadros Kanban</p>
            <p className="text-[11px] text-gray-400 max-w-xs">
              Crie tarefas nos quadros de orientação dos seus alunos para visualizar a distribuição e os gargalos do fluxo.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <TaskDistributionPipeline
              data={data}
              totalTasks={totalTasks}
              completionRate={completionRate}
              effectiveIndex={effectiveIndex}
              selectedSlug={selectedSlug}
            />

            <TaskDistributionBars
              data={data}
              orientation={orientation}
              totalTasks={totalTasks}
              effectiveIndex={effectiveIndex}
              selectedSlug={selectedSlug}
              onItemToggle={handleItemToggle}
              onHoverIndex={setActiveIndex}
            />

            <TaskDistributionLegend
              data={data}
              totalTasks={totalTasks}
              activeIndex={activeIndex}
              selectedSlug={selectedSlug}
              onItemToggle={handleItemToggle}
              onHoverIndex={setActiveIndex}
              onClearSelection={handleClearSelection}
            />
          </div>
        )}
      </div>

      {hasData && <TaskDistributionInsight insight={executiveInsight} />}
    </div>
  );
}
