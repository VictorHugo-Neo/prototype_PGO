import { useEffect, useState, useCallback } from 'react';
import { Plus, User, LogOut } from 'lucide-react';
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

  const handleLinkStudent = async (email: string, theme: string) => {
    await guidanceService.linkStudent(email, theme);
    await loadDashboard();
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

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
              Visão geral do progresso acadêmico dos seus orientandos
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Suas Orientações ({guidances.length})</h2>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guidances.map((guidance) => (
                <GuidanceCard key={guidance.id} guidance={guidance} />
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