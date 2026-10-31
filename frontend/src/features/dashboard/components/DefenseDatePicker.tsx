import { Calendar } from 'lucide-react';

interface DefenseDatePickerProps {
  defenseDate: string;
  onChangeDate: (date: string) => void;
}

export function DefenseDatePicker({ defenseDate, onChangeDate }: DefenseDatePickerProps) {
  const handleSetPresetDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onChangeDate(`${year}-${month}-${day}`);
  };

  const handleSetEndOfSemester = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const target = month < 6 ? `${year}-06-30` : `${year}-12-15`;
    onChangeDate(target);
  };

  return (
    <div className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl space-y-2">
      <div className="flex justify-between items-center">
        <label
          htmlFor="defense-target-date"
          className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
        >
          <Calendar size={14} className="text-blue-600" />
          Data Prevista da Banca (Opcional)
        </label>
        {defenseDate && (
          <button
            type="button"
            onClick={() => onChangeDate('')}
            className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
          >
            Limpar data
          </button>
        )}
      </div>

      <input
        id="defense-target-date"
        type="date"
        min={new Date().toISOString().split('T')[0]}
        value={defenseDate}
        onChange={(e) => onChangeDate(e.target.value)}
        className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
      />

      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={() => handleSetPresetDate(90)}
          className="px-2 py-0.5 bg-white border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-600 rounded text-[11px] transition-colors"
        >
          +3 meses
        </button>
        <button
          type="button"
          onClick={() => handleSetPresetDate(180)}
          className="px-2 py-0.5 bg-white border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-600 rounded text-[11px] transition-colors"
        >
          +6 meses
        </button>
        <button
          type="button"
          onClick={handleSetEndOfSemester}
          className="px-2 py-0.5 bg-white border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-600 rounded text-[11px] transition-colors"
        >
          Fim do Semestre
        </button>
      </div>
    </div>
  );
}
