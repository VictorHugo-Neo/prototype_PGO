import { useState, useEffect, useMemo } from 'react';
import { X, Bell, Check, CheckCheck, Loader2, Search, User, Clock, MessageSquare, Monitor } from 'lucide-react';
import { notificationService } from '../../../services/api';
import type { Notification } from '../../../types';

interface StudentNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationRead?: () => void;
}

export function StudentNotificationsModal({
  isOpen,
  onClose,
  onNotificationRead,
}: StudentNotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch {} finally {
      setMarkingAll(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'unread' && n.read) return false;
      if (activeTab === 'read' && !n.read) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = n.title?.toLowerCase().includes(query);
        const matchesMessage = n.message.toLowerCase().includes(query);
        const matchesSender = n.sender_name?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMessage && !matchesSender) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-student-notifs-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Bell size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="modal-student-notifs-title" className="text-base font-bold text-gray-800">
                  Notificações da Orientação
                </h2>
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Mensagens e avisos encaminhados pelo seu orientador
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </header>

        <div className="px-6 py-3 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-gray-800 font-semibold shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === 'unread'
                  ? 'bg-white text-gray-800 font-semibold shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Não Lidas ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('read')}
              className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === 'read'
                  ? 'bg-white text-gray-800 font-semibold shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Lidas ({notifications.length - unreadCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar avisos..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {markingAll ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={13} />}
                <span>Marcar todas como lidas</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-gray-50/50">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-2">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <span className="text-xs">Carregando suas notificações...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                <Bell size={22} />
              </div>
              <h3 className="text-sm font-bold text-gray-700">Nenhuma notificação encontrada</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'Nenhum resultado corresponde à sua pesquisa.'
                  : activeTab === 'unread'
                  ? 'Você já leu todas as suas notificações.'
                  : 'Quando seu orientador enviar avisos ou lembretes, eles aparecerão aqui.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all ${
                  notif.read
                    ? 'bg-white border-gray-200 shadow-2xs'
                    : 'bg-blue-50/40 border-blue-200 ring-1 ring-blue-300/50 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        notif.read ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white'
                      }`}
                    >
                      <User size={14} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-800 block">
                        {notif.sender_name || 'Orientador'}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> {formatDate(notif.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {notif.channel === 'whatsapp' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <MessageSquare size={10} /> WhatsApp
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        <Monitor size={10} /> Plataforma
                      </span>
                    )}

                    {!notif.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 border border-blue-200 px-2 py-1 rounded-md transition-colors cursor-pointer active:scale-95"
                      >
                        <Check size={12} />
                        Marcar lida
                      </button>
                    )}
                  </div>
                </div>

                {notif.title && (
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-1">
                    {notif.title}
                  </h4>
                )}

                <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {notif.message}
                </p>
              </div>
            ))
          )}
        </div>

        <footer className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/70 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg shadow-2xs transition-colors cursor-pointer active:scale-95"
          >
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}
