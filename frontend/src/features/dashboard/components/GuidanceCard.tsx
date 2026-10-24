import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, KanbanSquare, Clock } from 'lucide-react';
import type { StudentGuidance, GuidanceKanbanSummary } from '../../../types';
import { API_BASE_URL } from '../../../services/api';

interface GuidanceCardProps {
  guidance: StudentGuidance;
  summary?: GuidanceKanbanSummary;
}

export function GuidanceCard({ guidance, summary }: GuidanceCardProps) {
  const navigate = useNavigate();

  const progress = summary?.progress ?? 0;
  const totalTasks = summary?.total_tasks ?? 0;
  const completedTasks = summary?.completed_tasks ?? 0;
  const inProgressTasks = summary?.in_progress_tasks ?? 0;
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
    <div
      onClick={() => navigate(`/guidance/${guidance.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/guidance/${guidance.id}`);
        }
      }}
      role="button"
      tabIndex={0}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 overflow-hidden flex items-center justify-center border border-gray-100 shrink-0">
            {guidance.student.avatar_path ? (
              <img
                src={`${API_BASE_URL}/${guidance.student.avatar_path.replace(/\\/g, '/')}`}
                alt={`Avatar de ${guidance.student.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-blue-600">
                {guidance.student.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate text-sm">
              {guidance.student.name}
            </h3>
            <p className="text-xs text-gray-500 truncate" title={guidance.theme}>
              {guidance.theme}
            </p>
          </div>
        </div>

        <div className="bg-gray-50/70 rounded-xl p-3 mb-3 border border-gray-100/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 flex items-center gap-1.5">
              <KanbanSquare size={13} className="text-blue-600" aria-hidden="true" />
              Progresso no Kanban
            </span>
            <span className={`font-bold ${progressTextColor}`}>{progress}%</span>
          </div>

          <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-gray-500 pt-0.5">
            <span>
              {totalTasks > 0 ? (
                <>
                  <strong className="text-gray-700">{completedTasks}</strong> de {totalTasks} concluídas
                </>
              ) : (
                'Nenhuma tarefa criada'
              )}
            </span>
            {inProgressTasks > 0 && (
              <span className="text-blue-600 font-medium">
                {inProgressTasks} em andamento
              </span>
            )}
          </div>
        </div>

        {summary?.columns && summary.columns.length > 0 && totalTasks > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {summary.columns.map((col) => (
              <span
                key={col.slug}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${col.color} text-gray-700 border border-gray-200/60`}
                title={`${col.title}: ${col.task_count} tarefas`}
              >
                {col.title}: <strong>{col.task_count}</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-[11px]">
              <Calendar size={13} className="text-gray-400" aria-hidden="true" />
              <span>
                {guidance.defense_date
                  ? new Date(guidance.defense_date).toLocaleDateString('pt-BR')
                  : 'Banca a definir'}
              </span>
            </div>

            {pendingMeetings > 0 && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200"
                title={`${pendingMeetings} reunião(ões) pendente(s)`}
              >
                <Clock size={10} aria-hidden="true" />
                {pendingMeetings} {pendingMeetings === 1 ? 'reunião' : 'reuniões'}
              </span>
            )}
          </div>

          <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            Ver Kanban
            <ArrowRight size={14} aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  );
}
