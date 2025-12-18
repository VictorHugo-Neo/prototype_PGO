interface StatusBadgeProps {
    status: 'ativo' | 'atrasado' | 'concluido';
}

export function StatusBadge({status}: StatusBadgeProps){
    const colors = {
        ativo: "bg-green-100 text-green-800",
        atrasado: 'bg-red-100 text-red-800',
        concluido: 'bg-blue-100 text-blue-800'
    };
    return(
        <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded ${colors[status]}`}>
            {status.toUpperCase()}
        </span>
    )
}