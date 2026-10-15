import { Clock, PlayCircle, CheckCircle } from 'lucide-react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import type { Task, TaskStatus } from '../../../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  onDragEnd: (result: DropResult) => void;
  onTaskClick: (task: Task) => void;
  onOpenCreateTask?: (status: TaskStatus) => void;
}

export function KanbanBoard({ tasks, onDragEnd, onTaskClick, onOpenCreateTask }: KanbanBoardProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex-1 overflow-x-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <KanbanColumn
            id="pending"
            title="A Fazer"
            tasks={tasks.filter((t) => t.status === 'pending')}
            color="bg-gray-100"
            icon={<Clock size={18} className="text-gray-500" />}
            onClickTask={onTaskClick}
            onOpenCreateTask={onOpenCreateTask}
          />
          <KanbanColumn
            id="in_progress"
            title="Em Andamento"
            tasks={tasks.filter((t) => t.status === 'in_progress')}
            color="bg-blue-50"
            icon={<PlayCircle size={18} className="text-blue-600" />}
            onClickTask={onTaskClick}
            onOpenCreateTask={onOpenCreateTask}
          />
          <KanbanColumn
            id="completed"
            title="Concluído"
            tasks={tasks.filter((t) => t.status === 'completed')}
            color="bg-green-50"
            icon={<CheckCircle size={18} className="text-green-600" />}
            onClickTask={onTaskClick}
            onOpenCreateTask={onOpenCreateTask}
          />
        </div>
      </div>
    </DragDropContext>
  );
}
