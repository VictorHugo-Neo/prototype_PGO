import { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, Clock, User, CheckCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../../services/api';
import type { Notification } from '../../../types';

export function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch {}
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        data-testid="notification-bell-btn"
        className="relative p-2.5 text-gray-600 bg-white hover:bg-gray-100 hover:text-gray-900 rounded-lg border border-gray-200 hover:border-gray-300 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        title="Notificações"
        aria-label="Abrir notificações"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            data-testid="unread-badge"
            className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          data-testid="notifications-dropdown"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          <header className="flex items-center justify-between p-3.5 border-b border-gray-100 bg-gray-50/80">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-gray-800">Notificações</span>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={13} />}
                Marcar todas como lidas
              </button>
            )}
          </header>

          <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'unread'
                  ? 'bg-white text-gray-800 font-semibold shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Não lidas ({unreadCount})
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-1">
                <Bell size={24} className="mx-auto text-gray-300" />
                <p className="text-xs font-semibold text-gray-600">Nenhuma notificação</p>
                <p className="text-[11px] text-gray-400">
                  {activeTab === 'unread'
                    ? 'Você leu todas as notificações recentes.'
                    : 'Suas notificações aparecerão aqui.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                    notif.read ? 'bg-white hover:bg-gray-50/70' : 'bg-blue-50/40 hover:bg-blue-50/70'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      notif.read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <User size={14} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-800 truncate">
                        {notif.title || notif.sender_name || 'Notificação do Sistema'}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0 flex items-center gap-1">
                        <Clock size={10} />
                        {formatDate(notif.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      {notif.link ? (
                        <span className="text-[10px] font-semibold text-blue-600 flex items-center gap-1 hover:underline">
                          Abrir orientação <ExternalLink size={10} />
                        </span>
                      ) : (
                        <span />
                      )}

                      {!notif.read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          title="Marcar como lida"
                          className="text-[10px] text-gray-400 hover:text-blue-600 flex items-center gap-1 p-1 hover:bg-white rounded transition-colors cursor-pointer"
                        >
                          <Check size={11} />
                          Lida
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
