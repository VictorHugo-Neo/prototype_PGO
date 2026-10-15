import { useState } from 'react';
import { X, Calendar, Check, Loader2 } from 'lucide-react';
import type { Meeting, MeetingStatus } from '../../../types';
import { StatusBadge } from '../../../components/StatusBadge';

interface MeetingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetings: Meeting[];
  isAdvisor: boolean;
  onRequestMeeting: (date: string, topic: string) => Promise<void>;
  onUpdateStatus: (meetingId: number, status: 'confirmed' | 'rejected') => Promise<void>;
}

export function MeetingsModal({
  isOpen,
  onClose,
  meetings,
  isAdvisor,
  onRequestMeeting,
  onUpdateStatus,
}: MeetingsModalProps) {
  const [newDate, setNewDate] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTopic.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onRequestMeeting(newDate, newTopic);
      setNewDate('');
      setNewTopic('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (meetingId: number, status: 'confirmed' | 'rejected') => {
    setUpdatingId(meetingId);
    try {
      await onUpdateStatus(meetingId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-meetings-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <h3 id="modal-meetings-title" className="text-lg font-bold text-gray-800">
              Reuniões de Orientação
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Reuniões Agendadas ({meetings.length})
            </h4>

            {meetings.length === 0 ? (
              <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center">
                Nenhuma reunião cadastrada para este projeto.
              </p>
            ) : (
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {meeting.topic}
                        </span>
                        <StatusBadge status={meeting.status as MeetingStatus} />
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(meeting.date).toLocaleString('pt-BR')}
                      </p>
                    </div>

                    {isAdvisor && meeting.status === 'pending' && (
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(meeting.id, 'confirmed')}
                          disabled={updatingId === meeting.id}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Check size={14} /> Aceitar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(meeting.id, 'rejected')}
                          disabled={updatingId === meeting.id}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors"
                        >
                          Recusar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Solicitar Nova Reunião
            </h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="meeting-topic"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Pauta da Reunião *
                </label>
                <input
                  id="meeting-topic"
                  type="text"
                  required
                  placeholder="Ex: Alinhamento de Metodologia e Cronograma"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="meeting-date"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Data e Horário Proposto *
                </label>
                <input
                  id="meeting-date"
                  type="datetime-local"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!newDate || !newTopic.trim() || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? 'Enviando...' : 'Solicitar Reunião'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
