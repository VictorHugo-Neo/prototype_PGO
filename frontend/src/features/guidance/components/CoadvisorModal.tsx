import { useState, useEffect } from 'react';
import { X, GraduationCap, AlertCircle, Loader2, Trash2, CheckCircle2 } from 'lucide-react';

interface CoadvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoadvisor?: {
    id: number;
    name: string;
    email?: string;
  } | null;
  studentName?: string;
  theme?: string;
  onSave: (email: string) => Promise<void>;
  onRemove?: () => Promise<void>;
}

export function CoadvisorModal({
  isOpen,
  onClose,
  currentCoadvisor,
  studentName,
  theme,
  onSave,
  onRemove,
}: CoadvisorModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(currentCoadvisor?.email || '');
      setError('');
      setIsSubmitting(false);
      setIsConfirmingRemove(false);
    }
  }, [isOpen, currentCoadvisor]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || isSubmitting) return;

    setError('');
    setIsSubmitting(true);
    try {
      await onSave(trimmed);
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setError(
        axiosError.response?.data?.detail ||
          'Erro ao atualizar coorientador. Verifique se o e-mail pertence a um docente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      await onRemove();
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setError(
        axiosError.response?.data?.detail || 'Erro ao remover coorientador.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coadvisor-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <GraduationCap size={20} aria-hidden="true" />
            </div>
            <div>
              <h3 id="coadvisor-modal-title" className="font-bold text-gray-800 text-base">
                {currentCoadvisor ? 'Gerenciar Coorientador' : 'Vincular Coorientador'}
              </h3>
              <p className="text-xs text-gray-500">
                {studentName ? `Projeto de ${studentName}` : 'Orientação acadêmica'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div
              role="alert"
              className="p-3 bg-red-50 text-red-700 rounded-xl text-xs leading-relaxed border border-red-100 flex items-start gap-2"
            >
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {theme && (
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Tema: </span>
              {theme}
            </div>
          )}

          {currentCoadvisor && (
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  Coorientador Atual
                </span>
                <p className="font-semibold text-gray-800 text-sm truncate mt-0.5">
                  {currentCoadvisor.name}
                </p>
                {currentCoadvisor.email && (
                  <p className="text-xs text-gray-500 truncate">{currentCoadvisor.email}</p>
                )}
              </div>
              <span className="shrink-0 p-1 bg-white rounded-md border border-indigo-100 text-indigo-600">
                <CheckCircle2 size={16} />
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="coadvisor-email-input"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
                {currentCoadvisor
                  ? 'Alterar E-mail do Coorientador'
                  : 'E-mail do Docente Coorientador *'}
              </label>
              <input
                id="coadvisor-email-input"
                type="email"
                required
                placeholder="Ex: professor.coorientador@universidade.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                O coorientador terá acesso integral ao Kanban, tarefas, reuniões e relatório.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
              {currentCoadvisor && onRemove ? (
                isConfirmingRemove ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Removendo...' : 'Confirmar Remoção'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingRemove(false)}
                      className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingRemove(true)}
                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                    Desvincular
                  </button>
                )
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={!email.trim() || isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                  {isSubmitting
                    ? 'Salvando...'
                    : currentCoadvisor
                    ? 'Atualizar Coorientador'
                    : 'Vincular Coorientador'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
