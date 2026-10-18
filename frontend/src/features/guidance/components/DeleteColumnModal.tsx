import { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2, ArrowRightLeft, Trash2 } from 'lucide-react';
import type { KanbanColumn } from '../../../types';

interface DeleteColumnModalProps {
  isOpen: boolean;
  column: KanbanColumn | null;
  tasksCount: number;
  availableColumns: KanbanColumn[];
  onClose: () => void;
  onDelete: (columnId: number, targetColumnId?: number) => Promise<unknown>;
}

export function DeleteColumnModal({
  isOpen,
  column,
  tasksCount,
  availableColumns,
  onClose,
  onDelete,
}: DeleteColumnModalProps) {
  const otherColumns = availableColumns.filter((c) => column && c.id !== column.id);
  const [targetColumnId, setTargetColumnId] = useState<number | undefined>(
    otherColumns[0]?.id
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const candidates = availableColumns.filter((c) => column && c.id !== column.id);
    if (candidates.length > 0) {
      setTargetColumnId(candidates[0].id);
    }
    setError('');
  }, [column, availableColumns]);

  if (!isOpen || !column) return null;

  const isOnlyColumn = availableColumns.length <= 1;

  const handleConfirmDelete = async () => {
    if (isDeleting || isOnlyColumn) return;
    setIsDeleting(true);
    setError('');
    try {
      await onDelete(column.id, tasksCount > 0 ? targetColumnId : undefined);
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setError(
        axiosError?.response?.data?.detail || 'Erro ao excluir a coluna. Tente novamente.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-delete-column-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 id="modal-delete-column-title" className="text-base font-bold text-gray-800">
                Excluir Coluna
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {column.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {isOnlyColumn ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-800">
              O quadro Kanban precisa conter <strong>pelo menos uma coluna</strong> para manter o fluxo de trabalho. Adicione outra coluna antes de remover esta.
            </p>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        ) : tasksCount > 0 ? (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-800 text-xs space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                Esta coluna possui {tasksCount} tarefa{tasksCount > 1 ? 's' : ''} em andamento.
              </p>
              <p className="text-amber-700">
                Para não perder o progresso do aluno, selecione a coluna para a qual as tarefas devem ser transferidas:
              </p>
            </div>

            <div>
              <label htmlFor="target-column-select" className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <ArrowRightLeft size={13} className="text-blue-600" /> Mover tarefas para:
              </label>
              <select
                id="target-column-select"
                value={targetColumnId}
                onChange={(e) => setTargetColumnId(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-gray-800 font-medium"
              >
                {otherColumns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting || !targetColumnId}
                className="px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                {isDeleting ? 'Excluindo...' : 'Mover e Excluir'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Tem certeza de que deseja excluir a etapa <strong>"{column.title}"</strong>?
              Como ela não possui tarefas, a coluna será removida com segurança.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
