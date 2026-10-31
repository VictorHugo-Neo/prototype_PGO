import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, User, LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { StudentGuidance, DashboardStats } from '../types';
import { guidanceService, statsService, authService } from '../services/api';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { KpiCards } from '../features/dashboard/components/KpiCards';
import { TaskStatusChart } from '../features/dashboard/components/TaskStatusChart';
import { StudentRankingChart } from '../features/dashboard/components/StudentRankingChart';
import { GuidanceCard } from '../features/dashboard/components/GuidanceCard';
import { LinkStudentModal } from '../features/dashboard/components/LinkStudentModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [guidances, setGuidances] = useState<StudentGuidance[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'completed' | 'pending_meetings'>('all');

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

  const handleLinkStudent = async (email: string, theme: string, defenseDate?: string) => {
    const created = await guidanceService.linkStudent(email, theme, defenseDate);
    await loadDashboard();
    return created;
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const filteredGuidances = useMemo(() => {
    return guidances.filter((g) => {
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
  }, [guidances, stats, searchQuery, activeFilter]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando painel de orientações..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Dashboard de Orientação
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Visão geral integrada com os fluxos e quadros Kanban dos seus orientandos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="p-2.5 text-gray-600 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 shadow-sm transition-colors"
              title="Meu Perfil"
              aria-label="Meu Perfil"
            >
              <User size={18} />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 text-red-600 bg-white hover:bg-red-50 rounded-lg border border-gray-200 shadow-sm transition-colors"
              title="Sair"
              aria-label="Sair"
            >
              <LogOut size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIsLinkModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus size={18} /> Nova Orientação
            </button>
          </div>
        </header>

        <section aria-label="Indicadores chave">
          <KpiCards stats={stats} />
        </section>

        <section aria-label="Gráficos de desempenho" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TaskStatusChart data={stats?.task_stats} />
          <StudentRankingChart data={stats?.student_ranking} />
        </section>

        <section aria-label="Orientações ativas" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Suas Orientações ({guidances.length})</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Acompanhe o progresso do Kanban e as reuniões de cada estudante
              </p>
            </div>

            {guidances.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar aluno ou tema..."
                    className="pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700 w-full sm:w-56 shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      activeFilter === 'all'
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('in_progress')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      activeFilter === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Em Andamento
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('completed')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      activeFilter === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Concluídos
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('pending_meetings')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      activeFilter === 'pending_meetings'
                        ? 'bg-amber-50 text-amber-700 font-semibold'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Reuniões
                  </button>
                </div>
              </div>
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
          ) : filteredGuidances.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center space-y-2">
              <p className="text-sm font-medium text-gray-700">Nenhuma orientação encontrada com os filtros atuais.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuidances.map((guidance) => (
                <GuidanceCard
                  key={guidance.id}
                  guidance={guidance}
                  summary={stats?.guidances_summary?.[String(guidance.id)]}
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
    </div>
  );
}
