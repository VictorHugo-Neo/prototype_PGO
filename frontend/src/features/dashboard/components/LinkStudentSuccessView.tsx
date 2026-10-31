import { CheckCircle2, ArrowRight } from 'lucide-react';

export interface CreatedGuidanceSummary {
  id: number;
  theme: string;
  studentName?: string;
  studentEmail: string;
  defenseDate?: string | null;
}

interface LinkStudentSuccessViewProps {
  guidance: CreatedGuidanceSummary;
  onOpenKanban: () => void;
  onClose: () => void;
  onReset: () => void;
}

export function LinkStudentSuccessView({
  guidance,
  onOpenKanban,
  onClose,
  onReset,
}: LinkStudentSuccessViewProps) {
  return (
    <div className="text-center py-4 space-y-5 animate-in fade-in duration-200">
      <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 size={32} />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-gray-800">Orientação Criada com Sucesso!</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          O aluno já está vinculado e o quadro Kanban inicial foi preparado.
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-left space-y-2 text-xs">
        <div>
          <span className="font-semibold text-gray-500">Orientando:</span>
          <p className="font-bold text-gray-800 text-sm">
            {guidance.studentName || guidance.studentEmail}
          </p>
          <p className="text-gray-500 text-[11px]">{guidance.studentEmail}</p>
        </div>
        <div className="pt-2 border-t border-gray-200/60">
          <span className="font-semibold text-gray-500">Tema:</span>
          <p className="text-gray-700 font-medium">{guidance.theme}</p>
        </div>
        {guidance.defenseDate && (
          <div className="pt-2 border-t border-gray-200/60">
            <span className="font-semibold text-gray-500">Data Prevista da Banca:</span>
            <p className="text-gray-700 font-medium">
              {new Date(`${guidance.defenseDate}T12:00:00`).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={onOpenKanban}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          Ir para o Quadro Kanban <ArrowRight size={16} />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors"
        >
          Voltar ao Dashboard
        </button>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-blue-600 hover:underline font-medium block mx-auto pt-1"
        >
          + Vincular outro estudante
        </button>
      </div>
    </div>
  );
}
