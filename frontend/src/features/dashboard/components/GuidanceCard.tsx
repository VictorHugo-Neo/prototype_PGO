import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, KanbanSquare, Clock, BellRing, UserCheck } from 'lucide-react';
import type { StudentGuidance, GuidanceKanbanSummary } from '../../../types';
import { API_BASE_URL } from '../../../services/api';

interface GuidanceCardProps {
  guidance: StudentGuidance;
  summary?: GuidanceKanbanSummary;
  onNotify?: (studentId: number) => void;
}

export function GuidanceCard({ guidance, summary, onNotify }: GuidanceCardProps) {
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
      aria-label={`Quadro de orientação de ${guidance.student.name}`}
      className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-[0.99] flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="w-10 h-10 rounded-full bg-blue-50 overflow-hidden flex items-center justify-center shrink-0 mt-0.5">
            {guidance.student.avatar_path ? (
              <img
                src={`${API_BASE_URL}/${guidance.student.avatar_path.replace(/\\/g, '/')}`}
                alt={`Avatar de ${guidance.student.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-blue-600">
                {guidance.student.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate text-sm">
                  {guidance.student.name}
                </h3>
                {guidance.user_role === 'coadvisor' && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 shrink-0 flex items-center gap-0.5">
                    <UserCheck size={9} />
                    Coorientador
                  </span>
                )}
              </div>
              {onNotify && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNotify(guidance.student.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title={`Notificar ${guidance.student.name}`}
                  aria-label={`Notificar ${guidance.student.name}`}
                >
                  <BellRing size={14} />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5" title={guidance.theme}>
              {guidance.theme}
            </p>
          </div>
        </div>

        <div className="my-3 py-2.5 px-3 bg-gray-50/80 rounded-xl space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-gray-600 flex items-center gap-1.5">
              <KanbanSquare size={13} className="text-blue-500" aria-hidden="true" />
              Progresso no Kanban
            </span>
            <span className={`font-bold text-xs ${progressTextColor}`}>{progress}%</span>
          </div>

          <div className="w-full bg-gray-200/60 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-gray-500 pt-0.5">
            <span>
              {totalTasks > 0 ? (
                <>
                  <strong className="text-gray-700 font-semibold">{completedTasks}</strong> de {totalTasks} concluídas
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
                className="px-2 py-0.5 rounded-md text-[10px] text-gray-600 bg-gray-100/70 transition-colors"
                title={`${col.title}: ${col.task_count} tarefas`}
              >
                {col.title}: <strong className="font-semibold text-gray-800">{col.task_count}</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <Calendar size={12} className="text-gray-400" aria-hidden="true" />
            <span>
              {guidance.defense_date
                ? new Date(guidance.defense_date).toLocaleDateString('pt-BR')
                : 'Banca a definir'}
            </span>
          </div>

          {pendingMeetings > 0 && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700"
              title={`${pendingMeetings} reunião(ões) pendente(s)`}
            >
              <Clock size={10} aria-hidden="true" />
              {pendingMeetings} {pendingMeetings === 1 ? 'reunião' : 'reuniões'}
            </span>
          )}
        </div>

        <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
          Ver Kanban
          <ArrowRight size={13} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
