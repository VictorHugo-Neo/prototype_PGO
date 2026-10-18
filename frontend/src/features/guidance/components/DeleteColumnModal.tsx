import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, ArrowRight, Loader2, X, ShieldAlert } from 'lucide-react';
import type { KanbanColumn } from '../../../types';

interface DeleteColumnModalProps {
  isOpen: boolean;
  column: KanbanColumn | null;
  columns: KanbanColumn[];
  taskCount: number;
  onClose: () => void;
  onConfirmDelete: (columnId: number, targetColumnId?: number) => Promise<void>;
}

export function DeleteColumnModal({
  isOpen,
  column,
  columns,
  taskCount,
  onClose,
  onConfirmDelete,
}: DeleteColumnModalProps) {
  const [targetColumnId, setTargetColumnId] = useState<number | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const otherColumns = columns.filter((c) => column && c.id !== column.id);
  const isOnlyColumn = columns.length <= 1;

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      const available = columns.filter((c) => column && c.id !== column.id);
      if (available.length > 0) {
        setTargetColumnId(available[0].id);
      } else {
        setTargetColumnId(undefined);
      }
    }
  }, [isOpen, column, columns]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !column) return null;

  const handleDelete = async () => {
    if (isDeleting) return;

    if (taskCount > 0 && !targetColumnId && otherColumns.length > 0) {
      setErrorMessage('Selecione uma etapa de destino para transferir as tarefas existentes.');
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await onConfirmDelete(column.id, taskCount > 0 ? targetColumnId : undefined);
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setErrorMessage(axiosError?.response?.data?.detail || 'Erro ao excluir coluna.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-column-title"
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isOnlyColumn ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
            }`}>
              {isOnlyColumn ? <ShieldAlert size={20} /> : <Trash2 size={20} />}
            </div>
            <div>
              <h2 id="delete-column-title" className="text-lg font-bold text-gray-900">
                {isOnlyColumn ? 'Coluna Única' : 'Excluir Etapa'}
              </h2>
              <p className="text-xs text-gray-500">
                Coluna: <span className="font-semibold text-gray-700">{column.title}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {errorMessage}
            </div>
          )}

          {isOnlyColumn ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                <AlertTriangle size={18} />
                <span>Não é possível excluir esta coluna</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                O quadro Kanban precisa de pelo menos uma etapa ativa para organizar as tarefas da orientação. Crie outra etapa antes de excluir esta.
              </p>
            </div>
          ) : taskCount === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                Tem certeza que deseja excluir a coluna <strong className="text-gray-900">"{column.title}"</strong>?
              </p>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500">
                Esta etapa está vazia no momento. Nenhuma tarefa será afetada.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 space-y-1">
                  <p className="font-semibold">
                    Esta coluna contém {taskCount} tarefa{taskCount > 1 ? 's' : ''}.
                  </p>
                  <p>
                    Para manter o histórico íntegro, selecione para qual etapa deseja transferir as tarefas existentes antes de excluí-la:
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="target-column-select"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
                >
                  Transferir Tarefas Para:
                </label>
                <div className="relative">
                  <select
                    id="target-column-select"
                    value={targetColumnId || ''}
                    onChange={(e) => setTargetColumnId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    {otherColumns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title} ({col.slug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-700">
                <ArrowRight size={14} className="flex-shrink-0" />
                <span>
                  As {taskCount} tarefa{taskCount > 1 ? 's' : ''} serão movidas para{' '}
                  <strong>{otherColumns.find((c) => c.id === targetColumnId)?.title}</strong>.
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            >
              {isOnlyColumn ? 'Fechar' : 'Cancelar'}
            </button>
            {!isOnlyColumn && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                {taskCount > 0 ? 'Transferir e Excluir' : 'Excluir Coluna'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
