import axios from "axios";

// conect backend
export const api = axios.create({
  baseURL: 'http://localhost:8000'
})

// conect IA (Interceptador)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pgo_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- CORREÇÃO AQUI: Interface com dois 's' ---
interface LoginResponse {
  access_token: string  // <--- CORRIGIDO (era acess_token)
  token_type: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  type: 'student' | 'advisor'
}

export const sendMessageToAI = async (message: string): Promise<string> => {
  try {
    const response = await api.post('/chat/', { 
      message: message,
      student_id: 1 
    });
    return response.data.response;
  } catch (error) {
    console.error("Erro na IA:", error);
    return "Desculpe, não consegui conectar ao servidor da IA no momento.";
  }
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', {email, password})

    // --- CORREÇÃO AQUI: Verificando a chave correta ---
    // O backend envia 'access_token', não 'acess_token'
    if (response.data.access_token) { 
      localStorage.setItem('pgo_token', response.data.access_token)
    }
    
    return response.data
  },

  register: async(data: RegisterData) => {
    const response = await api.post('/users/', data)
    return response.data;
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

export interface StudentGuidance {
  id: number;
  theme: string;
  created_at: string;
  student: {
    id: number;
    name: string;
    email: string;
  }
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'late';
  guidance_id: number;
  time_estimate?: string;
}

export const guidanceService = {
  getMyStudents: async (): Promise<StudentGuidance[]> => {
    const response = await api.get('/guidances/my-students');
    return response.data;
  },
  // Pegar detalhes de um aluno específico
  getById: async (id: string) => {
    const response = await api.get(`/guidances/${id}`);
    return response.data;
  },
  linkStudent: async (email: string, theme: string) => {
    const response = await api.post('/guidances/link', { 
      student_email: email, 
      theme: theme 
    });
    return response.data;
  },
  getStudentGuidance: async () => {
    const response = await api.get('/guidances/me');
    return response.data;
  }
};

export const taskService = {
  // Listar tarefas dessa orientação
  getByGuidance: async (guidanceId: string) => {
    const response = await api.get(`/tasks/guidance/${guidanceId}`);
    return response.data;
  },
  // Criar tarefa
  create: async (data: { title: string; description: string; guidance_id: number; time_estimate?: string }) => {
    const response = await api.post('/tasks/', data);
    return response.data;
  },
  // Atualizar Status
  updateStatus: async (taskId: number, status: string) => {
    const response = await api.patch(`/tasks/${taskId}/status`, { status });
    return response.data;
  }
};
export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_name: string;
  user_id: number;
}

// ... serviços
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