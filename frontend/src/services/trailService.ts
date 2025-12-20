

export interface Task {
  id: number;
  title: string;
  description: string;
  time_estimate: string; 
  status: 'pendente' | 'concluido' | 'atrasado';
  order: number;
}


const MOCK_TASKS: Task[] = [
  { id: 1, order: 1, title: "Definir Tema do Projeto", description: "Escolher um problema real para resolver.", time_estimate: "15/03", status: "concluido" },
  { id: 2, order: 2, title: "Escrever Introdução", description: "Mínimo de 3 páginas seguindo ABNT.", time_estimate: "20/12", status: "pendente" },
  { id: 3, order: 3, title: "Criar Protótipo", description: "Desenhar as telas no Figma ou papel.", time_estimate: "30/12", status: "pendente" },
  { id: 4, order: 4, title: "Validação com Usuário", description: "Testar com 5 pessoas.", time_estimate: "10/04", status: "pendente" },
];

export const getStudentTasks = async (studentId: number): Promise<Task[]> => {
  // await api.get(...) 
  await new Promise(resolve => setTimeout(resolve, 400)); // Delay artificial
  return [...MOCK_TASKS];
};

export const toggleTaskStatus = async (taskId: number, currentStatus: string): Promise<string> => {
  return currentStatus === 'concluido' ? 'pendente' : 'concluido';
};