import axios from 'axios';
import type {
  LoginResponse,
  RegisterPayload,
  User,
  Task,
  TaskStatus,
  TaskCreatePayload,
  TaskUpdatePayload,
  Comment,
  StudentGuidance,
  Attachment,
  Notification,
  Meeting,
  MeetingStatus,
  DashboardStats,
  KanbanColumn,
  KanbanColumnCreatePayload,
  KanbanColumnUpdatePayload,
} from '../types';

export * from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pgo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pgo_token');
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (response.data.access_token) {
      localStorage.setItem('pgo_token', response.data.access_token);
    }
    return response.data;
  },

  register: async (data: RegisterPayload): Promise<User> => {
    const response = await api.post<User>('/users/', {
      email: data.email,
      password: data.password,
      name: data.name,
      type: data.type,
    });
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('pgo_token');
  },
};

export const userService = {
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  updateMe: async (data: { name?: string; email?: string; password?: string }): Promise<User> => {
    const response = await api.put<User>('/users/me', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<User>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const guidanceService = {
  getMyStudents: async (): Promise<StudentGuidance[]> => {
    const response = await api.get<StudentGuidance[]>('/guidances/my-students');
    return response.data;
  },

  getById: async (id: string | number): Promise<StudentGuidance> => {
    const response = await api.get<StudentGuidance>(`/guidances/${id}`);
    return response.data;
  },

  getStudentGuidance: async (): Promise<StudentGuidance> => {
    const response = await api.get<StudentGuidance>('/guidances/me');
    return response.data;
  },

  linkStudent: async (email: string, theme: string): Promise<StudentGuidance> => {
    const response = await api.post<StudentGuidance>('/guidances/link', {
      student_email: email,
      theme,
    });
    return response.data;
  },

  update: async (
    id: number,
    data: { defense_date?: string; theme?: string }
  ): Promise<StudentGuidance> => {
    const response = await api.patch<StudentGuidance>(`/guidances/${id}`, data);
    return response.data;
  },
};

export const taskService = {
  getByGuidance: async (guidanceId: string | number): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/tasks/guidance/${guidanceId}`);
    return response.data;
  },

  getById: async (taskId: number): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${taskId}`);
    return response.data;
  },

  create: async (data: TaskCreatePayload): Promise<Task> => {
    const response = await api.post<Task>('/tasks/', data);
    return response.data;
  },

  update: async (taskId: number, data: TaskUpdatePayload): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${taskId}`, data);
    return response.data;
  },

  updateStatus: async (taskId: number, status: TaskStatus): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${taskId}/status`, { status });
    return response.data;
  },

  delete: async (taskId: number): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },
};

export const commentService = {
  getByTask: async (taskId: number): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/comments/task/${taskId}`);
    return response.data;
  },

  create: async (taskId: number, content: string): Promise<Comment> => {
    const response = await api.post<Comment>('/comments/', { task_id: taskId, content });
    return response.data;
  },
};

export const attachmentService = {
  upload: async (taskId: number, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<Attachment>(`/attachments/task/${taskId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getByTask: async (taskId: number): Promise<Attachment[]> => {
    const response = await api.get<Attachment[]>(`/attachments/task/${taskId}`);
    return response.data;
  },
};

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/notifications/');
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },
};

export const meetingService = {
  create: async (data: { date: string; topic: string; guidance_id: number }): Promise<Meeting> => {
    const response = await api.post<Meeting>('/meetings/', data);
    return response.data;
  },

  getByGuidance: async (guidanceId: string | number): Promise<Meeting[]> => {
    const response = await api.get<Meeting[]>(`/meetings/guidance/${guidanceId}`);
    return response.data;
  },

  updateStatus: async (id: number, status: MeetingStatus): Promise<Meeting> => {
    const response = await api.patch<Meeting>(`/meetings/${id}/status`, { status });
    return response.data;
  },
};

export const reportService = {
  download: async (guidanceId: number): Promise<void> => {
    const response = await api.get(`/report/${guidanceId}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const contentDisposition = response.headers['content-disposition'];
    let fileName = `relatorio_orientacao_${guidanceId}.pdf`;
    if (contentDisposition) {
      const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
      if (utf8Match && utf8Match[1]) {
        try {
          fileName = decodeURIComponent(utf8Match[1]);
        } catch {
          fileName = utf8Match[1];
        }
      } else {
        const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
        if (asciiMatch && asciiMatch[1]) {
          fileName = asciiMatch[1];
        }
      }
    }

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  preview: async (guidanceId: number): Promise<void> => {
    const response = await api.get(`/report/${guidanceId}?preview=true`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Delay de 15s para garantir que o visualizador nativo do navegador carregue o blob antes do revoke
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 15000);
  },
};

export const statsService = {
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/stats/dashboard');
    return response.data;
  },
};

export const kanbanService = {
  getColumns: async (guidanceId: number | string): Promise<KanbanColumn[]> => {
    const response = await api.get<KanbanColumn[]>(`/kanban/guidance/${guidanceId}/columns`);
    return response.data;
  },

  createColumn: async (
    guidanceId: number | string,
    data: KanbanColumnCreatePayload
  ): Promise<KanbanColumn> => {
    const response = await api.post<KanbanColumn>(`/kanban/guidance/${guidanceId}/columns`, data);
    return response.data;
  },

  updateColumn: async (
    columnId: number,
    data: KanbanColumnUpdatePayload
  ): Promise<KanbanColumn> => {
    const response = await api.put<KanbanColumn>(`/kanban/columns/${columnId}`, data);
    return response.data;
  },

  reorderColumns: async (
    guidanceId: number | string,
    columnIds: number[]
  ): Promise<KanbanColumn[]> => {
    const response = await api.put<KanbanColumn[]>(`/kanban/guidance/${guidanceId}/columns/reorder`, {
      column_ids: columnIds,
    });
    return response.data;
  },

  deleteColumn: async (columnId: number, targetColumnId?: number): Promise<void> => {
    const params = targetColumnId ? { target_column_id: targetColumnId } : undefined;
    await api.delete(`/kanban/columns/${columnId}`, { params });
  },
};