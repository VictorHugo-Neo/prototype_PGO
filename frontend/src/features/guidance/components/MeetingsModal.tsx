import { useState } from 'react';
import { X, Calendar, Check, Loader2, Pencil, Trash2 } from 'lucide-react';
import type { Meeting, MeetingStatus, MeetingUpdatePayload } from '../../../types';
import { StatusBadge } from '../../../components/StatusBadge';

interface MeetingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetings: Meeting[];
  isAdvisor: boolean;
  onRequestMeeting: (date: string, topic: string) => Promise<void>;
  onUpdateStatus: (meetingId: number, status: 'confirmed' | 'rejected') => Promise<void>;
  onUpdateMeeting: (meetingId: number, data: MeetingUpdatePayload) => Promise<Meeting | void>;
  onDeleteMeeting: (meetingId: number) => Promise<void>;
}

function formatDateTimeLocal(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function MeetingsModal({
  isOpen,
  onClose,
  meetings,
  isAdvisor,
  onRequestMeeting,
  onUpdateStatus,
  onUpdateMeeting,
  onDeleteMeeting,
}: MeetingsModalProps) {
  const [newDate, setNewDate] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [editingMeetingId, setEditingMeetingId] = useState<number | null>(null);
  const [editTopic, setEditTopic] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStatus, setEditStatus] = useState<MeetingStatus>('pending');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [deletingMeetingId, setDeletingMeetingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTopic.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onRequestMeeting(newDate, newTopic.trim());
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

  const startEditing = (meeting: Meeting) => {
    setEditingMeetingId(meeting.id);
    setEditTopic(meeting.topic);
    setEditDate(formatDateTimeLocal(meeting.date));
    setEditStatus(meeting.status);
    setDeletingMeetingId(null);
  };

  const cancelEditing = () => {
    setEditingMeetingId(null);
    setEditTopic('');
    setEditDate('');
  };

  const handleSaveEdit = async (meetingId: number) => {
    if (!editTopic.trim() || !editDate || isSavingEdit) return;

    setIsSavingEdit(true);
    try {
      await onUpdateMeeting(meetingId, {
        topic: editTopic.trim(),
        date: editDate,
        status: editStatus,
      });
      cancelEditing();
    } finally {
      setIsSavingEdit(false);
    }
  };

  const startDeleting = (meetingId: number) => {
    setDeletingMeetingId(meetingId);
    setEditingMeetingId(null);
  };

  const cancelDeleting = () => {
    setDeletingMeetingId(null);
  };

  const handleConfirmDelete = async (meetingId: number) => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await onDeleteMeeting(meetingId);
      setDeletingMeetingId(null);
    } finally {
      setIsDeleting(false);
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
                {meetings.map((meeting) => {
                  if (editingMeetingId === meeting.id) {
                    return (
                      <div
                        key={meeting.id}
                        className="p-4 bg-white rounded-xl border-2 border-blue-200 shadow-sm space-y-3 animate-in fade-in duration-150"
                        data-testid={`meeting-edit-card-${meeting.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                            Editar Reunião
                          </span>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                            aria-label="Fechar edição"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div>
                          <label
                            htmlFor={`edit-topic-${meeting.id}`}
                            className="block text-xs font-medium text-gray-600 mb-1"
                          >
                            Pauta *
                          </label>
                          <input
                            id={`edit-topic-${meeting.id}`}
                            type="text"
                            required
                            value={editTopic}
                            onChange={(e) => setEditTopic(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor={`edit-date-${meeting.id}`}
                              className="block text-xs font-medium text-gray-600 mb-1"
                            >
                              Data e Horário *
                            </label>
                            <input
                              id={`edit-date-${meeting.id}`}
                              type="datetime-local"
                              required
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-status-${meeting.id}`}
                              className="block text-xs font-medium text-gray-600 mb-1"
                            >
                              Status
                            </label>
                            <select
                              id={`edit-status-${meeting.id}`}
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value as MeetingStatus)}
                              className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white"
                            >
                              <option value="pending">Pendente</option>
                              <option value="confirmed">Confirmada</option>
                              <option value="rejected">Rejeitada</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={isSavingEdit}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(meeting.id)}
                            disabled={!editTopic.trim() || !editDate || isSavingEdit}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            {isSavingEdit && <Loader2 size={13} className="animate-spin" />}
                            {isSavingEdit ? 'Salvando...' : 'Salvar Alterações'}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (deletingMeetingId === meeting.id) {
                    return (
                      <div
                        key={meeting.id}
                        className="p-4 bg-red-50/70 rounded-xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150"
                        data-testid={`meeting-delete-card-${meeting.id}`}
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-red-900">
                            Excluir esta reunião?
                          </p>
                          <p className="text-xs text-red-700">
                            &ldquo;{meeting.topic}&rdquo; ({new Date(meeting.date).toLocaleString('pt-BR')})
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={cancelDeleting}
                            disabled={isDeleting}
                            className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200/60 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(meeting.id)}
                            disabled={isDeleting}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-colors shadow-sm"
                          >
                            {isDeleting && <Loader2 size={12} className="animate-spin" />}
                            {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={meeting.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-200 transition-colors"
                      data-testid={`meeting-item-${meeting.id}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-800">
                            {meeting.topic}
                          </span>
                          <StatusBadge
                            status={meeting.status as MeetingStatus}
                            label={meeting.status === 'pending' ? 'Pendente' : undefined}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(meeting.date).toLocaleString('pt-BR')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        {isAdvisor && meeting.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(meeting.id, 'confirmed')}
                              disabled={updatingId === meeting.id}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-colors shadow-sm"
                              title="Aceitar reunião"
                            >
                              {updatingId === meeting.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                              Aceitar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(meeting.id, 'rejected')}
                              disabled={updatingId === meeting.id}
                              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors"
                              title="Recusar reunião"
                            >
                              Recusar
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => startEditing(meeting)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar reunião"
                          aria-label={`Editar reunião ${meeting.topic}`}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => startDeleting(meeting.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir reunião"
                          aria-label={`Excluir reunião ${meeting.topic}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              {isAdvisor ? 'Agendar Nova Reunião' : 'Solicitar Nova Reunião'}
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
                  Data e Horário *
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
                  {isSubmitting
                    ? 'Enviando...'
                    : isAdvisor
                    ? 'Agendar Reunião'
                    : 'Solicitar Reunião'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
