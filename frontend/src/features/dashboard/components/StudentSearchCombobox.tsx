import { useRef } from 'react';
import { Search, Loader2, UserCheck } from 'lucide-react';
import type { AvailableStudent } from '../../../types';

interface StudentSearchComboboxProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isLoading: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: AvailableStudent[];
  highlightedIndex: number;
  onHighlightIndex: (index: number) => void;
  onSelectStudent: (student: AvailableStudent) => void;
  onSelectCustomEmail: () => void;
  isEmailPattern: boolean;
  hasExactStudentMatch: boolean;
}

export function StudentSearchCombobox({
  searchQuery,
  onSearchChange,
  isLoading,
  isOpen,
  onOpenChange,
  candidates,
  highlightedIndex,
  onHighlightIndex,
  onSelectStudent,
  onSelectCustomEmail,
  isEmailPattern,
  hasExactStudentMatch,
}: StudentSearchComboboxProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        onOpenChange(true);
      }
      return;
    }

    const totalItems = candidates.length + (isEmailPattern && !hasExactStudentMatch ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onHighlightIndex((highlightedIndex + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onHighlightIndex(highlightedIndex <= 0 ? totalItems - 1 : highlightedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < candidates.length) {
        onSelectStudent(candidates[highlightedIndex]);
      } else if (isEmailPattern && !hasExactStudentMatch) {
        onSelectCustomEmail();
      }
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          ref={searchInputRef}
          id="student-search-input"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="student-autocomplete-listbox"
          placeholder="Busque por nome ou e-mail institucional..."
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            onOpenChange(true);
            onHighlightIndex(-1);
          }}
          onFocus={() => onOpenChange(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-8 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        {isLoading && (
          <Loader2
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
          />
        )}
      </div>

      {isOpen && (
        <div
          id="student-autocomplete-listbox"
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-50"
        >
          {candidates.length === 0 && !isEmailPattern ? (
            <div className="p-3 text-center text-xs text-gray-500">
              Nenhum aluno encontrado. Digite o e-mail completo para vincular.
            </div>
          ) : (
            candidates.map((candidate, idx) => (
              <button
                key={candidate.id}
                type="button"
                role="option"
                aria-selected={highlightedIndex === idx}
                disabled={candidate.is_already_linked}
                onClick={() => onSelectStudent(candidate)}
                className={`w-full text-left p-2.5 flex items-center justify-between transition-colors ${
                  candidate.is_already_linked
                    ? 'opacity-60 bg-gray-50 cursor-not-allowed'
                    : highlightedIndex === idx
                    ? 'bg-blue-50 text-blue-900'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 font-semibold text-[11px] flex items-center justify-center shrink-0">
                    {candidate.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{candidate.name}</p>
                    <p className="text-[11px] text-gray-500">{candidate.email}</p>
                  </div>
                </div>
                {candidate.is_already_linked ? (
                  <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Já vinculado
                  </span>
                ) : (
                  <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    Disponível
                  </span>
                )}
              </button>
            ))
          )}

          {isEmailPattern && !hasExactStudentMatch && (
            <button
              type="button"
              onClick={onSelectCustomEmail}
              className="w-full text-left p-2.5 hover:bg-blue-50 flex items-center justify-between text-xs text-blue-700 font-medium transition-colors"
            >
              <span>
                Usar e-mail informado: <strong>{searchQuery.trim()}</strong>
              </span>
              <UserCheck size={14} className="text-blue-500" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
