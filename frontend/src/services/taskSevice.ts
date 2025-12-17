import { api } from './api'

export interface Task {
    id: number;
    title: string;
    status: 'pending' | "completed";
    order: number;
}

export const getTasks = async (guidanceId: number): Promise<Task[]> => {
    const response = await api.get(`/guidances/${guidanceId}/tasks`);
    return response.data;
}