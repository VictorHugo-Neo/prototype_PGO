import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  X,
  Loader2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface DefenseDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate?: string | null;
  studentName: string;
  theme: string;
  onSave: (dateIso: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

function getInitialDateParts(currentDate?: string | null) {
  if (currentDate) {
    try {
      const d = new Date(currentDate);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return {
          datePart: `${year}-${month}-${day}`,
          timePart: `${hours}:${minutes}`,
        };
      }
    } catch {
    }
  }

  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 30);
  const year = defaultDate.getFullYear();
  const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
  const day = String(defaultDate.getDate()).padStart(2, '0');

  return {
    datePart: `${year}-${month}-${day}`,
    timePart: '14:00',
  };
}

function DefenseDateForm({
  onClose,
  currentDate,
  studentName,
  theme,
  onSave,
  onDelete,
}: Omit<DefenseDateModalProps, 'isOpen'>) {
  const initial = getInitialDateParts(currentDate);
  const [datePart, setDatePart] = useState(initial.datePart);
  const [timePart, setTimePart] = useState(initial.timePart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleApplyPreset = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDatePart(`${year}-${month}-${day}`);
  };

  const getComputedIso = (): string | null => {
    if (!datePart) return null;
    const time = timePart || '14:00';
    return `${datePart}T${time}:00`;
  };

  const computedIso = getComputedIso();

  let previewDateObj: Date | null = null;
  let formattedFullDate = '';
  let daysDiff: number | null = null;

  if (computedIso) {
    const d = new Date(computedIso);
    if (!isNaN(d.getTime())) {
      previewDateObj = d;
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      formattedFullDate = d.toLocaleDateString('pt-BR', options);

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const targetDay = new Date(d);
      targetDay.setHours(0, 0, 0, 0);
      const diffMs = targetDay.getTime() - now.getTime();
      daysDiff = Math.round(diffMs / (1000 * 60 * 60 * 24));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datePart) {
      setErrorMessage('Por favor, selecione a data da apresentação.');
      return;
    }
    if (!computedIso) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onSave(computedIso);
      onClose();
    } catch (err: unknown) {
      console.error('Erro ao salvar data da banca:', err);
      setErrorMessage('Erro ao salvar a data da banca. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onDelete();
      onClose();
    } catch (err: unknown) {
      console.error('Erro ao remover data da banca:', err);
      setErrorMessage('Erro ao remover a data da banca. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRescheduling = Boolean(currentDate);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="defense-date-modal-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-start mb-5 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <GraduationCap size={22} aria-hidden="true" />
            </div>
            <div>
              <h3 id="defense-date-modal-title" className="text-lg font-bold text-gray-800 leading-tight">
                {isRescheduling ? 'Reagendar Data da Banca' : 'Agendar Data da Banca'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Orientando(a): <strong className="text-gray-700">{studentName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg text-xs text-gray-600">
          <span className="font-semibold text-gray-700">Tema do TCC:</span> {theme}
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
            <AlertTriangle size={15} className="shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isConfirmingDelete ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 animate-in fade-in duration-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} aria-hidden="true" />
              <div className="flex-1 text-xs">
                <h4 className="font-bold text-red-800">Desmarcar banca examinadora?</h4>
                <p className="text-red-600 mt-1 leading-relaxed">
                  A data agendada será removida e a orientação voltará ao status de &quot;Banca a definir&quot;. Você poderá agendar uma nova data a qualquer momento.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                    Confirmar Desmarcação
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    disabled={isSubmitting}
                    className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" aria-hidden="true" /> Atalhos Rápidos
              </label>
              <span className="text-[10px] text-gray-400">Preenchimento com 1 clique</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '+15 dias', days: 15 },
                { label: '+30 dias', days: 30 },
                { label: '+60 dias', days: 60 },
                { label: '+90 dias', days: 90 },
              ].map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => handleApplyPreset(preset.days)}
                  className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-300 rounded-lg text-xs font-medium transition-all text-center"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="defense-date-field" className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-blue-600" aria-hidden="true" /> Data da Apresentação *
                </span>
              </label>
              <input
                id="defense-date-field"
                type="date"
                required
                value={datePart}
                onChange={(e) => setDatePart(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label htmlFor="defense-time-field" className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-blue-600" aria-hidden="true" /> Horário *
                </span>
              </label>
              <input
                id="defense-time-field"
                type="time"
                required
                value={timePart}
                onChange={(e) => setTimePart(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {previewDateObj && formattedFullDate && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-blue-600" aria-hidden="true" /> Pré-visualização da Banca
                </span>
                {daysDiff !== null && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      daysDiff < 0
                        ? 'bg-gray-100 text-gray-600 border border-gray-200'
                        : daysDiff === 0
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : daysDiff <= 7
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {daysDiff < 0
                      ? `Realizada há ${Math.abs(daysDiff)} dias`
                      : daysDiff === 0
                      ? 'Hoje!'
                      : `Faltam ${daysDiff} dias`}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-gray-800 capitalize first-letter:uppercase">
                {formattedFullDate}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {isRescheduling && !isConfirmingDelete ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 size={14} aria-hidden="true" /> Desmarcar Banca
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!datePart || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                {isSubmitting ? 'Salvando...' : isRescheduling ? 'Salvar Reagendamento' : 'Confirmar Agendamento'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DefenseDateModal(props: DefenseDateModalProps) {
  if (!props.isOpen) return null;
  return <DefenseDateForm {...props} />;
}
