import { Users, Calendar, CheckSquare } from 'lucide-react';
import type { DashboardStats } from '../../../types';

interface KpiCardsProps {
  stats: DashboardStats | null;
}

export function KpiCards({ stats }: KpiCardsProps) {
  const completedTasks =
    stats?.task_stats.find((t) => t.name.toLowerCase().includes('conclu'))?.value || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          <Users size={24} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Total de Alunos</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats?.total_students || 0}</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
          <CheckSquare size={24} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Tarefas Concluídas</p>
          <h3 className="text-2xl font-bold text-gray-800">{completedTasks}</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
          <Calendar size={24} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Reuniões Pendentes</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats?.pending_meetings || 0}</h3>
        </div>
      </div>
    </div>
  );
}
