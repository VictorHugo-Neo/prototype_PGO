import axios from "axios";

// --- 1. Configuração da API e Interceptador ---
export const api = axios.create({
  baseURL: 'http://localhost:8000'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pgo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- 2. Interfaces (Tipos de Dados) ---

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  type: 'student' | 'advisor'
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'late';
  guidance_id: number;
  time_estimate?: string;
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_name: string;
  user_id: number;
}

export interface StudentGuidance {
  id: number;
  theme: string;
  created_at: string;
  defense_date?: string;
  student: {
    id: number;
    name: string;
    email: string;
  }
}

// Interface Nova
export interface Attachment {
  id: number;
  filename: string;
  file_path: string;
  created_at: string;
  task_id: number;
}

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

export interface Meeting {
  id: number;
  date: string;
  topic: string;
  status: 'pending' | 'confirmed' | 'rejected';
  guidance_id: number;
}

// --- 3. Serviços (Funções que chamam o Backend) ---

export const sendMessageToAI = async (message: string): Promise<string> => {
  try {
    const response = await api.post('/chat/', { 
      message: message,
      student_id: 1 
    });
    return response.data.response;
  } catch (error) {
    console.error("Erro na IA:", error);
    return "Desculpe, não consegui conectar ao servidor da IA.";
  }
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Envia como Form Data (Correção para Swagger/OAuth2)
    const formData = new URLSearchParams();
    formData.append('username', email); 
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    if (response.data.access_token) { 
      localStorage.setItem('pgo_token', response.data.access_token)
    }
    return response.data
  },
  
  logout: () => {
    localStorage.removeItem('pgo_token')
  }
}

export const userService = {
  getMe: async () => {
    const response = await api.get('/users/me')
    return response.data
  },

  updateMe: async (data: {name?: string; email?: string; password?: string}) => {
    const response = await api.put('/users/me', data)
    return response.data
  }
}

export const guidanceService = {
  getMyStudents: async (): Promise<StudentGuidance[]> => {
    const response = await api.get('/guidances/my-students');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/guidances/${id}`);
    return response.data;
  },

  getStudentGuidance: async () => {
    const response = await api.get('/guidances/me');
    return response.data;
  },
  
  linkStudent: async (email: string, theme: string) => {
    const response = await api.post('/guidances/link', { 
      student_email: email, 
      theme: theme 
    });
    return response.data;
  },

  update: async (id: number, data: { defense_date?: string, theme?: string }) => {
    const response = await api.patch(`/guidances/${id}`, data);
    return response.data;
  }
};

export const taskService = {
  getByGuidance: async (guidanceId: string) => {
    const response = await api.get(`/tasks/guidance/${guidanceId}`);
    return response.data;
  },
  create: async (data: { title: string; description: string; guidance_id: number; time_estimate?: string }) => {
    const response = await api.post('/tasks/', data);
    return response.data;
  },
  updateStatus: async (taskId: number, status: string) => {
    const response = await api.patch(`/tasks/${taskId}/status`, { status });
    return response.data;
  }
};

export const commentService = {
  getByTask: async (taskId: number): Promise<Comment[]> => {
    const response = await api.get(`/comments/task/${taskId}`);
    return response.data;
  },
  create: async (taskId: number, content: string) => {
    const response = await api.post('/comments/', { task_id: taskId, content });
    return response.data;
  }
};

// Serviço Novo
export const attachmentService = {
  upload: async (taskId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file); 
    
    const response = await api.post(`/attachments/task/${taskId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getByTask: async (taskId: number): Promise<Attachment[]> => {
    const response = await api.get(`/attachments/task/${taskId}`);
    return response.data;
  }
};
export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/');
    return response.data;
  },
  markAsRead: async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
  }
};

export const meetingService = {
  create: async (data: { date: string; topic: string; guidance_id: number }) => {
    const response = await api.post('/meetings/', data);
    return response.data;
  },
  
  getByGuidance: async (guidanceId: string): Promise<Meeting[]> => {
    const response = await api.get(`/meetings/guidance/${guidanceId}`);
    return response.data;
  },

  updateStatus: async (id: number, status: 'confirmed' | 'rejected') => {
    const response = await api.patch(`/meetings/${id}/status`, { status });
    return response.data;
  }
};