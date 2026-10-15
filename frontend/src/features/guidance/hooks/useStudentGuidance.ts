import { useState, useEffect, useCallback } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import type { Task, Comment, Attachment, Meeting, StudentGuidance, TaskStatus } from '../../../types';
import {
  guidanceService,
  taskService,
  commentService,
  userService,
  attachmentService,
  meetingService,
  reportService,
} from '../../../services/api';

export function useStudentGuidance(id?: string) {
  const [guidance, setGuidance] = useState<StudentGuidance | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<number>(0);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskComments, setTaskComments] = useState<Comment[]>([]);
  const [taskAttachments, setTaskAttachments] = useState<Attachment[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [guidanceData, tasksData, meetingsData] = await Promise.all([
        guidanceService.getById(id),
        taskService.getByGuidance(id),
        meetingService.getByGuidance(id),
      ]);
      setGuidance(guidanceData);
      setTasks(tasksData);
      setMeetings(meetingsData);
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
    } catch (error) {
      alert('Erro ao enviar comentário.');
    }
  };

  const handleUploadAttachment = async (taskId: number, file: File) => {
    try {
      const created = await attachmentService.upload(taskId, file);
      setTaskAttachments((prev) => [...prev, created]);
    } catch (error) {
      alert('Erro ao enviar anexo.');
    }
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    time_estimate?: string;
  }) => {
    if (!id) return;
    try {
      await taskService.create({
        ...taskData,
        guidance_id: Number(id),
      });
      await loadData();
    } catch (error) {
      alert('Erro ao criar tarefa.');
    }
  };

  const handleRequestMeeting = async (date: string, topic: string) => {
    if (!id) return;
    try {
      await meetingService.create({
        date,
        topic,
        guidance_id: Number(id),
      });
      const updated = await meetingService.getByGuidance(id);
      setMeetings(updated);
      alert('Solicitação de reunião enviada!');
    } catch (error) {
      alert('Erro ao solicitar reunião.');
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
    } catch (error) {
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
    if (!id) return;
    try {
      await reportService.download(Number(id));
    } catch (error) {
      alert('Erro ao baixar relatório em PDF.');
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
    } catch (error) {
      alert('Erro ao salvar avatar.');
    }
  };

  return {
    guidance,
    tasks,
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
    handleTaskClick,
    handleStatusChange,
    handleDragEnd,
    handleAddComment,
    handleUploadAttachment,
    handleCreateTask,
    handleRequestMeeting,
    handleUpdateMeetingStatus,
    handleUpdateDefenseDate,
    handleDownloadReport,
    handleFileChange,
    handleSaveCrop,
  };
}
