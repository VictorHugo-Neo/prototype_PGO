import { useState } from 'react';
import { X, MessageSquare, Send, Paperclip, Download, Loader2 } from 'lucide-react';
import type { Task, Comment, Attachment, TaskStatus } from '../../../types';
import { API_BASE_URL } from '../../../services/api';

interface TaskDetailsModalProps {
  task: Task;
  comments: Comment[];
  attachments: Attachment[];
  onClose: () => void;
  onUpdateStatus: (taskId: number, newStatus: TaskStatus) => Promise<void>;
  onAddComment: (taskId: number, content: string) => Promise<void>;
  onUploadAttachment: (taskId: number, file: File) => Promise<void>;
}

export function TaskDetailsModal({
  task,
  comments,
  attachments,
  onClose,
  onUpdateStatus,
  onAddComment,
  onUploadAttachment,
}: TaskDetailsModalProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
          <div className="space-y-1 pr-6 flex-1">
            <h3 id="modal-task-title" className="text-xl font-bold text-gray-800 break-words">
              {task.title}
            </h3>
            <div className="flex items-center gap-2 pt-1">
              <label htmlFor="task-status-select" className="text-xs text-gray-500 font-medium">
                Status:
              </label>
              <select
                id="task-status-select"
                value={task.status}
                onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                className="text-xs bg-white border border-gray-200 rounded px-2 py-1 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluído</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {task.description && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Descrição
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
}
