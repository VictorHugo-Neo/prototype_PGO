import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, BarChart3, ChevronDown } from 'lucide-react';

import type { StudentGuidance, DashboardStats } from '../types';
import { guidanceService, statsService, authService } from '../services/api';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { KpiCards } from '../features/dashboard/components/KpiCards';
import { TaskStatusChart } from '../features/dashboard/components/TaskStatusChart';
import { StudentRankingChart } from '../features/dashboard/components/StudentRankingChart';
import { GuidanceCard } from '../features/dashboard/components/GuidanceCard';
import { GuidanceCompactList } from '../features/dashboard/components/GuidanceCompactList';
import {
  GuidanceFilterBar,
  type GuidanceFilterType,
  type GuidanceSortOption,
} from '../features/dashboard/components/GuidanceFilterBar';
import { AdvisorPracticalMetrics } from '../features/dashboard/components/AdvisorPracticalMetrics';
import { LinkStudentModal } from '../features/dashboard/components/LinkStudentModal';
import { SendNotificationModal } from '../features/notifications/components/SendNotificationModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [guidances, setGuidances] = useState<StudentGuidance[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedStudentForNotif, setSelectedStudentForNotif] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<GuidanceFilterType>('all');
  const [sortBy, setSortBy] = useState<GuidanceSortOption>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('pgo_advisor_view_mode');
    return saved === 'list' ? 'list' : 'grid';
  });

  const [showCharts, setShowCharts] = useState<boolean>(() => {
    const saved = localStorage.getItem('pgo_advisor_show_charts');
    return saved === null ? true : saved === 'true';
  });

  const [metricsTab, setMetricsTab] = useState<'practical' | 'kanban'>('practical');

  const loadDashboard = useCallback(async () => {
    try {
      const [gData, sData] = await Promise.all([
        guidanceService.getMyStudents(),
        statsService.getDashboard(),
      ]);
      setGuidances(gData);
      setStats(sData);
    } catch (error: unknown) {
      console.error('Erro ao carregar dados do dashboard:', error);
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status === 401) {
        authService.logout();
        navigate('/', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLinkStudent = async (
    email: string,
    theme: string,
    defenseDate?: string,
    coadvisorEmail?: string
  ) => {
    const created = await guidanceService.linkStudent(email, theme, defenseDate, coadvisorEmail);
    await loadDashboard();
    return created;
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const toggleCharts = () => {
    setShowCharts((prev) => {
      const next = !prev;
      localStorage.setItem('pgo_advisor_show_charts', String(next));
      return next;
    });
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('pgo_advisor_view_mode', mode);
  };

  const filterCounts = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let pendingMeetings = 0;

    guidances.forEach((g) => {
      const summary = stats?.guidances_summary?.[String(g.id)];
      const prog = summary?.progress ?? 0;
      if (prog === 100) completed++;
      else inProgress++;

      if ((summary?.pending_meetings ?? 0) > 0) pendingMeetings++;
    });

    return {
      all: guidances.length,
      in_progress: inProgress,
      completed,
      pending_meetings: pendingMeetings,
    };
  }, [guidances, stats]);

  const filteredAndSortedGuidances = useMemo(() => {
    const filtered = guidances.filter((g) => {
      const summary = stats?.guidances_summary?.[String(g.id)];
      const matchesSearch =
        searchQuery.trim() === '' ||
        g.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.theme.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'completed') {
        return (summary?.progress ?? 0) === 100;
      }
      if (activeFilter === 'in_progress') {
        return (summary?.progress ?? 0) < 100;
      }
      if (activeFilter === 'pending_meetings') {
        return (summary?.pending_meetings ?? 0) > 0;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.student.name.localeCompare(b.student.name, 'pt-BR');
      }
      const progA = stats?.guidances_summary?.[String(a.id)]?.progress ?? 0;
      const progB = stats?.guidances_summary?.[String(b.id)]?.progress ?? 0;
      if (sortBy === 'progress_desc') {
        return progB - progA;
      }
      if (sortBy === 'progress_asc') {
        return progA - progB;
      }
      if (sortBy === 'defense_date') {
        if (!a.defense_date) return 1;
        if (!b.defense_date) return -1;
        return new Date(a.defense_date).getTime() - new Date(b.defense_date).getTime();
      }
      return 0;
    });
  }, [guidances, stats, searchQuery, activeFilter, sortBy]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando painel de orientações..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader
          onLogout={handleLogout}
          onOpenNotificationModal={() => {
            setSelectedStudentForNotif(undefined);
            setIsNotificationModalOpen(true);
          }}
          onOpenLinkModal={() => setIsLinkModalOpen(true)}
        />

        <section aria-label="Indicadores chave">
          <KpiCards stats={stats} />
        </section>

        <section aria-label="Painel de métricas e acompanhamento" className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900">Painel do Orientador</span>
              <span className="text-gray-300">|</span>
              <p className="text-[11px] text-gray-500">
                {metricsTab === 'practical'
                  ? 'Prazos de bancas, acompanhamento preventivo e reuniões pendentes'
                  : 'Distribuição agregada das colunas do Kanban e ranking'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center bg-gray-100/90 p-0.5 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setMetricsTab('practical')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    metricsTab === 'practical'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Calendar size={13} />
                  <span>Prazos & Atenção</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMetricsTab('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    metricsTab === 'kanban'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 size={13} />
                  <span>Fluxo Kanban</span>
                </button>
              </div>

              <button
                type="button"
                onClick={toggleCharts}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title={showCharts ? 'Recolher métricas' : 'Expandir métricas'}
                aria-label={showCharts ? 'Recolher métricas' : 'Expandir métricas'}
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${showCharts ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          {showCharts && (
            <div className="animate-fadeIn">
              {metricsTab === 'practical' ? (
                <AdvisorPracticalMetrics
                  guidances={guidances}
                  stats={stats}
                  onNotifyStudent={(studentId) => {
                    setSelectedStudentForNotif(studentId);
                    setIsNotificationModalOpen(true);
                  }}
                />
              ) : (
                <section aria-label="Gráficos de desempenho" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <TaskStatusChart data={stats?.task_stats} />
                  <StudentRankingChart data={stats?.student_ranking} />
                </section>
              )}
            </div>
          )}
        </section>

        <section aria-label="Orientações ativas" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Suas Orientações
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {guidances.length}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Acompanhe o progresso das tarefas e reuniões de cada estudante
              </p>
            </div>

            {guidances.length > 0 && (
              <GuidanceFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                counts={filterCounts}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
              />
            )}
          </div>

          {guidances.length === 0 ? (
            <EmptyState
              title="Nenhum aluno orientado no momento"
              description="Vincule um estudante pelo e-mail institucional para começar a acompanhar seu cronograma e tarefas."
              action={{
                label: '+ Vincular Primeiro Aluno',
                onClick: () => setIsLinkModalOpen(true),
              }}
            />
          ) : filteredAndSortedGuidances.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl text-center space-y-2 shadow-xs">
              <p className="text-sm font-medium text-gray-700">Nenhuma orientação encontrada com os filtros atuais.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold cursor-pointer transition-colors"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <GuidanceCompactList
              guidances={filteredAndSortedGuidances}
              stats={stats}
              onNotifyStudent={(studentId) => {
                setSelectedStudentForNotif(studentId);
                setIsNotificationModalOpen(true);
              }}
              onNavigateGuidance={(id) => navigate(`/guidance/${id}`)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAndSortedGuidances.map((guidance) => (
                <GuidanceCard
                  key={guidance.id}
                  guidance={guidance}
                  summary={stats?.guidances_summary?.[String(guidance.id)]}
                  onNotify={(studentId) => {
                    setSelectedStudentForNotif(studentId);
                    setIsNotificationModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <LinkStudentModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onLink={handleLinkStudent}
      />

      <SendNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => {
          setIsNotificationModalOpen(false);
          setSelectedStudentForNotif(undefined);
        }}
        guidances={guidances}
        initialStudentId={selectedStudentForNotif}
        initialTargetType={selectedStudentForNotif ? 'individual' : 'all'}
      />
    </div>
  );
}
