import { useState, useEffect, useMemo } from 'react';
import { X, Send, BellRing, Loader2, AlertCircle, Zap, CheckCircle2 } from 'lucide-react';
import { notificationService } from '../../../services/api';
import type { NotificationChannel, NotificationTargetType, NotificationSendSummary } from '../../../types';
import type { SendNotificationModalProps, RecipientOption } from '../types';
import { NotificationChannelSelector } from './NotificationChannelSelector';
import { NotificationRecipientSelector } from './NotificationRecipientSelector';
import { NotificationMessageForm } from './NotificationMessageForm';
import { NotificationSummaryView } from './NotificationSummaryView';

export function SendNotificationModal({
  isOpen,
  onClose,
  guidances,
  initialStudentId,
  initialTargetType = 'individual',
  onSuccess,
}: SendNotificationModalProps) {
  const [targetType, setTargetType] = useState<NotificationTargetType>(initialTargetType);
  const [selectedStudentId, setSelectedStudentId] = useState<number | undefined>(initialStudentId);
  const [channel, setChannel] = useState<NotificationChannel>('both');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<NotificationSendSummary | null>(null);
  const [whatsappOnline, setWhatsAppOnline] = useState<boolean | null>(null);
  const [isCheckingDeadlines, setIsCheckingDeadlines] = useState(false);
  const [deadlineAlertSuccess, setDeadlineAlertSuccess] = useState<string | null>(null);

  const recipients: RecipientOption[] = useMemo(() => {
    const map = new Map<number, RecipientOption>();
    for (const g of guidances) {
      if (g.student && !map.has(g.student.id)) {
        map.set(g.student.id, {
          id: g.student.id,
          name: g.student.name,
          email: g.student.email,
          avatar_path: g.student.avatar_path,
          theme: g.theme,
          hasPhone: Boolean(g.student && 'phone' in g.student && (g.student as { phone?: string }).phone),
          phone: (g.student as { phone?: string }).phone ?? null,
        });
      }
    }
    return Array.from(map.values());
  }, [guidances]);

  useEffect(() => {
    if (isOpen) {
      setTargetType(initialTargetType);
      if (initialStudentId) {
        setSelectedStudentId(initialStudentId);
      } else if (recipients.length > 0 && !selectedStudentId) {
        setSelectedStudentId(recipients[0].id);
      }
      setSummary(null);
      setErrorMessage(null);
      setDeadlineAlertSuccess(null);
      if (typeof notificationService.getWhatsAppStatus === 'function') {
        notificationService
          .getWhatsAppStatus()
          .then((res) => setWhatsAppOnline(Boolean(res?.online)))
          .catch(() => setWhatsAppOnline(false));
      }
    }
  }, [isOpen, initialStudentId, initialTargetType, recipients]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleReset = () => {
    setSummary(null);
    setMessage('');
    setTitle('');
    setErrorMessage(null);
    setDeadlineAlertSuccess(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleNotifyDeadlines = async () => {
    setIsCheckingDeadlines(true);
    setErrorMessage(null);
    setDeadlineAlertSuccess(null);
    try {
      if (typeof notificationService.notifyDeadlines === 'function') {
        const res = await notificationService.notifyDeadlines({
          guidance_id: targetType === 'individual' ? selectedStudentId : undefined,
          hours_ahead: 48,
        });
        setDeadlineAlertSuccess(
          `Alertas de prazos processados com sucesso! ${res.tasks_analyzed} tarefa(s) verificada(s), ${res.whatsapp_dispatched} enviada(s) via WhatsApp.`
        );
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setErrorMessage(
        axiosErr?.response?.data?.detail || 'Erro ao disparar alertas de prazos.'
      );
    } finally {
      setIsCheckingDeadlines(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!message.trim()) {
      setErrorMessage('Por favor, informe a mensagem da notificação.');
      return;
    }

    if (targetType === 'individual' && !selectedStudentId) {
      setErrorMessage('Por favor, selecione um orientando.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await notificationService.sendNotification({
        target_type: targetType,
        student_id: targetType === 'individual' ? selectedStudentId : undefined,
        channel,
        title: title.trim() || undefined,
        message: message.trim(),
      });

      setSummary(result);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const detail = axiosErr?.response?.data?.detail;
      setErrorMessage(
        typeof detail === 'string'
          ? detail
          : 'Ocorreu um erro ao despachar a notificação. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-notif-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/80 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <BellRing size={20} />
            </div>
            <div>
              <h2 id="modal-notif-title" className="text-base font-bold text-gray-800">
                Enviar Notificação
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <p className="text-xs text-gray-500">
                  Notifique seus orientandos via Plataforma PGO e/ou WhatsApp
                </p>
                {whatsappOnline !== null && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      whatsappOnline
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                    title={
                      whatsappOnline
                        ? 'Evolution API / WhatsApp conectado e pronto para envio'
                        : 'WhatsApp offline. Mensagens serão entregues na plataforma.'
                    }
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        whatsappOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    {whatsappOnline ? 'WhatsApp Online' : 'WhatsApp Offline'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || isCheckingDeadlines}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </header>

        <div className="p-6 overflow-y-auto space-y-5">
          {deadlineAlertSuccess && (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              <span>{deadlineAlertSuccess}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {summary ? (
            <NotificationSummaryView
              summary={summary}
              onReset={handleReset}
              onClose={handleClose}
            />
          ) : (
            <form id="notification-form" onSubmit={handleSubmit} className="space-y-5">
              <NotificationRecipientSelector
                targetType={targetType}
                selectedStudentId={selectedStudentId}
                channel={channel}
                recipients={recipients}
                onTargetTypeChange={setTargetType}
                onSelectStudent={setSelectedStudentId}
                disabled={isSubmitting}
              />

              <NotificationChannelSelector
                channel={channel}
                onChange={setChannel}
                disabled={isSubmitting}
              />

              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5">
                    <Zap size={15} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-blue-900">
                      Disparo Automático de Prazos Críticos (48h)
                    </span>
                    <span className="block text-[11px] text-blue-700/80">
                      Varre tarefas pendentes próximas do vencimento e envia alerta no WhatsApp.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting || isCheckingDeadlines}
                  onClick={handleNotifyDeadlines}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isCheckingDeadlines ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={13} />
                      <span>Disparar Prazos</span>
                    </>
                  )}
                </button>
              </div>

              <NotificationMessageForm
                title={title}
                message={message}
                channel={channel}
                onTitleChange={setTitle}
                onMessageChange={setMessage}
                disabled={isSubmitting}
              />
            </form>
          )}
        </div>

        {!summary && (
          <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/70">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="notification-form"
              disabled={isSubmitting || !message.trim()}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Disparar Notificação</span>
                </>
              )}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
