import React, { useState } from 'react';
import {
  Clock,
  PlayCircle,
  CheckCircle,
  Plus,
  KanbanSquare,
  Loader2,
  X,
  Filter,
  GraduationCap,
  User,
} from 'lucide-react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import type { Task, TaskStatus, KanbanColumn as KanbanColumnItem, KanbanColumnUpdatePayload } from '../../../types';
import { KanbanColumn } from './KanbanColumn';
import { EditColumnModal } from './EditColumnModal';
import { DeleteColumnModal } from './DeleteColumnModal';
import { KANBAN_COLOR_OPTIONS } from '../constants/kanbanColors';

interface KanbanBoardProps {
  tasks: Task[];
  columns?: KanbanColumnItem[];
  isAdvisor?: boolean;
  onDragEnd: (result: DropResult) => void;
  onTaskClick: (task: Task) => void;
  onOpenCreateTask?: (status: TaskStatus) => void;
  onAddColumn?: (title: string, color?: string) => Promise<unknown>;
  onDeleteColumn?: (columnId: number, targetColumnId?: number) => Promise<unknown>;
  onUpdateColumn?: (columnId: number, data: KanbanColumnUpdatePayload) => Promise<unknown>;
  onMoveColumn?: (columnId: number, direction: 'left' | 'right') => Promise<unknown>;
}

const DEFAULT_COLUMNS: KanbanColumnItem[] = [
  { id: 1, guidance_id: 0, title: 'A Fazer', slug: 'pending', color: 'bg-gray-100', order: 0 },
  { id: 2, guidance_id: 0, title: 'Em Andamento', slug: 'in_progress', color: 'bg-blue-50', order: 1 },
  { id: 3, guidance_id: 0, title: 'Concluído', slug: 'completed', color: 'bg-green-50', order: 2 },
];

function getColumnIcon(slug: string) {
  switch (slug) {
    case 'pending':
      return <Clock size={18} className="text-gray-500" />;
    case 'in_progress':
      return <PlayCircle size={18} className="text-blue-600" />;
    case 'completed':
      return <CheckCircle size={18} className="text-green-600" />;
    default:
      return <KanbanSquare size={18} className="text-indigo-600" />;
  }
}

