import { api } from './api'

export interface StudentSummary {
    id: number;
    nameStudent: string;
    theme: string;
    progress: number;
    status: 'ativo' | 'atrasado' | 'concluido';
}

export const getDashboardData = async (guidanceId: number): Promise<StudentSummary[]>=> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
        { id: 1, nameStudent: "Pedro", theme: "Ia na educação", progress: 75, status: 'ativo' },
        { id: 2, nameStudent: "Lucas", theme: "Sustentabilidade", progress: 25, status: 'atrasado' },
        { id: 3, nameStudent: "Ana", theme: "Filmes", progress: 100, status: 'concluido' }
    ]
}
