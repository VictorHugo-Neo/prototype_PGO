import { useEffect, useState } from 'react';
import type { StudentSummary } from '../services/guidanceService';
import { getDashboardDate } from '../services/guidanceService';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/StatusBadge';

export default function Dashboard() {
    const [student, setStudent] = useState<StudentSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardDate(1)
            .then(date => setStudent(date))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
    return <div className="p-8 text-center">Carregando painel...</div>;
  }
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Painel do Orientador</h1>
                <p className="text-gray-600">Acompanhe o progresso dos seus orientandos</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {student.map((student) => (
                    <div key={student.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">{student.nameStudent}</h3>
                                <p className="text-sm text-gray-500">{student.theme}</p>
                            </div>
                            <StatusBadge status={student.status} />
                        </div>

                        <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Progresso</span>
                                <span className="font-medium text-gray-900">{student.progress}%</span>
                            </div>
                            <ProgressBar progress={student.progress} />
                        </div>

                        <button className="mt-6 w-full text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium py-2 rounded transition-colors text-sm">
                            Ver Detalhes
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}