import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import type { Task, TaskStatus } from '../../../types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
  icon: React.ReactNode;
  onClickTask: (task: Task) => void;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  color,
  icon,
  onClickTask,
}: KanbanColumnProps) {
  return (
    <div className={`flex flex-col rounded-xl p-4 min-h-[500px] ${color}`}>
      <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
        {icon}
        <h3>{title}</h3>
        <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-xs shadow-sm text-gray-500 border border-gray-100">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-3 transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-100/30 rounded-lg p-1' : ''
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
          </div>
        )}
      </Droppable>
    </div>
  );
}
