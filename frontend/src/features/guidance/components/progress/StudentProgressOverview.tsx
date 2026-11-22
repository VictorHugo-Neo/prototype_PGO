import type { Task, KanbanColumn, Meeting } from '../../../../types';
import { useStudentProgressMetrics } from '../../hooks/useStudentProgressMetrics';
import { StudentNextAction } from './StudentNextAction';
import { StudentNextMeeting } from './StudentNextMeeting';
import { StudentProgressMeter } from './StudentProgressMeter';

interface StudentProgressOverviewProps {
  tasks: Task[];
  columns?: KanbanColumn[];
  meetings: Meeting[];
  onTaskClick: (task: Task) => void;
  onOpenCreateTask?: () => void;
  onOpenMeetingsModal: () => void;
}

export function StudentProgressOverview({
  tasks,
  columns,
  meetings,
  onTaskClick,
  onOpenCreateTask,
  onOpenMeetingsModal,
}: StudentProgressOverviewProps) {
  const {
    totalTasks,
    completedTasks,
    completionPercentage,
    nextTask,
    nextTaskColumnTitle,
    nextStepState,
    upcomingMeeting,
  } = useStudentProgressMetrics(tasks, columns, meetings);

  return (
    <section
      data-testid="student-progress-overview"
      aria-label="Resumo do progresso da orientação"
      className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2 w-full"
    >
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-gray-200 bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <StudentNextAction
          nextTask={nextTask}
          columnTitle={nextTaskColumnTitle}
          nextStepState={nextStepState}
          onTaskClick={onTaskClick}
          onOpenCreateTask={onOpenCreateTask}
        />
        <StudentProgressMeter
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          completionPercentage={completionPercentage}
        />
        <StudentNextMeeting meeting={upcomingMeeting} onOpenMeetings={onOpenMeetingsModal} />
      </div>
    </section>
  );
}
