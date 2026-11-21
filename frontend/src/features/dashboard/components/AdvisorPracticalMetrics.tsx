import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import type { StudentGuidance, DashboardStats } from '../../../types';
import { useAdvisorPracticalMetrics } from '../hooks/useAdvisorPracticalMetrics';

interface AdvisorPracticalMetricsProps {
  guidances: StudentGuidance[];
  stats: DashboardStats | null;
  onNotifyStudent: (studentId: number) => void;
}

export function AdvisorPracticalMetrics({
  guidances,
  stats,
  onNotifyStudent,
}: AdvisorPracticalMetricsProps) {
  const navigate = useNavigate();

  const {
    upcomingDefenses,
    withoutDefenseDate,
    studentsNeedingAttention,
    cohortStages,
  } = useAdvisorPracticalMetrics(guidances, stats);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" aria-label="Painel de usabilidade prática do orientador">
      <div className="bg-white p-5 rounded-2xl shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50/80 text-blue-600 flex items-center justify-center">
                <Calendar size={16} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Próximas Bancas de Defesa</h3>
                <p className="text-[11px] text-gray-400">Contagem regressiva e prontidão dos orientandos</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
              <span className="text-blue-600 font-semibold">{upcomingDefenses.length} marcadas</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 font-semibold">{withoutDefenseDate.length} a definir</span>
            </div>
          </div>

          {upcomingDefenses.length === 0 ? (
            <div className="py-8 px-4 text-center bg-gray-50/70 rounded-xl space-y-1.5">
              <p className="text-xs font-semibold text-gray-700">Nenhuma data de banca agendada</p>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                Defina as datas previstas de defesa nos quadros de orientação para acompanhar os prazos e contagens regressivas.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingDefenses.slice(0, 4).map(({ guidance, date, diffDays, progress }) => {
                const isUrgent = diffDays >= 0 && diffDays <= 15;
                const isNear = diffDays > 15 && diffDays <= 45;
                const isPast = diffDays < 0;

                const badgeClass = isPast
                  ? 'bg-gray-100 text-gray-600'
                  : isUrgent
                  ? 'bg-rose-50 text-rose-700 font-bold'
                  : isNear
                  ? 'bg-amber-50 text-amber-700 font-semibold'
                  : 'bg-blue-50 text-blue-700 font-medium';

                const badgeText = isPast
                  ? 'Defesa realizada'
                  : diffDays === 0
                  ? 'Defesa Hoje!'
                  : diffDays === 1
                  ? 'Amanhã'
                  : `Em ${diffDays} dias`;

                return (
                  <div
                    key={guidance.id}
                    onClick={() => navigate(`/guidance/${guidance.id}`)}
                    className="p-2.5 rounded-xl bg-gray-50/50 hover:bg-blue-50/40 transition-all cursor-pointer group flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100/70 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {guidance.student.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                            {guidance.student.name}
                          </h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md ${badgeClass} shrink-0`}>
                            {badgeText}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5" title={guidance.theme}>
                          {guidance.theme}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[11px] font-semibold text-gray-700">
                          {date.toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {progress}% concluído
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {withoutDefenseDate.length > 0 && (
          <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-1 text-gray-400">
              <Clock size={12} />
              {withoutDefenseDate.length} aluno(s) com banca a definir
            </span>
            <span className="text-gray-400">Clique para ver o Kanban</span>
          </div>
        )}
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50/80 text-amber-600 flex items-center justify-center">
                <AlertTriangle size={16} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Atenção & Prontidão da Turma</h3>
                <p className="text-[11px] text-gray-400">Acompanhamento preventivo de riscos e pendências</p>
              </div>
            </div>

            <div className="text-[11px] font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
              {studentsNeedingAttention.length === 0 ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Em dia
                </span>
              ) : (
                <span className="text-amber-600">
                  {studentsNeedingAttention.length} requer(em) atenção
                </span>
              )}
            </div>
          </div>

          <div className="mb-3.5 p-3 bg-gray-50/80 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
                <TrendingUp size={13} className="text-blue-600" /> Estágio dos Orientandos
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                {guidances.length} {guidances.length === 1 ? 'aluno' : 'alunos'}
              </span>
            </div>

            <div className="w-full h-2 rounded-full overflow-hidden flex bg-gray-200/70 gap-0.5">
              {cohortStages.finalPhase > 0 && (
                <div
                  style={{ width: `${cohortStages.finalPct}%` }}
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  title={`Fase Final: ${cohortStages.finalPhase} (${cohortStages.finalPct}%)`}
                />
              )}
              {cohortStages.devPhase > 0 && (
                <div
                  style={{ width: `${cohortStages.devPct}%` }}
                  className="bg-blue-500 h-full rounded-full transition-all"
                  title={`Em Desenvolvimento: ${cohortStages.devPhase} (${cohortStages.devPct}%)`}
                />
              )}
              {cohortStages.initialPhase > 0 && (
                <div
                  style={{ width: `${cohortStages.initialPct}%` }}
                  className="bg-amber-400 h-full rounded-full transition-all"
                  title={`Fase Inicial: ${cohortStages.initialPhase} (${cohortStages.initialPct}%)`}
                />
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-500 pt-0.5">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Reta Final ({cohortStages.finalPhase})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Desenvolvimento ({cohortStages.devPhase})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Início ({cohortStages.initialPhase})
              </span>
            </div>
          </div>

          {studentsNeedingAttention.length === 0 ? (
            <div className="py-3 px-3.5 bg-emerald-50/50 rounded-xl flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-800">
                Nenhum orientando com pendências críticas ou reuniões aguardando resposta.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {studentsNeedingAttention.slice(0, 3).map(({ guidance, reasons, severity }) => (
                <div
                  key={guidance.id}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 ${
                    severity === 'high'
                      ? 'bg-amber-50/50'
                      : 'bg-gray-50/70'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-800 truncate">
                        {guidance.student.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 font-medium truncate mt-0.5">
                      {reasons[0]}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onNotifyStudent(guidance.student.id)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100/70 rounded-lg transition-colors cursor-pointer"
                      title={`Enviar notificação para ${guidance.student.name}`}
                      aria-label={`Notificar ${guidance.student.name}`}
                    >
                      <BellRing size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/guidance/${guidance.id}`)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline px-1.5 py-1 transition-colors cursor-pointer"
                    >
                      Kanban &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-gray-400">
          <span>Identifica gargalos e solicitações</span>
        </div>
      </div>
    </div>
  );
}
