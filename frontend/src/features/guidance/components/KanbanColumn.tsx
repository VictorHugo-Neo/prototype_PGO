import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreVertical, Edit2, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';
import type { Task, TaskStatus, KanbanColumn as KanbanColumnType } from '../../../types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
  icon: React.ReactNode;
  onClickTask: (task: Task) => void;
  onOpenCreateTask?: (status: TaskStatus) => void;
  columnId?: number;
  columnData?: KanbanColumnType;
  isAdvisor?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onEditColumn?: (column: KanbanColumnType) => void;
  onRequestDeleteColumn?: (column: KanbanColumnType) => void;
  onMoveColumn?: (columnId: number, direction: 'left' | 'right') => void;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  color,
  icon,
  onClickTask,
  onOpenCreateTask,
  columnId,
  columnData,
  isAdvisor,
  isFirst,
  isLast,
  onEditColumn,
  onRequestDeleteColumn,
  onMoveColumn,
}: KanbanColumnProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleEditClick = () => {
    setIsMenuOpen(false);
    if (columnData && onEditColumn) {
      onEditColumn(columnData);
    }
  };

  const handleDeleteClick = () => {
    setIsMenuOpen(false);
    if (columnData && onRequestDeleteColumn) {
      onRequestDeleteColumn(columnData);
    }
  };

  const handleMove = (direction: 'left' | 'right') => {
    setIsMenuOpen(false);
    if (columnId && onMoveColumn) {
      onMoveColumn(columnId, direction);
    }
  };

  return (
    <div className={`flex flex-col rounded-2xl p-4 min-h-[500px] w-80 min-w-[20rem] flex-shrink-0 ${color} transition-all duration-200 border border-gray-200/60 shadow-xs`}>
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon}
          <h3 className="truncate text-sm font-bold tracking-tight text-gray-800" title={title}>
            {title}
          </h3>
        </div>

        <span className="bg-white/90 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-xs text-gray-600 border border-gray-200/80">
          {tasks.length}
        </span>

        {/* Quick Add Task Button */}
        {onOpenCreateTask && (
          <button
            type="button"
            onClick={() => onOpenCreateTask(id)}
            className="p-1 hover:bg-white rounded-lg text-gray-400 hover:text-blue-600 transition-colors shadow-none hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={`Adicionar tarefa em ${title}`}
            aria-label={`Adicionar tarefa em ${title}`}
          >
            <Plus size={16} />
          </button>
        )}

        {/* Advisor Options Menu */}
        {isAdvisor && columnData && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              className={`p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-colors shadow-none hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isMenuOpen ? 'bg-white text-gray-700 shadow-xs' : ''
              }`}
              title="Opções da etapa"
              aria-label="Opções da etapa"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
              >
                {onEditColumn && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleEditClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 size={14} className="text-gray-400" />
                    <span>Editar Etapa</span>
                  </button>
                )}

                {onMoveColumn && (
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={isFirst}
                      onClick={() => handleMove('left')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft size={14} className="text-gray-400" />
                      <span>Mover para a Esquerda</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={isLast}
                      onClick={() => handleMove('right')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowRight size={14} className="text-gray-400" />
                      <span>Mover para a Direita</span>
                    </button>
                  </>
                )}

                {onOpenCreateTask && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenCreateTask(id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={14} className="text-gray-400" />
                    <span>Nova Tarefa</span>
                  </button>
                )}

                {onRequestDeleteColumn && (
                  <>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleDeleteClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} className="text-red-500" />
                      <span>Excluir Etapa</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-3 transition-colors flex flex-col rounded-xl ${
              snapshot.isDraggingOver ? 'bg-blue-100/40 p-1 ring-2 ring-blue-400/50 ring-dashed' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={index}
                onClick={onClickTask}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-32 border border-dashed border-gray-300/80 rounded-xl flex flex-col items-center justify-center text-center p-3 text-gray-400 mt-2 bg-white/30">
                <p className="text-xs font-medium">Nenhuma tarefa nesta etapa</p>
                {onOpenCreateTask && (
                  <button
                    type="button"
                    onClick={() => onOpenCreateTask(id)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 hover:underline"
                  >
                    <Plus size={13} /> Criar Tarefa
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Footer Add Task Shortcut */}
      {onOpenCreateTask && tasks.length > 0 && (
        <button
          type="button"
          onClick={() => onOpenCreateTask(id)}
          className="mt-3 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200/80 hover:shadow-xs"
        >
          <Plus size={14} /> Adicionar tarefa
        </button>
      )}
    </div>
  );
}
