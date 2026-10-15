import { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';

interface LinkStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (email: string, theme: string) => Promise<void>;
}

export function LinkStudentModal({ isOpen, onClose, onLink }: LinkStudentModalProps) {
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !theme.trim() || isSubmitting) return;

    setError('');
    setIsSubmitting(true);
    try {
      await onLink(email.trim(), theme.trim());
      setEmail('');
      setTheme('');
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Erro ao vincular aluno. Verifique se o e-mail está cadastrado como aluno.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-link-student-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <UserPlus size={20} />
            </div>
            <h3 id="modal-link-student-title" className="text-lg font-bold text-gray-800">
              Nova Orientação
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs leading-relaxed border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="student-email" className="block text-xs font-semibold text-gray-600 mb-1">
              E-mail do Aluno *
            </label>
            <input
              id="student-email"
              type="email"
              required
              placeholder="aluno@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="guidance-theme" className="block text-xs font-semibold text-gray-600 mb-1">
              Tema do TCC / Projeto *
            </label>
            <input
              id="guidance-theme"
              type="text"
              required
              placeholder="Ex: Arquitetura de Software em Microsserviços"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!email.trim() || !theme.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? 'Vinculando...' : 'Vincular Aluno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
