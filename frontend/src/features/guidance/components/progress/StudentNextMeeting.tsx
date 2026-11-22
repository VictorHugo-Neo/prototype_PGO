import type { Meeting } from '../../../../types';

interface StudentNextMeetingProps {
  meeting: Meeting | null;
  onOpenMeetings: () => void;
}

function formatMeetingDate(value: string): string {
  const date = new Date(value);
  const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${time}`;
}

export function StudentNextMeeting({ meeting, onOpenMeetings }: StudentNextMeetingProps) {
  return (
    <button
      type="button"
      onClick={onOpenMeetings}
      data-testid="student-next-meeting"
      className="flex min-w-0 flex-col justify-center px-4 py-3 text-left sm:px-5 sm:py-4 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
    >
      <span className="text-xs text-gray-500">Próxima reunião</span>
      {meeting ? (
        <>
          <span className="mt-0.5 text-sm font-semibold text-gray-900">
            {formatMeetingDate(meeting.date)}
            {meeting.status === 'pending' && (
              <span className="block text-xs font-medium text-amber-800 sm:ml-1.5 sm:inline">Aguardando</span>
            )}
          </span>
          <span className="mt-0.5 block w-full truncate text-xs text-gray-500" title={meeting.topic}>
            {meeting.topic}
          </span>
        </>
      ) : (
        <span className="mt-0.5 text-sm font-semibold text-gray-900">Nenhuma agendada</span>
      )}
    </button>
  );
}
