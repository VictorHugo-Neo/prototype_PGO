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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-2xs border border-gray-100 hover:border-blue-150 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500 font-medium">Total de Alunos</p>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={16} aria-hidden="true" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{stats?.total_students || 0}</h3>
          <p className="text-[11px] text-gray-400 mt-1">Orientações ativas</p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-2xs border border-gray-100 hover:border-emerald-150 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500 font-medium">Tarefas Concluídas</p>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckSquare size={16} aria-hidden="true" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{completedTasksCount}</h3>
              <span className="text-xs text-gray-400">/ {totalTasksCount} total</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1">
            <span>Progresso Geral</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-2xs border border-gray-100 hover:border-indigo-150 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500 font-medium">Em Andamento (WIP)</p>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <PlayCircle size={16} aria-hidden="true" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{inProgressTasksCount}</h3>
          <p className="text-[11px] text-gray-400 mt-1">Tarefas em execução</p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-2xs border border-gray-100 hover:border-amber-150 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500 font-medium">Reuniões Pendentes</p>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              pendingMeetings > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
            }`}
          >
            <Calendar size={16} aria-hidden="true" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{pendingMeetings}</h3>
          {pendingMeetings > 0 ? (
            <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle size={11} aria-hidden="true" /> Aguardando resposta
            </p>
          ) : (
            <p className="text-[11px] text-gray-400 mt-1">Tudo em dia</p>
          )}
        </div>
      </div>
    </div>
  );
}
