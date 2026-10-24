import { Users, Calendar, CheckSquare, PlayCircle, AlertCircle } from 'lucide-react';
import type { DashboardStats } from '../../../types';

interface KpiCardsProps {
  stats: DashboardStats | null;
}

export function KpiCards({ stats }: KpiCardsProps) {
  const completedTasksCount =
    stats?.completed_tasks ??
    stats?.task_stats.find((t) => t.name.toLowerCase().includes('conclu'))?.value ??
    0;

  const totalTasksCount =
    stats?.total_tasks ??
    (stats?.task_stats ? stats.task_stats.reduce((acc, t) => acc + t.value, 0) : 0);

  const inProgressTasksCount =
    stats?.in_progress_tasks ??
    stats?.task_stats.find((t) => t.name.toLowerCase().includes('andamento'))?.value ??
    0;

  const overallProgress =
    stats?.overall_progress ??
    (totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0);

  const pendingMeetings = stats?.pending_meetings || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-gray-200 transition-colors">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Users size={22} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Total de Alunos</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats?.total_students || 0}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Orientações ativas</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:border-gray-200 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckSquare size={22} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium">Tarefas Concluídas</p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl font-bold text-gray-800">{completedTasksCount}</h3>
              <span className="text-xs text-gray-400">/ {totalTasksCount} total</span>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-gray-50">
          <div className="flex justify-between items-center text-[11px] text-gray-500 mb-1">
            <span>Progresso Geral</span>
            <span className="font-semibold text-emerald-600">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-gray-200 transition-colors">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <PlayCircle size={22} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Em Andamento (WIP)</p>
          <h3 className="text-2xl font-bold text-gray-800">{inProgressTasksCount}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Tarefas em execução</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-gray-200 transition-colors">
        <div
          className={`p-3 rounded-xl ${
            pendingMeetings > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Calendar size={22} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium">Reuniões Pendentes</p>
          <h3 className="text-2xl font-bold text-gray-800">{pendingMeetings}</h3>
          {pendingMeetings > 0 ? (
            <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
              <AlertCircle size={11} aria-hidden="true" /> Aguardando resposta
            </p>
          ) : (
            <p className="text-[11px] text-gray-400 mt-0.5">Tudo em dia</p>
          )}
        </div>
      </div>
    </div>
  );
}
