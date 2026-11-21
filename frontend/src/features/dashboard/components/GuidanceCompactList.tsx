import { Calendar, Clock, BellRing, ArrowRight, UserCheck } from 'lucide-react';
import type { StudentGuidance, DashboardStats } from '../../../types';
import { API_BASE_URL } from '../../../services/api';

interface GuidanceCompactListProps {
  guidances: StudentGuidance[];
  stats: DashboardStats | null;
  onNotifyStudent: (studentId: number) => void;
  onNavigateGuidance: (guidanceId: number) => void;
}

export function GuidanceCompactList({
  guidances,
  stats,
  onNotifyStudent,
  onNavigateGuidance,
}: GuidanceCompactListProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <th scope="col" className="py-3 px-4">Orientando & Tema</th>
              <th scope="col" className="py-3 px-4">Progresso no Kanban</th>
              <th scope="col" className="py-3 px-4">Data da Banca</th>
              <th scope="col" className="py-3 px-4">Reuniões</th>
              <th scope="col" className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {guidances.map((guidance) => {
              const summary = stats?.guidances_summary?.[String(guidance.id)];
              const progress = summary?.progress ?? 0;
              const totalTasks = summary?.total_tasks ?? 0;
              const completedTasks = summary?.completed_tasks ?? 0;
              const pendingMeetings = summary?.pending_meetings ?? 0;

              const progressColor =
                progress === 100
                  ? 'bg-emerald-500'
                  : progress >= 50
                  ? 'bg-blue-600'
                  : progress > 0
                  ? 'bg-amber-500'
                  : 'bg-gray-300';

              const progressTextColor =
                progress === 100
                  ? 'text-emerald-700'
                  : progress >= 50
                  ? 'text-blue-700'
                  : progress > 0
                  ? 'text-amber-700'
                  : 'text-gray-500';

              return (
                <tr
                  key={guidance.id}
                  onClick={() => onNavigateGuidance(guidance.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onNavigateGuidance(guidance.id);
                    }
                  }}
                  tabIndex={0}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer group focus:outline-none focus:bg-blue-50/40"
                  aria-label={`Orientação de ${guidance.student.name}`}
                >
                  <td className="py-3.5 px-4 min-w-[220px]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50/80 overflow-hidden flex items-center justify-center shrink-0">
                        {guidance.student.avatar_path ? (
                          <img
                            src={`${API_BASE_URL}/${guidance.student.avatar_path.replace(/\\/g, '/')}`}
                            alt={`Avatar de ${guidance.student.name}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[11px] font-bold text-blue-600">
                            {guidance.student.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {guidance.student.name}
                          </span>
                          {guidance.user_role === 'coadvisor' && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 inline-flex items-center gap-0.5">
                              <UserCheck size={9} /> Coorientador
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5" title={guidance.theme}>
                          {guidance.theme}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 min-w-[160px]">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`font-bold ${progressTextColor}`}>{progress}%</span>
                        <span className="text-gray-400">
                          {completedTasks}/{totalTasks} tarefas
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${progressColor}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-gray-600">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Calendar size={13} className="text-gray-400 shrink-0" />
                      <span>
                        {guidance.defense_date
                          ? new Date(guidance.defense_date).toLocaleDateString('pt-BR')
                          : 'A definir'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {pendingMeetings > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                        <Clock size={10} />
                        {pendingMeetings} {pendingMeetings === 1 ? 'pendente' : 'pendentes'}
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400">Em dia</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNotifyStudent(guidance.student.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title={`Notificar ${guidance.student.name}`}
                        aria-label={`Notificar ${guidance.student.name}`}
                      >
                        <BellRing size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateGuidance(guidance.id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <span>Kanban</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
