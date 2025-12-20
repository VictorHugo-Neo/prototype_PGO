import { api } from './api'

export interface StudentSummary {
    id: number;
    nameStudent: string;
    theme: string;
    progress: number;
    status: 'ativo' | 'atrasado' | 'concluido';
}

export const getDashboardDate = async (guidanceId: number): Promise<StudentSummary[]>=> {
    // depois montar um endpoint específico
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Use guidanceId in the actual API call
    return [
        { id: 1, nameStudent: "Pedro", theme: "Ia na educação", progress: 75, status: 'ativo' },
        { id: 2, nameStudent: "Lucas", theme: "Sustentabilidade", progress: 25, status: 'atrasado' },
        { id: 3, nameStudent: "Ana", theme: "Filmes", progress: 100, status: 'concluido' }
    ]
}
