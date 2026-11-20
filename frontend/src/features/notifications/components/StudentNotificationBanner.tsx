import { useState, useEffect } from 'react';
import { Bell, Check, X, ChevronRight, User } from 'lucide-react';
import { notificationService } from '../../../services/api';
import type { Notification } from '../../../types';

interface StudentNotificationBannerProps {
  onOpenAllNotifications: () => void;
}

export function StudentNotificationBanner({
  onOpenAllNotifications,
}: StudentNotificationBannerProps) {
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [activeNotificationIndex, setActiveNotificationIndex] = useState(0);

  const fetchUnread = async () => {
    try {
      const data = await notificationService.getAll();
      const unread = data.filter((n) => !n.read);
      setUnreadNotifications(unread);
    } catch {
      setUnreadNotifications([]);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isDismissed || unreadNotifications.length === 0) {
    return null;
  }

  const currentNotif = unreadNotifications[activeNotificationIndex] || unreadNotifications[0];

  const handleMarkAsRead = async () => {
    try {
      await notificationService.markAsRead(currentNotif.id);
      setUnreadNotifications((prev) => prev.filter((n) => n.id !== currentNotif.id));
      if (activeNotificationIndex >= unreadNotifications.length - 1) {
        setActiveNotificationIndex(0);
      }
    } catch {}
  };

  const handleNext = () => {
    setActiveNotificationIndex((prev) => (prev + 1) % unreadNotifications.length);
  };

  return (
    <div
      role="region"
      aria-label="Aviso do Orientador"
      data-testid="student-notification-banner"
      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 py-3 shadow-md border-b border-blue-800 transition-all animate-in slide-in-from-top duration-200"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 bg-white/15 rounded-xl shrink-0 mt-0.5">
            <Bell size={18} className="animate-bounce" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Aviso do Orientador
              </span>
              {currentNotif.sender_name && (
                <span className="text-blue-100 text-xs font-semibold flex items-center gap-1">
                  <User size={12} /> {currentNotif.sender_name}
                </span>
              )}
              {unreadNotifications.length > 1 && (
                <span className="text-blue-200 text-[11px]">
                  ({activeNotificationIndex + 1} de {unreadNotifications.length})
                </span>
              )}
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
              {currentNotif.title || 'Nova Notificação da Orientação'}
            </h4>
            <p className="text-xs text-blue-100 line-clamp-2 mt-0.5 leading-relaxed">
              {currentNotif.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {unreadNotifications.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="text-[11px] font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Próximo
            </button>
          )}

          <button
            type="button"
            onClick={handleMarkAsRead}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-900 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Check size={13} />
            Marcar como lida
          </button>

          <button
            type="button"
            onClick={onOpenAllNotifications}
            className="flex items-center gap-1 text-[11px] font-medium text-white hover:text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span>Ver todas</span>
            <ChevronRight size={13} />
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer ml-1"
            title="Dispensar aviso por agora"
            aria-label="Dispensar aviso"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
