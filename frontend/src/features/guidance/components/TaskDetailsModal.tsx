import { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Send,
  Paperclip,
  Download,
  Loader2,
  Pencil,
  Trash2,
  Calendar,
  AlertTriangle,
  Check,
  GraduationCap,
  User,
} from 'lucide-react';
import type { Task, Comment, Attachment, TaskStatus, TaskUpdatePayload, KanbanColumn } from '../../../types';
import { API_BASE_URL } from '../../../services/api';

interface TaskDetailsModalProps {
  task: Task;
  comments: Comment[];
  attachments: Attachment[];
  columns?: KanbanColumn[];
  onClose: () => void;
  onUpdateStatus: (taskId: number, newStatus: TaskStatus) => Promise<void>;
  onUpdateTask: (taskId: number, data: TaskUpdatePayload) => Promise<Task>;
  onDeleteTask: (taskId: number) => Promise<void>;
  onAddComment: (taskId: number, content: string) => Promise<void>;
  onUploadAttachment: (taskId: number, file: File) => Promise<void>;
}

export function TaskDetailsModal({
  task,
  comments,
  attachments,
  columns,
  onClose,
  onUpdateStatus,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
  onUploadAttachment,
}: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editTimeEstimate, setEditTimeEstimate] = useState(
    task.time_estimate ? task.time_estimate.split('T')[0] : ''
  );
  const [editStatus, setEditStatus] = useState<TaskStatus>(task.status);
  const [isSaving, setIsSaving] = useState(false);

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditTimeEstimate(task.time_estimate ? task.time_estimate.split('T')[0] : '');
    setEditStatus(task.status);
    setIsEditing(false);
    setIsConfirmingDelete(false);
  }, [task]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await onUpdateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        time_estimate: editTimeEstimate || null,
        status: editStatus,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditTimeEstimate(task.time_estimate ? task.time_estimate.split('T')[0] : '');
    setEditStatus(task.status);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDeleteTask(task.id);
      onClose();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      setIsDeleting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await onAddComment(task.id, newComment);
      setNewComment('');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isUploading) return;

    setIsUploading(true);
    try {
      await onUploadAttachment(task.id, file);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-task-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div className="space-y-1 pr-4 flex-1">
            {!isEditing ? (
              <>
                <h3 id="modal-task-title" className="text-xl font-bold text-gray-800 break-words">
                  {task.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <label htmlFor="task-status-select" className="text-xs text-gray-500 font-medium">
                      Status:
                    </label>
                    <select
                      id="task-status-select"
                      value={task.status}
                      onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                      className="text-xs bg-white border border-gray-200 rounded px-2 py-1 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {columns && columns.length > 0 ? (
                        columns.map((c) => (
                          <option key={c.id || c.slug} value={c.slug}>
                            {c.title}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="pending">A Fazer</option>
                          <option value="in_progress">Em Andamento</option>
                          <option value="completed">Concluído</option>
                        </>
                      )}
                    </select>
                  </div>

                  {task.time_estimate && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded">
                      <Calendar size={13} className="text-blue-600" aria-hidden="true" />
                      <span>{new Date(task.time_estimate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}

                  {task.creator && (
                    <div
                      data-testid="task-creator-info"
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded font-medium border ${
                        task.creator.type === 'advisor'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                      title={task.creator.email ? `E-mail: ${task.creator.email}` : undefined}
                    >
                      {task.creator.type === 'advisor' ? (
                        <GraduationCap size={13} className="text-purple-600" aria-hidden="true" />
                      ) : (
                        <User size={13} className="text-emerald-600" aria-hidden="true" />
                      )}
                      <span>
                        Criada por:{' '}
                        <strong className="text-gray-800">{task.creator.name}</strong> ({task.creator.type === 'advisor' ? 'Orientador' : 'Aluno'})
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <h3 id="modal-task-title" className="text-lg font-bold text-gray-800">
                Editar Tarefa
              </h3>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {!isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setIsConfirmingDelete(false);
                  }}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar dados da tarefa"
                  aria-label="Editar dados da tarefa"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir tarefa"
                  aria-label="Excluir tarefa"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Fechar modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {isConfirmingDelete && (
          <div className="bg-red-50 border-b border-red-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-100">
            <div className="flex items-center gap-2.5 text-red-700 text-sm">
              <AlertTriangle size={18} className="shrink-0 text-red-600" />
              <span>
                Deseja excluir esta tarefa permanentemente? Seus anexos e mensagens serão removidos.
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isDeleting && <Loader2 size={12} className="animate-spin" />}
                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label htmlFor="edit-task-title" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Título da Tarefa *
                </label>
                <input
                  id="edit-task-title"
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="edit-task-desc" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Descrição
                </label>
                <textarea
                  id="edit-task-desc"
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descreva detalhes, objetivos ou referências..."
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-task-date" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Prazo Estimado
                  </label>
                  <input
                    id="edit-task-date"
                    type="date"
                    value={editTimeEstimate}
                    onChange={(e) => setEditTimeEstimate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
                  />
                </div>
                <div>
                  <label htmlFor="edit-task-status" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Status
                  </label>
                  <select
                    id="edit-task-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white"
                  >
                    {columns && columns.length > 0 ? (
                      columns.map((c) => (
                        <option key={c.id || c.slug} value={c.slug}>
                          {c.title}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="pending">A Fazer</option>
                        <option value="in_progress">Em Andamento</option>
                        <option value="completed">Concluído</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!editTitle.trim() || isSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Descrição
              </h4>
              {task.description ? (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                  {task.description}
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic bg-gray-50/50 p-3 rounded-lg border border-dashed border-gray-200">
                  Nenhuma descrição detalhada informada. Clique em editar para adicionar.
                </p>
              )}
            </div>
          )}

          {!isEditing && (
            <>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Arquivos Anexados
                  </h4>
                  <label className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    {isUploading ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> Enviando...
                      </>
                    ) : (
                      <>
                        <Paperclip size={12} /> + Adicionar
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>

                {attachments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Nenhum arquivo anexado a esta tarefa.</p>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-sm"
                      >
                        <span className="truncate max-w-[300px] text-gray-700 font-medium">
                          {file.filename}
                        </span>
                        <a
                          href={`${API_BASE_URL}/${file.file_path.replace(/\\/g, '/')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="text-gray-500 hover:text-blue-600 p-1"
                          aria-label={`Baixar arquivo ${file.filename}`}
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1">
                  <MessageSquare size={14} /> Mensagens e Feedbacks
                </h4>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Nenhum comentário registrado.</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                          <span className="font-semibold text-gray-700">{comment.user_name}</span>
                          <span>{new Date(comment.created_at).toLocaleString('pt-BR')}</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escreva uma mensagem ou tire uma dúvida..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 shadow-sm"
                  >
                    {isSubmittingComment ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
