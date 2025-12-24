import axios from "axios";


// conect backend
export const api = axios.create({
    baseURL: 'http://localhost:8000'
})

// conect IA
export const iaService = axios.create({
    baseURL: "http://localhost:8000"
})


export const sendMessageToAI = async (message: string): Promise<string> => {
  try {
    const response = await api.post('/chat/', { 
      message: message,
      student_id: 1 
    });
    return response.data.resposta;
  } catch (error) {
    console.error("Erro na IA:", error);
    return "Desculpe, não consegui conectar ao servidor da IA no momento.";
  }
}