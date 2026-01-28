import axios from "axios";


// conect backend
export const api = axios.create({
    baseURL: 'http://localhost:8000'
})

// conect IA
export const iaService = axios.create({
    baseURL: "http://localhost:8000"
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pgo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config
});

interface LoginResponse{
  acess_token: string
  token_type: string
}
interface RegisterData{
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
    const response = await api.post('/auth/login', {email,password})

    //token no navegador para usar posteriormente
    if (response.data.acess_token){
      localStorage.setItem('pgo_token',response.data.acess_token)
    }
    return response.data
  },

  register: async(data:RegisterData) => {
    const response = await api.post('/users/', data)
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('pgo_token')
  }
}