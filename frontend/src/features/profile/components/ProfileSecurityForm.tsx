import { useState } from 'react';
import { Lock, Loader2, KeyRound } from 'lucide-react';

interface ProfileSecurityFormProps {
  onSubmit: (password: string) => Promise<void>;
  isSaving: boolean;
}

export function ProfileSecurityForm({ onSubmit, isSaving }: ProfileSecurityFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    await onSubmit(password);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-2xl border border-gray-100 shadow-2xs space-y-4"
    >
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-800">Segurança & Acesso</h2>
        <p className="text-[11px] text-gray-500">Altere sua senha de autenticação a qualquer momento.</p>
      </div>

      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="profile-pwd" className="block text-xs font-semibold text-gray-700 mb-1">
          Nova Senha
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={17} aria-hidden="true" />
          <input
            id="profile-pwd"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Mínimo 6 caracteres"
          />
        </div>
      </div>

      <div>
        <label htmlFor="profile-confirm-pwd" className="block text-xs font-semibold text-gray-700 mb-1">
          Confirmar Nova Senha
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={17} aria-hidden="true" />
          <input
            id="profile-confirm-pwd"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Repita a nova senha"
          />
        </div>
      </div>

      <div className="flex justify-end pt-3">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
          <span>{isSaving ? 'Atualizando...' : 'Atualizar Senha'}</span>
        </button>
      </div>
    </form>
  );
}
