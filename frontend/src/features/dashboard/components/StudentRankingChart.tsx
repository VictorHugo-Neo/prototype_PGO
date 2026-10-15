import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { StudentRanking } from '../../../types';

interface StudentRankingChartProps {
  data?: StudentRanking[];
}

export function StudentRankingChart({ data = [] }: StudentRankingChartProps) {
  const hasData = data && data.length > 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col min-w-0">
      <h3 className="text-base font-bold text-gray-700 mb-4">Progresso dos Alunos (%)</h3>
      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-400">
          Nenhum aluno com progresso registrado.
        </div>
      ) : (
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 300, height: 256 }}>
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
              <Bar dataKey="progress" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
