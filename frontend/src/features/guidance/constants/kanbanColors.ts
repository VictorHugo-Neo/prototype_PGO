export interface KanbanColorOption {
  label: string;
  value: string;
  border: string;
  dot: string;
}

export const KANBAN_COLOR_OPTIONS: KanbanColorOption[] = [
  { label: 'Roxo', value: 'bg-purple-50', border: 'border-purple-300', dot: 'bg-purple-500' },
  { label: 'Azul', value: 'bg-blue-50', border: 'border-blue-300', dot: 'bg-blue-500' },
  { label: 'Verde', value: 'bg-emerald-50', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  { label: 'Âmbar', value: 'bg-amber-50', border: 'border-amber-300', dot: 'bg-amber-500' },
  { label: 'Rosa', value: 'bg-rose-50', border: 'border-rose-300', dot: 'bg-rose-500' },
  { label: 'Índigo', value: 'bg-indigo-50', border: 'border-indigo-300', dot: 'bg-indigo-500' },
  { label: 'Ciano', value: 'bg-cyan-50', border: 'border-cyan-300', dot: 'bg-cyan-500' },
  { label: 'Cinza', value: 'bg-gray-100', border: 'border-gray-300', dot: 'bg-gray-500' },
];
