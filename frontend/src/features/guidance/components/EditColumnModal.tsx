import React, { useState, useEffect } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import type { KanbanColumn, KanbanColumnUpdatePayload } from '../../../types';
import { KANBAN_COLOR_OPTIONS } from '../constants/kanbanColors';

interface EditColumnModalProps {
  isOpen: boolean;
  column: KanbanColumn | null;
  onClose: () => void;
  onUpdate: (columnId: number, data: KanbanColumnUpdatePayload) => Promise<unknown>;
}

export function EditColumnModal({
  isOpen,
  column,
  onClose,
  onUpdate,
}: EditColumnModalProps) {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-gray-100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (column) {
      setTitle(column.title);
      setSelectedColor(column.color || 'bg-gray-100');
      setError('');
    }
  }, [column, isOpen]);

  if (!isOpen || !column) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('O título da coluna é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onUpdate(column.id, {
        title: cleanTitle,
        color: selectedColor,
      });
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setError(axiosError?.response?.data?.detail || 'Erro ao atualizar a coluna.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-edit-column-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-center mb-5">
          <h3 id="modal-edit-column-title" className="text-lg font-bold text-gray-800">
            Editar Coluna
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-column-title" className="block text-xs font-semibold text-gray-700 mb-1">
              Nome da Etapa *
            </label>
            <input
              id="edit-column-title"
              type="text"
              required
              autoFocus
              maxLength={60}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ex: A Fazer, Em Revisão, Finalizado..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Cor de Destaque
            </label>
            <div className="grid grid-cols-4 gap-2">
              {KANBAN_COLOR_OPTIONS.map((c) => {
                const isSelected = selectedColor === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all ${c.value} ${
                      isSelected
                        ? 'ring-2 ring-blue-500 border-blue-500 font-bold shadow-xs'
                        : `${c.border} text-gray-700 hover:border-gray-400`
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${c.dot} shrink-0`} />
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <span className="block text-xs font-medium text-gray-500 mb-1.5">
              Pré-visualização do cabeçalho:
            </span>
            <div className={`p-3 rounded-xl border border-gray-200/60 ${selectedColor} flex items-center justify-between`}>
              <span className="font-semibold text-sm text-gray-800 truncate">
                {title.trim() || 'Nome da Coluna'}
              </span>
              <span className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-500 border border-gray-100 shadow-2xs">
                0
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
