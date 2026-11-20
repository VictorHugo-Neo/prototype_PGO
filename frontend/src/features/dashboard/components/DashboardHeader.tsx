import { User, LogOut, BellRing, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '../../notifications/components/NotificationBell';

interface DashboardHeaderProps {
  onLogout: () => void;
  onOpenNotificationModal: () => void;
  onOpenLinkModal: () => void;
}

export function DashboardHeader({
  onLogout,
  onOpenNotificationModal,
  onOpenLinkModal,
}: DashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-gray-200/60">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
          Dashboard de Orientação
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Gestão de prazos de bancas, acompanhamento de orientandos e fluxos de tese
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 shadow-2xs gap-1">
          <NotificationBell />
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            title="Meu Perfil"
            aria-label="Meu Perfil"
          >
            <User size={17} />
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            title="Sair"
            aria-label="Sair"
          >
            <LogOut size={17} />
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenNotificationModal}
          className="bg-white hover:bg-gray-50 text-gray-700 hover:text-blue-700 border border-gray-200 px-3 py-2 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          title="Criar e enviar notificação para orientandos"
        >
          <BellRing size={16} className="text-blue-600 shrink-0" />
          <span className="hidden sm:inline">Notificar</span>
        </button>

        <button
          type="button"
          onClick={onOpenLinkModal}
          className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Plus size={17} />
          <span>Nova Orientação</span>
        </button>
      </div>
    </header>
  );
}