export function KanbanBoard({
  tasks,
  columns,
  isAdvisor,
  onDragEnd,
  onTaskClick,
  onOpenCreateTask,
  onAddColumn,
  onDeleteColumn,
  onUpdateColumn,
  onMoveColumn,
}: KanbanBoardProps) {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-purple-50');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingColumn, setEditingColumn] = useState<KanbanColumnItem | null>(null);
  const [deletingColumn, setDeletingColumn] = useState<KanbanColumnItem | null>(null);
  const [creatorFilter, setCreatorFilter] = useState<'all' | 'advisor' | 'student'>('all');

  const countAdvisor = tasks.filter((t) => t.creator?.type === 'advisor').length;
  const countStudent = tasks.filter((t) => t.creator?.type === 'student').length;

  const filteredTasks = tasks.filter((t) => {
    if (creatorFilter === 'advisor') return t.creator?.type === 'advisor';
    if (creatorFilter === 'student') return t.creator?.type === 'student';
    return true;
  });

  const displayColumns = columns && columns.length > 0 ? columns : DEFAULT_COLUMNS;

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim() || !onAddColumn || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddColumn(newColumnTitle.trim(), selectedColor);
      setNewColumnTitle('');
      setSelectedColor('bg-purple-50');
      setIsAddingColumn(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveLeft = (col: KanbanColumnItem) => {
    if (onMoveColumn) {
      onMoveColumn(col.id, 'left');
    }
  };

  const handleMoveRight = (col: KanbanColumnItem) => {
    if (onMoveColumn) {
      onMoveColumn(col.id, 'right');
    }
  };

  const deletingColumnTasksCount = deletingColumn
    ? tasks.filter((t) => t.status === deletingColumn.slug).length
    : 0;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 pt-4 pb-1 flex flex-wrap items-center justify-between gap-3">
          <div
            role="toolbar"
            aria-label="Filtrar tarefas por autor"
            className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-medium text-gray-600"
          >
            <span className="text-gray-400 px-2 flex items-center gap-1 font-medium">
              <Filter size={13} aria-hidden="true" /> Origem:
            </span>
            <button
              type="button"
              onClick={() => setCreatorFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                creatorFilter === 'all'
                  ? 'bg-white text-gray-800 font-semibold shadow-xs'
                  : 'hover:text-gray-900 text-gray-600'
              }`}
            >
              Todas ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setCreatorFilter('advisor')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                creatorFilter === 'advisor'
                  ? 'bg-white text-purple-700 font-semibold shadow-xs ring-1 ring-purple-200'
                  : 'hover:text-purple-700 text-gray-600'
              }`}
            >
              <GraduationCap size={13} className="text-purple-600" aria-hidden="true" />
              Orientador ({countAdvisor})
            </button>
            <button
              type="button"
              onClick={() => setCreatorFilter('student')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                creatorFilter === 'student'
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs ring-1 ring-emerald-200'
                  : 'hover:text-emerald-700 text-gray-600'
              }`}
            >
              <User size={13} className="text-emerald-600" aria-hidden="true" />
              Aluno ({countStudent})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto p-6 pt-3">
          <div className="flex items-start gap-6 min-h-full pb-4">
            {displayColumns.map((col, index) => (
              <KanbanColumn
                key={col.id || col.slug}
                id={col.slug}
                column={col}
                tasks={filteredTasks.filter((t) => t.status === col.slug)}
                color={col.color || 'bg-gray-100'}
                icon={getColumnIcon(col.slug)}
                onClickTask={onTaskClick}
                onOpenCreateTask={onOpenCreateTask}
                isAdvisor={isAdvisor}
                canMoveLeft={index > 0}
                canMoveRight={index < displayColumns.length - 1}
                onEditColumn={onUpdateColumn ? () => setEditingColumn(col) : undefined}
                onDeleteColumn={onDeleteColumn ? () => setDeletingColumn(col) : undefined}
                onMoveColumnLeft={onMoveColumn ? handleMoveLeft : undefined}
                onMoveColumnRight={onMoveColumn ? handleMoveRight : undefined}
              />
            ))}

          {isAdvisor && onAddColumn && (
            <div className="w-80 min-w-[20rem] flex-shrink-0">
              {!isAddingColumn ? (
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50/40 transition-all font-medium text-sm group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-white border border-gray-200 group-hover:border-blue-300 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors shadow-xs">
                    <Plus size={18} />
                  </div>
                  <span>Adicionar Coluna</span>
                </button>
              ) : (
                <form
                  onSubmit={handleCreateColumn}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800">Nova Coluna</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColumnTitle('');
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                      aria-label="Cancelar adição de coluna"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div>
                    <label htmlFor="new-column-title" className="block text-xs font-medium text-gray-600 mb-1">
                      Título da Etapa *
                    </label>
                    <input
                      id="new-column-title"
                      type="text"
                      required
                      autoFocus
                      maxLength={60}
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      placeholder="Ex: Revisão, Testes, Impedimentos..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Cor da Coluna
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {KANBAN_COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setSelectedColor(c.value)}
                          title={c.label}
                          aria-label={`Cor ${c.label}`}
                          className={`w-6 h-6 rounded-full ${c.value} border-2 ${
                            selectedColor === c.value
                              ? 'ring-2 ring-blue-500 ring-offset-1 border-blue-500 scale-110'
                              : c.border
                          } transition-all`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColumnTitle('');
                      }}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!newColumnTitle.trim() || isSubmitting}
                      className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                      {isSubmitting ? 'Salvando...' : 'Adicionar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
      </div>

      {onUpdateColumn && (
        <EditColumnModal
          isOpen={Boolean(editingColumn)}
          column={editingColumn}
          onClose={() => setEditingColumn(null)}
          onUpdate={onUpdateColumn}
        />
      )}

      {onDeleteColumn && (
        <DeleteColumnModal
          isOpen={Boolean(deletingColumn)}
          column={deletingColumn}
          tasksCount={deletingColumnTasksCount}
          availableColumns={displayColumns}
          onClose={() => setDeletingColumn(null)}
          onDelete={onDeleteColumn}
        />
      )}
    </DragDropContext>
  );
}
