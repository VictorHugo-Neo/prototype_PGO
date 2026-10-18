import { useState } from 'react';
import { Clock, PlayCircle, CheckCircle, Plus, KanbanSquare } from 'lucide-react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import type { Task, TaskStatus, KanbanColumn as KanbanColumnItem, KanbanColumnUpdatePayload } from '../../../types';
import { KanbanColumn } from './KanbanColumn';
import { ColumnModal } from './ColumnModal';
import { DeleteColumnModal } from './DeleteColumnModal';

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
      return <CheckCircle size={18} className="text-emerald-600" />;
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
  // Modal states for column management
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [columnModalMode, setColumnModalMode] = useState<'create' | 'edit'>('create');
  const [selectedColumnForEdit, setSelectedColumnForEdit] = useState<KanbanColumnItem | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedColumnForDelete, setSelectedColumnForDelete] = useState<KanbanColumnItem | null>(null);

  const displayColumns = columns && columns.length > 0 ? columns : DEFAULT_COLUMNS;

  const handleOpenCreateColumn = () => {
    setColumnModalMode('create');
    setSelectedColumnForEdit(null);
    setIsColumnModalOpen(true);
  };

  const handleOpenEditColumn = (col: KanbanColumnItem) => {
    setColumnModalMode('edit');
    setSelectedColumnForEdit(col);
    setIsColumnModalOpen(true);
  };

  const handleSaveColumn = async (title: string, color: string) => {
    if (columnModalMode === 'create' && onAddColumn) {
      await onAddColumn(title, color);
    } else if (columnModalMode === 'edit' && selectedColumnForEdit && onUpdateColumn) {
      await onUpdateColumn(selectedColumnForEdit.id, { title, color });
    }
  };

  const handleRequestDeleteColumn = (col: KanbanColumnItem) => {
    setSelectedColumnForDelete(col);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (columnId: number, targetColumnId?: number) => {
    if (onDeleteColumn) {
      await onDeleteColumn(columnId, targetColumnId);
    }
  };

  const tasksInColumnToDelete = selectedColumnForDelete
    ? tasks.filter((t) => t.status === selectedColumnForDelete.slug).length
    : 0;

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex items-start gap-6 min-h-full pb-4">
            {displayColumns.map((col, index) => {
              return (
                <KanbanColumn
                  key={col.id || col.slug}
                  id={col.slug}
                  columnId={col.id}
                  columnData={col}
                  title={col.title}
                  tasks={tasks.filter((t) => t.status === col.slug)}
                  color={col.color || 'bg-gray-100'}
                  icon={getColumnIcon(col.slug)}
                  onClickTask={onTaskClick}
                  onOpenCreateTask={onOpenCreateTask}
                  isAdvisor={isAdvisor}
                  isFirst={index === 0}
                  isLast={index === displayColumns.length - 1}
                  onEditColumn={handleOpenEditColumn}
                  onRequestDeleteColumn={handleRequestDeleteColumn}
                  onMoveColumn={onMoveColumn}
                />
              );
            })}

            {/* Add Column Card */}
            {isAdvisor && onAddColumn && (
              <div className="w-80 min-w-[20rem] flex-shrink-0">
                <button
                  type="button"
                  onClick={handleOpenCreateColumn}
                  className="w-full h-36 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center gap-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50/40 transition-all font-semibold text-sm group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 group-hover:border-blue-300 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors shadow-xs">
                    <Plus size={20} />
                  </div>
                  <span>Adicionar Etapa</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </DragDropContext>

      {/* Column Create / Edit Modal */}
      <ColumnModal
        isOpen={isColumnModalOpen}
        mode={columnModalMode}
        column={selectedColumnForEdit}
        onClose={() => {
          setIsColumnModalOpen(false);
          setSelectedColumnForEdit(null);
        }}
        onSave={handleSaveColumn}
      />

      {/* Delete Column Smart Modal */}
      <DeleteColumnModal
        isOpen={isDeleteModalOpen}
        column={selectedColumnForDelete}
        columns={displayColumns}
        taskCount={tasksInColumnToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedColumnForDelete(null);
        }}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}
