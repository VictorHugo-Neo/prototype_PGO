import { useMemo } from 'react';
import type { Task, KanbanColumn, Meeting } from '../../../types';

export type NextStepState = 'in_progress' | 'ready_to_start' | 'all_completed' | 'no_tasks';

export interface StudentProgressMetricsResult {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  nextTask: Task | null;
  nextTaskColumnTitle: string;
  nextStepState: NextStepState;
  upcomingMeeting: Meeting | null;
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 1, guidance_id: 0, title: 'A Fazer', slug: 'pending', color: 'bg-gray-100', order: 0 },
  { id: 2, guidance_id: 0, title: 'Em Andamento', slug: 'in_progress', color: 'bg-blue-50', order: 1 },
  { id: 3, guidance_id: 0, title: 'Concluído', slug: 'completed', color: 'bg-green-50', order: 2 },
];

const COMPLETION_TERMS = ['conclu', 'finaliz', 'pronto', 'done'];

function sortColumns(columns: KanbanColumn[]): KanbanColumn[] {
  const source = columns.length > 0 ? columns : DEFAULT_COLUMNS;
  return [...source].sort((a, b) => a.order - b.order || a.id - b.id);
}

function findCompletionColumn(columns: KanbanColumn[]): KanbanColumn | null {
  return (
    columns.find((column) => column.slug === 'completed') ??
    columns.find((column) => {
      const text = `${column.title} ${column.slug}`.toLowerCase();
      return COMPLETION_TERMS.some((term) => text.includes(term));
    }) ??
    (columns.length > 1 ? columns[columns.length - 1] : null)
  );
}

function firstTaskInColumns(tasks: Task[], columns: KanbanColumn[]): Task | undefined {
  for (const column of columns) {
    const task = tasks.find((item) => item.status === column.slug);
    if (task) return task;
  }
  return undefined;
}

function findUpcomingMeeting(meetings: Meeting[]): Meeting | null {
  const now = Date.now();
  return (
    meetings
      .filter((meeting) => meeting.status !== 'rejected' && new Date(meeting.date).getTime() >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null
  );
}

export function useStudentProgressMetrics(
  tasks: Task[],
  columns: KanbanColumn[] = [],
  meetings: Meeting[] = []
): StudentProgressMetricsResult {
  return useMemo(() => {
    const orderedColumns = sortColumns(columns);
    const completionColumn = findCompletionColumn(orderedColumns);
    const completionIndex = completionColumn
      ? orderedColumns.indexOf(completionColumn)
      : orderedColumns.length;
    const openTasks = tasks.filter((task) => task.status !== completionColumn?.slug);

    const activeColumns = orderedColumns.slice(1, Math.max(completionIndex, 1)).reverse();
    const activeTask = firstTaskInColumns(openTasks, activeColumns);
    const nextTask = activeTask ?? firstTaskInColumns(openTasks, orderedColumns) ?? openTasks[0] ?? null;

    const totalTasks = tasks.length;
    const completedTasks = totalTasks - openTasks.length;

    let nextStepState: NextStepState = 'ready_to_start';
    if (totalTasks === 0) nextStepState = 'no_tasks';
    else if (openTasks.length === 0) nextStepState = 'all_completed';
    else if (activeTask) nextStepState = 'in_progress';

    return {
      totalTasks,
      completedTasks,
      completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      nextTask,
      nextTaskColumnTitle: orderedColumns.find((column) => column.slug === nextTask?.status)?.title ?? '',
      nextStepState,
      upcomingMeeting: findUpcomingMeeting(meetings),
    };
  }, [tasks, columns, meetings]);
}
