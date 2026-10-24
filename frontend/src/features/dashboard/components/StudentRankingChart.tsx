import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import type { StudentRanking } from '../../../types';

interface StudentRankingChartProps {
  data?: StudentRanking[];
}

export function StudentRankingChart({ data = [] }: StudentRankingChartProps) {
  const navigate = useNavigate();
  const hasData = data && data.length > 0;

  const handleBarClick = (entry: StudentRanking) => {
    if (entry.guidance_id) {
      navigate(`/guidance/${entry.guidance_id}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-w-0">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Progresso dos Alunos (%)</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Clique na barra para acessar o quadro Kanban da orientação
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-sm text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <p>Nenhum aluno com progresso registrado.</p>
          <p className="text-xs text-gray-400 mt-1">Conclua tarefas no Kanban para calcular o progresso.</p>
        </div>
      ) : (
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 300, height: 256 }}>
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 25, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} unit="%" />
              <YAxis
                dataKey="name"
                type="category"
                width={85}
                tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 500 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(59, 130, 246, 0.06)' }}
                formatter={(val: unknown, _name: unknown, props: { payload?: StudentRanking }) => {
                  const entry = props.payload;
                  const total = entry?.total_tasks ?? 0;
                  const completed = entry?.completed_tasks ?? 0;
                  const taskInfo = total > 0 ? ` (${completed}/${total} tarefas)` : '';
                  return [`${val}%${taskInfo}`, 'Progresso no Kanban'];
                }}
                labelFormatter={(_label: unknown, payload: readonly { payload?: StudentRanking }[]) => {
                  const item = payload?.[0]?.payload;
                  return item?.full_name || item?.name || '';
                }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar
                dataKey="progress"
                radius={[0, 6, 6, 0]}
                barSize={20}
                className="cursor-pointer"
                onClick={(entry: unknown) => {
                  const item = (entry as { payload?: StudentRanking })?.payload;
                  if (item) {
                    handleBarClick(item);
                  }
                }}
              >
                {data.map((item, index) => {
                  const color =
                    item.progress === 100
                      ? '#10B981'
                      : item.progress >= 50
                      ? '#2563EB'
                      : item.progress > 0
                      ? '#3B82F6'
                      : '#9CA3AF';
                  return <Cell key={`bar-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
