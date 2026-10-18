import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Palette, KanbanSquare } from 'lucide-react';
import type { KanbanColumn } from '../../../types';

interface ColumnColorOption {
  label: string;
  value: string;
  border: string;
  dot: string;
  text: string;
}

const KANBAN_COLOR_OPTIONS: ColumnColorOption[] = [
  { label: 'Cinza Neutro', value: 'bg-gray-100', border: 'border-gray-300', dot: 'bg-gray-400', text: 'text-gray-700' },
  { label: 'Azul Sereno', value: 'bg-blue-50', border: 'border-blue-300', dot: 'bg-blue-500', text: 'text-blue-700' },
  { label: 'Verde Esmeralda', value: 'bg-emerald-50', border: 'border-emerald-300', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  { label: 'Âmbar Quente', value: 'bg-amber-50', border: 'border-amber-300', dot: 'bg-amber-500', text: 'text-amber-700' },
  { label: 'Roxo Criativo', value: 'bg-purple-50', border: 'border-purple-300', dot: 'bg-purple-500', text: 'text-purple-700' },
  { label: 'Rosa Vibrante', value: 'bg-rose-50', border: 'border-rose-300', dot: 'bg-rose-500', text: 'text-rose-700' },
  { label: 'Índigo Profundo', value: 'bg-indigo-50', border: 'border-indigo-300', dot: 'bg-indigo-500', text: 'text-indigo-700' },
  { label: 'Ciano Moderno', value: 'bg-cyan-50', border: 'border-cyan-300', dot: 'bg-cyan-500', text: 'text-cyan-700' },
];

interface ColumnModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  column?: KanbanColumn | null;
  onClose: () => void;
  onSave: (title: string, color: string) => Promise<void>;
}

export function ColumnModal({
  isOpen,
  mode,
  column,
  onClose,
  onSave,
}: ColumnModalProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('bg-purple-50');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && column) {
        setTitle(column.title);
        setColor(column.color || 'bg-purple-50');
      } else {
        setTitle('');
        setColor('bg-purple-50');
      }
      setErrorMessage(null);
      // Autofocus input on open
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, mode, column]);

  // Handle ESC key to dismiss modal
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
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMessage('O título da etapa é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onSave(cleanTitle, color);
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setErrorMessage(axiosError?.response?.data?.detail || 'Erro ao salvar coluna.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOption = KANBAN_COLOR_OPTIONS.find((c) => c.value === color) || KANBAN_COLOR_OPTIONS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="column-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <KanbanSquare size={20} />
            </div>
            <div>
              <h2 id="column-modal-title" className="text-lg font-bold text-gray-900">
                {mode === 'create' ? 'Adicionar Nova Etapa' : 'Editar Etapa do Kanban'}
              </h2>
              <p className="text-xs text-gray-500">
                {mode === 'create'
                  ? 'Personalize o fluxo de trabalho da sua orientação.'
                  : 'Altere o nome e o tema visual desta etapa.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {errorMessage}
            </div>
          )}

          <div>
            <label htmlFor="column-title-input" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Título da Etapa <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              id="column-title-input"
              type="text"
              required
              maxLength={40}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Ex: Em Revisão, Homologação, Artigo..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium"
            />
            <span className="text-[11px] text-gray-400 mt-1 block text-right">
              {title.length}/40 caracteres
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Palette size={16} className="text-gray-500" />
              <label className="text-sm font-semibold text-gray-700">
                Tema de Cor da Coluna
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {KANBAN_COLOR_OPTIONS.map((c) => {
                const isSelected = color === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${c.dot} flex-shrink-0`} />
                    <span className="truncate text-gray-700">{c.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Card */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Pré-visualização da Etapa
            </label>
            <div className={`p-4 rounded-xl border border-dashed border-gray-300 ${color} transition-colors`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-3 h-3 rounded-full ${selectedOption.dot}`} />
                  <span className="font-semibold text-gray-800 text-sm truncate">
                    {title.trim() || 'Nome da Etapa'}
                  </span>
                </div>
                <span className="bg-white/80 px-2 py-0.5 rounded-full text-xs font-semibold text-gray-500 border border-gray-100 shadow-xs">
                  0
                </span>
              </div>
              <div className="mt-3 py-3 border border-dashed border-gray-300/80 rounded-lg text-center bg-white/40">
                <p className="text-[11px] text-gray-500">As tarefas serão organizadas aqui</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {mode === 'create' ? 'Criar Coluna' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
