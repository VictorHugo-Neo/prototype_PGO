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
  time_estimate?: string; // Data de entrega da tarefa
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
  defense_date?: string; // <--- O CAMPO QUE FALTAVA (Interrogação pois pode ser nulo)
  student: {
    id: number;
    name: string;
    email: string;
  }
}

// --- 3. Serviços (Funções que chamam o Backend) ---

export const sendMessageToAI = async (message: string): Promise<string> => {
  try {
    const response = await api.post('/chat/', { 
      message: message,
      student_id: 1 // Idealmente pegar do contexto do usuário
    });
    return response.data.response;
  } catch (error) {
    console.error("Erro na IA:", error);
    return "Desculpe, não consegui conectar ao servidor da IA.";
  }
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Agora enviamos como Form Data (Padrão OAuth2)
    const formData = new URLSearchParams();
    formData.append('username', email); // O backend espera o campo 'username' com o email
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
  // Lista todos os alunos (para o Dashboard do Professor)
  getMyStudents: async (): Promise<StudentGuidance[]> => {
    const response = await api.get('/guidances/my-students');
    return response.data;
  },
  
  // Pega detalhes de uma orientação específica
  getById: async (id: string) => {
    const response = await api.get(`/guidances/${id}`);
    return response.data;
  },

  // Busca a orientação do próprio aluno logado
  getStudentGuidance: async () => {
    const response = await api.get('/guidances/me');
    return response.data;
  },
  
  // Cria vínculo com aluno via email
  linkStudent: async (email: string, theme: string) => {
    const response = await api.post('/guidances/link', { 
      student_email: email, 
      theme: theme 
    });
    return response.data;
  },

  // Atualiza dados da orientação (Ex: Data da Banca)
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