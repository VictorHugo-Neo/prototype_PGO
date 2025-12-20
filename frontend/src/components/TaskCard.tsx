interface TaskCardProps {
    id: number;
    title: string;
    description?: string;
    time_estimate?: string;
    status: 'pendente' | 'concluido' | 'atrasado';
    onToggle: (id: number) => void;
}

export function TaskCard({ id, title, description, time_estimate, status, onToggle }: TaskCardProps) {
    const isCompleted = status === 'concluido'
    return (
        <div
            onClick={() => onToggle(id)}
            className={`
                group flex items-start p-4 mp-3 bg-white rouded-lg border cursor-pointer transition-all duration-200
                ${isCompleted ? 'border-gray-100 bg-gray-50' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'}

            `}
            role='checkbox'
            aria-checked={isCompleted}
            data-testid={`task-${id}`}
        >
            <div className={`mt-1 mr-4 shrink-0 ${isCompleted ? 'text-green-500' : 'text-gray-300 group-hover:text-blue-500'}`}>
                {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /></svg>
                )}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className={`font-medium text-lg ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {title}
                    </h4>
                    {time_estimate && !isCompleted && (
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            {time_estimate}
                        </span>
                    )}
                </div>

                {description && (
                    <p className={`text-sm mt-1 ${isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}