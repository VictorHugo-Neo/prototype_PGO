import { ArrowLeft, GraduationCap, ShieldCheck } from 'lucide-react';

interface ProfileHeaderProps {
  userType?: string;
  onBack: () => void;
}

export function ProfileHeader({ userType, onBack }: ProfileHeaderProps) {
  const isStudent = userType === 'student';

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-all text-gray-600 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Gerencie suas informações cadastrais, acadêmicas e credenciais de acesso.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isStudent ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <GraduationCap size={14} aria-hidden="true" />
            Aluno / Orientando
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldCheck size={14} aria-hidden="true" />
            Professor Orientador
          </span>
        )}
      </div>
    </header>
  );
}
