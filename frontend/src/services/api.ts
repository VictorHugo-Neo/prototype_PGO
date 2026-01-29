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

export const guidanceService = {
  // Busca lista de alunos do professor logado
  getMyStudents: async (): Promise<StudentGuidance[]> => {
    const response = await api.get('/guidances/my-students');
    return response.data;
  },

  // Cria um novo vínculo (para teste rápido)
  linkStudent: async (theme: string, studentEmail: string) => {
    console.log("Funcionalidade de vincular pendente de UI");
  }
};