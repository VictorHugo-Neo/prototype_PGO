import { useState, useEffect, useCallback } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import type { Task, Comment, Attachment, Meeting, MeetingUpdatePayload, StudentGuidance, TaskStatus, TaskUpdatePayload, KanbanColumn, KanbanColumnUpdatePayload } from '../../../types';
import {
  guidanceService,
  taskService,
  commentService,
  userService,
  attachmentService,
  meetingService,
  reportService,
  kanbanService,
} from '../../../services/api';

export function useStudentGuidance(id?: string) {
  const [guidance, setGuidance] = useState<StudentGuidance | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<number>(0);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskComments, setTaskComments] = useState<Comment[]>([]);
  const [taskAttachments, setTaskAttachments] = useState<Attachment[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus>('pending');
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [guidanceData, tasksData, meetingsData, columnsData] = await Promise.all([
        guidanceService.getById(id),
        taskService.getByGuidance(id),
        meetingService.getByGuidance(id),
        kanbanService.getColumns(id),
      ]);
      setGuidance(guidanceData);
      setTasks(tasksData);
      setMeetings(meetingsData);
      setColumns(columnsData);
    } catch (error) {
      console.error('Erro ao carregar dados do projeto:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadUser = useCallback(async () => {
    try {
      const user = await userService.getMe();
      setMyUserId(user.id);
    } catch (error) {
      console.error('Erro ao carregar usuário logado:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadUser();
  }, [loadData, loadUser]);

  const handleTaskClick = async (task: Task) => {
    setSelectedTask(task);
    try {
      const [commentsData, attachmentsData] = await Promise.all([
        commentService.getByTask(task.id),
        attachmentService.getByTask(task.id),
      ]);
      setTaskComments(commentsData);
      setTaskAttachments(attachmentsData);
    } catch (error) {
      console.error('Erro ao carregar detalhes da tarefa:', error);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }

    try {
      await taskService.updateStatus(taskId, newStatus);
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      await loadData();
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as TaskStatus;
    const taskId = Number(draggableId);
    await handleStatusChange(taskId, newStatus);
  };

  const handleAddComment = async (taskId: number, content: string) => {
    try {
      const created = await commentService.create(taskId, content);
      setTaskComments((prev) => [...prev, created]);
    } catch {
      alert('Erro ao enviar comentário.');
    }
  };

  const handleUploadAttachment = async (taskId: number, file: File) => {
    try {
      const created = await attachmentService.upload(taskId, file);
      setTaskAttachments((prev) => [...prev, created]);
    } catch {
      alert('Erro ao enviar anexo.');
    }
  };

  const handleOpenCreateTask = (status: TaskStatus = 'pending') => {
    setCreateTaskStatus(status);
    setIsCreateModalOpen(true);
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    time_estimate?: string;
    status?: TaskStatus;
  }) => {
    if (!id) return;
    try {
      const created = await taskService.create({
        ...taskData,
        status: taskData.status || createTaskStatus,
        guidance_id: Number(id),
      });
      setTasks((prev) => [...prev, created]);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      alert('Erro ao criar tarefa.');
      throw error;
    }
  };

  const handleUpdateTask = async (taskId: number, taskData: TaskUpdatePayload) => {
    try {
      const updated = await taskService.update(taskId, taskData);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updated);
      }
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      alert('Erro ao atualizar tarefa.');
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskService.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      alert('Erro ao excluir tarefa.');
      throw error;
    }
  };

  const handleAddColumn = async (title: string, color?: string) => {
    if (!id) return;
    try {
      const created = await kanbanService.createColumn(id, { title, color });
      setColumns((prev) => [...prev, created]);
      return created;
    } catch (error) {
      console.error('Erro ao criar coluna:', error);
      throw error;
    }
  };

  const handleUpdateColumn = async (columnId: number, data: KanbanColumnUpdatePayload) => {
    try {
      const updated = await kanbanService.updateColumn(columnId, data);
      setColumns((prev) => prev.map((c) => (c.id === columnId ? updated : c)));
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error);
      throw error;
    }
  };

  const handleDeleteColumn = async (columnId: number, targetColumnId?: number) => {
    try {
      const columnToDelete = columns.find((c) => c.id === columnId);
      const targetColumn = targetColumnId
        ? columns.find((c) => c.id === targetColumnId)
        : undefined;

      await kanbanService.deleteColumn(columnId, targetColumnId);

      setColumns((prev) => prev.filter((c) => c.id !== columnId));

      if (columnToDelete && targetColumn) {
        setTasks((prev) =>
          prev.map((t) =>
            t.status === columnToDelete.slug
              ? { ...t, status: targetColumn.slug }
              : t
          )
        );
      }
    } catch (error: unknown) {
      console.error('Erro ao excluir coluna:', error);
      throw error;
    }
  };

  const handleReorderColumns = async (newColumnIds: number[]) => {
    if (!id) return;
    try {
      const colMap = new Map(columns.map((c) => [c.id, c]));
      const reordered: KanbanColumn[] = [];
      newColumnIds.forEach((colId, index) => {
        const col = colMap.get(colId);
        if (col) {
          reordered.push({ ...col, order: index });
        }
      });
      setColumns(reordered);

      const updated = await kanbanService.reorderColumns(id, newColumnIds);
      setColumns(updated);
      return updated;
    } catch (error) {
      console.error('Erro ao reordenar colunas:', error);
      await loadData();
      throw error;
    }
  };

  const handleMoveColumn = async (columnId: number, direction: 'left' | 'right') => {
    const currentIndex = columns.findIndex((c) => c.id === columnId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const newColumns = [...columns];
    const [moved] = newColumns.splice(currentIndex, 1);
    newColumns.splice(targetIndex, 0, moved);

    const newIds = newColumns.map((c) => c.id);
    return handleReorderColumns(newIds);
  };

  const handleRequestMeeting = async (date: string, topic: string) => {
    if (!id) return;
    try {
      const created = await meetingService.create({
        date,
        topic,
        guidance_id: Number(id),
      });
      setMeetings((prev) =>
        [...prev, created].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      );
      alert('Solicitação de reunião enviada!');
    } catch {
      alert('Erro ao solicitar reunião.');
    }
  };

  const handleUpdateMeeting = async (
    meetingId: number,
    data: MeetingUpdatePayload
  ) => {
    try {
      const updated = await meetingService.update(meetingId, data);
      setMeetings((prev) =>
        prev
          .map((m) => (m.id === meetingId ? updated : m))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      );
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar reunião:', error);
      alert('Erro ao atualizar reunião.');
      throw error;
    }
  };

  const handleDeleteMeeting = async (meetingId: number) => {
    try {
      await meetingService.delete(meetingId);
      setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    } catch (error) {
      console.error('Erro ao excluir reunião:', error);
      alert('Erro ao excluir reunião.');
      throw error;
    }
  };

  const handleUpdateMeetingStatus = async (
    meetingId: number,
    status: 'confirmed' | 'rejected'
  ) => {
    try {
      await meetingService.updateStatus(meetingId, status);
      setMeetings((prev) =>
        prev.map((m) => (m.id === meetingId ? { ...m, status } : m))
      );
    } catch {
      alert('Erro ao atualizar status da reunião.');
    }
  };

  const handleUpdateDefenseDate = async (defenseDate: string) => {
    if (!id || !guidance) return;
    try {
      await guidanceService.update(Number(id), { defense_date: defenseDate });
      setGuidance({ ...guidance, defense_date: defenseDate });
    } catch (error) {
      console.error('Erro ao atualizar data da banca:', error);
    }
  };

  const handleDownloadReport = async () => {
    if (!id || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await reportService.download(Number(id));
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      alert('Não foi possível gerar o relatório em PDF. Tente novamente.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePreviewReport = async () => {
    if (!id || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await reportService.preview(Number(id));
    } catch (error) {
      console.error('Erro ao visualizar relatório:', error);
      alert('Não foi possível carregar a pré-visualização do relatório.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null);
        setIsCropModalOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSaveCrop = async (croppedBlob: Blob) => {
    try {
      const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
      await userService.uploadAvatar(file);
      setImgError(false);
      await loadData();
      alert('Foto de perfil atualizada com sucesso!');
    } catch {
      alert('Erro ao salvar avatar.');
    }
  };

  return {
    guidance,
    tasks,
    columns,
    meetings,
    loading,
    myUserId,
    selectedTask,
    taskComments,
    taskAttachments,
    isCreateModalOpen,
    isMeetingModalOpen,
    imageSrc,
    isCropModalOpen,
    imgError,
    setSelectedTask,
    setIsCreateModalOpen,
    setIsMeetingModalOpen,
    setIsCropModalOpen,
    setImageSrc,
    setImgError,
    createTaskStatus,
    handleOpenCreateTask,
    handleTaskClick,
    handleStatusChange,
    handleDragEnd,
    handleAddComment,
    handleUploadAttachment,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleAddColumn,
    handleUpdateColumn,
    handleDeleteColumn,
    handleReorderColumns,
    handleMoveColumn,
    handleRequestMeeting,
    handleUpdateMeeting,
    handleDeleteMeeting,
    handleUpdateMeetingStatus,
    handleUpdateDefenseDate,
    handleDownloadReport,
    handlePreviewReport,
    isGeneratingPdf,
    handleFileChange,
    handleSaveCrop,
  };
}
