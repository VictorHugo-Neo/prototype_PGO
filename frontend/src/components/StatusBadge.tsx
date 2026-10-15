import { Clock, PlayCircle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import type { TaskStatus, MeetingStatus } from '../types';

type AnyStatus = TaskStatus | MeetingStatus | 'ativo' | 'atrasado' | 'concluido';

interface StatusBadgeProps {
  status: AnyStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const configs: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    pending: {
      label: 'A Fazer',
      className: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: <Clock size={12} aria-hidden="true" />,
    },
    in_progress: {
      label: 'Em Andamento',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <PlayCircle size={12} aria-hidden="true" />,
    },
    completed: {
      label: 'Concluído',
      className: 'bg-green-50 text-green-700 border-green-200',
      icon: <CheckCircle size={12} aria-hidden="true" />,
    },
    late: {
      label: 'Atrasado',
      className: 'bg-red-50 text-red-700 border-red-200',
      icon: <AlertCircle size={12} aria-hidden="true" />,
    },
    confirmed: {
      label: 'Confirmada',
      className: 'bg-green-50 text-green-700 border-green-200',
      icon: <CheckCircle size={12} aria-hidden="true" />,
    },
    rejected: {
      label: 'Rejeitada',
      className: 'bg-red-50 text-red-700 border-red-200',
      icon: <XCircle size={12} aria-hidden="true" />,
    },
    ativo: {
      label: 'Ativo',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <CheckCircle size={12} aria-hidden="true" />,
    },
    atrasado: {
      label: 'Atrasado',
      className: 'bg-red-50 text-red-700 border-red-200',
      icon: <AlertCircle size={12} aria-hidden="true" />,
    },
    concluido: {
      label: 'Concluído',
      className: 'bg-green-50 text-green-700 border-green-200',
      icon: <CheckCircle size={12} aria-hidden="true" />,
    },
  };

  const config = configs[status] || {
    label: String(status),
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}