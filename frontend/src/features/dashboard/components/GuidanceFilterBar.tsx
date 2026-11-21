import { Search, X, LayoutGrid, List, ArrowUpDown } from 'lucide-react';

export type GuidanceFilterType = 'all' | 'in_progress' | 'completed' | 'pending_meetings';
export type GuidanceSortOption = 'name' | 'progress_desc' | 'progress_asc' | 'defense_date';

interface GuidanceFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: GuidanceFilterType;
  onFilterChange: (filter: GuidanceFilterType) => void;
  counts?: {
    all: number;
    in_progress: number;
    completed: number;
    pending_meetings: number;
  };
  sortBy?: GuidanceSortOption;
  onSortByChange?: (sort: GuidanceSortOption) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export function GuidanceFilterBar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  counts,
  sortBy = 'name',
  onSortByChange,
  viewMode = 'grid',
  onViewModeChange,
}: GuidanceFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
        <div className="relative w-full sm:w-60">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar aluno ou tema..."
            className="pl-8 pr-7 py-2 bg-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder-gray-400 w-full shadow-xs transition-all"
            aria-label="Buscar aluno ou tema"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
              aria-label="Limpar busca"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Filtrar orientações por status"
          className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-xs text-xs overflow-x-auto"
        >
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'
            }`}
          >
            <span>Todos</span>
            {counts && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeFilter === 'all' ? 'bg-blue-200/60 text-blue-800' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts.all}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('in_progress')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'in_progress'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'
            }`}
          >
            <span>Em Andamento</span>
            {counts && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeFilter === 'in_progress' ? 'bg-blue-200/60 text-blue-800' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts.in_progress}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'completed'
                ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'
            }`}
          >
            <span>Concluídos</span>
            {counts && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeFilter === 'completed' ? 'bg-emerald-200/60 text-emerald-800' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts.completed}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('pending_meetings')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'pending_meetings'
                ? 'bg-amber-50 text-amber-700 font-semibold shadow-xs'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'
            }`}
          >
            <span>Reuniões</span>
            {counts && counts.pending_meetings > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold bg-amber-200/70 text-amber-800">
                {counts.pending_meetings}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {onSortByChange && (
          <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl shadow-xs text-xs text-gray-600">
            <ArrowUpDown size={13} className="text-gray-400 shrink-0" />
            <label htmlFor="guidance-sort-select" className="sr-only">
              Ordenar orientações por
            </label>
            <select
              id="guidance-sort-select"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as GuidanceSortOption)}
              className="bg-transparent text-gray-700 text-xs font-medium outline-none cursor-pointer pr-1"
            >
              <option value="name">Nome (A-Z)</option>
              <option value="progress_desc">Maior Progresso</option>
              <option value="progress_asc">Menor Progresso</option>
              <option value="defense_date">Próxima Banca</option>
            </select>
          </div>
        )}

        {onViewModeChange && (
          <div
            role="group"
            aria-label="Modo de visualização"
            className="flex items-center bg-white p-1 rounded-xl shadow-xs text-xs"
          >
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-gray-100 text-blue-600 font-semibold shadow-xs'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
              title="Visualização em Grade (Cards)"
              aria-label="Visualização em Grade"
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-gray-100 text-blue-600 font-semibold shadow-xs'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
              title="Visualização em Lista Compacta"
              aria-label="Visualização em Lista Compacta"
              aria-pressed={viewMode === 'list'}
            >
              <List size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
