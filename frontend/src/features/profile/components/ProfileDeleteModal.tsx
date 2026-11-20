import { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ProfileDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function ProfileDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: ProfileDeleteModalProps) {
  const [confirmationText, setConfirmationText] = useState('');

  if (!isOpen) return null;

  const isConfirmed = confirmationText.trim().toUpperCase() === 'EXCLUIR';

  const handleConfirm = async () => {
    if (isConfirmed) {
      await onConfirm();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <h2 id="delete-account-title" className="text-base font-bold text-gray-900">
            Excluir Conta Permanentemente
          </h2>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Esta ação é irreversível. Todos os seus dados, fotos, tarefas e vínculos acadêmicos serão definitivamente apagados do sistema.
          </p>
        </div>

        <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-xs text-red-700">
          Para confirmar, digite <strong className="font-bold">EXCLUIR</strong> no campo abaixo:
        </div>

        <div>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            disabled={isDeleting}
            placeholder="Digite EXCLUIR"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none uppercase font-mono tracking-wider"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isConfirmed || isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded-lg transition-all shadow-2xs cursor-pointer disabled:cursor-not-allowed"
          >
            {isDeleting && <Loader2 size={13} className="animate-spin" />}
            <span>{isDeleting ? 'Excluindo...' : 'Excluir Definitivamente'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
