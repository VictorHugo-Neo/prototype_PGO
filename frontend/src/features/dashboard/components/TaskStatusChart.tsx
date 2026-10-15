import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardTaskStat } from '../../../types';

interface TaskStatusChartProps {
  data?: DashboardTaskStat[];
}

export function TaskStatusChart({ data = [] }: TaskStatusChartProps) {
  const hasData = data && data.length > 0 && data.some((d) => d.value > 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <h3 className="text-base font-bold text-gray-700 mb-4">Status Geral das Tarefas</h3>
      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-400">
          Nenhuma tarefa computada até o momento.
        </div>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-2">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                  aria-hidden="true"
                />
                <span>
                  {entry.name}: <strong className="text-gray-800">{entry.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
