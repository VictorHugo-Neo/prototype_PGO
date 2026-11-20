import { Search, X } from 'lucide-react';

export type GuidanceFilterType = 'all' | 'in_progress' | 'completed' | 'pending_meetings';

interface GuidanceFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: GuidanceFilterType;
  onFilterChange: (filter: GuidanceFilterType) => void;
}

export function GuidanceFilterBar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}: GuidanceFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar aluno ou tema..."
          className="pl-8 pr-7 py-1.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700 w-full sm:w-56 shadow-2xs transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Limpar busca"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs text-xs">
        <button
          type="button"
          onClick={() => onFilterChange('all')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'
          }`}
        >
          Todos
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('in_progress')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            activeFilter === 'in_progress'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'
          }`}
        >
          Em Andamento
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('completed')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            activeFilter === 'completed'
              ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-2xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'
          }`}
        >
          Concluídos
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('pending_meetings')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            activeFilter === 'pending_meetings'
              ? 'bg-amber-50 text-amber-700 font-semibold shadow-2xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'
          }`}
        >
          Reuniões
        </button>
      </div>
    </div>
  );
}
