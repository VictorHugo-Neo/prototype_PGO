import { useMemo } from 'react';
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
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Award, Layers } from 'lucide-react';
import type { StudentRanking } from '../../../types';

interface StudentRankingChartProps {
  data?: StudentRanking[];
}

export function StudentRankingChart({ data = [] }: StudentRankingChartProps) {
  const navigate = useNavigate();
  const hasData = data && data.length > 0;

  const { avgProgress, completedStudentsCount } = useMemo(() => {
    if (!data || data.length === 0) return { avgProgress: 0, completedStudentsCount: 0 };
    const sum = data.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    const completed = data.filter((d) => d.progress === 100).length;
    return {
      avgProgress: Math.round(sum / data.length),
      completedStudentsCount: completed,
    };
  }, [data]);

  const handleBarClick = (entry: StudentRanking) => {
    if (entry.guidance_id) {
      navigate(`/guidance/${entry.guidance_id}`);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-xs flex flex-col justify-between min-w-0 transition-all duration-200 hover:shadow-sm">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-900">Progresso dos Alunos (%)</h3>
              {hasData && (
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {data.length} {data.length === 1 ? 'aluno' : 'alunos'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Clique na barra para acessar o quadro Kanban da orientação
            </p>
          </div>

          {hasData && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                <TrendingUp size={13} className="text-blue-600" />
                <span>Média da Turma: <strong>{avgProgress}%</strong></span>
              </div>
              {completedStudentsCount > 0 && (
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <Award size={13} className="text-emerald-600" />
                  <span>{completedStudentsCount} pronto(s)</span>
                </div>
              )}
            </div>
          )}
        </div>

        {!hasData ? (
          <div className="h-60 flex flex-col items-center justify-center text-center p-6 bg-gray-50/70 rounded-xl space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <Layers size={18} aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Nenhum aluno com progresso registrado</p>
            <p className="text-[11px] text-gray-400 max-w-xs">
              Conclua tarefas nas colunas dos quadros Kanban para calcular o progresso individual e o ranking.
            </p>
          </div>
        ) : (
          <div className="h-60 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 300, height: 240 }}>
              <BarChart data={data} layout="vertical" margin={{ left: 5, right: 25, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={85}
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.04)' }}
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
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    padding: '8px 12px',
                  }}
                />
                {avgProgress > 0 && (
                  <ReferenceLine
                    x={avgProgress}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Média (${avgProgress}%)`,
                      fill: '#64748b',
                      fontSize: 10,
                      fontWeight: 600,
                      position: 'insideTopRight',
                    }}
                  />
                )}
                <Bar
                  dataKey="progress"
                  radius={[0, 8, 8, 0]}
                  barSize={18}
                  className="cursor-pointer"
                  onClick={(entry: unknown) => {
                    const item = (entry as { payload?: StudentRanking })?.payload;
                    if (item) handleBarClick(item);
                  }}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`ranking-cell-${index}`}
                      fill={entry.progress === 100 ? '#10b981' : '#3b82f6'}
                      className="hover:opacity-85 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-gray-400">
        <span>Atualizado em tempo real com os cards</span>
        <span className="text-gray-400">Clique para abrir</span>
      </div>
    </div>
  );
}
