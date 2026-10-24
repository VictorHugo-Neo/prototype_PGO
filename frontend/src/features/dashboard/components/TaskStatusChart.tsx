import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardTaskStat } from '../../../types';

interface TaskStatusChartProps {
  data?: DashboardTaskStat[];
}

export function TaskStatusChart({ data = [] }: TaskStatusChartProps) {
  const totalTasks = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const hasData = totalTasks > 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-w-0">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Distribuição no Kanban</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Volume de tarefas por coluna do fluxo de trabalho
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">
          {totalTasks} {totalTasks === 1 ? 'tarefa' : 'tarefas'}
        </span>
      </div>

      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-sm text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <p>Nenhuma tarefa computada nos quadros Kanban.</p>
          <p className="text-xs text-gray-400 mt-1">Crie tarefas nas orientações para ver a distribuição.</p>
        </div>
      ) : (
        <>
          <div className="h-60 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 300, height: 240 }}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown, name: unknown) => {
                    const num = Number(value) || 0;
                    const pct = totalTasks > 0 ? Math.round((num / totalTasks) * 100) : 0;
                    return [`${num} (${pct}%)`, String(name)];
                  }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-2 pt-3 border-t border-gray-50">
            {data.map((entry) => {
              const pct = totalTasks > 0 ? Math.round((entry.value / totalTasks) * 100) : 0;
              return (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                    aria-hidden="true"
                  />
                  <span>
                    {entry.name}:{' '}
                    <strong className="text-gray-800">{entry.value}</strong>{' '}
                    <span className="text-[11px] text-gray-400">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
