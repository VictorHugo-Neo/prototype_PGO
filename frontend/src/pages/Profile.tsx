import { useEffect, useState, useCallback } from 'react';
import { User as UserIcon, Mail, Lock, ArrowLeft, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const loadProfile = useCallback(async () => {
    try {
      const user = await userService.getMe();
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    } catch (error) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'As novas senhas não coincidem.' });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setStatusMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    setSaving(true);
    try {
      const payload: { name?: string; email?: string; password?: string } = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      await userService.updateMe(payload);
      setStatusMessage({ type: 'success', text: 'Dados cadastrais atualizados com sucesso!' });
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Erro ao atualizar dados.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando perfil..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-start">
      <div className="max-w-2xl w-full">
        <header className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {statusMessage && (
            <div
              role={statusMessage.type === 'error' ? 'alert' : 'status'}
              className={`p-4 rounded-xl text-xs font-medium mb-6 flex items-center gap-2 ${
                statusMessage.type === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
            >
              {statusMessage.type === 'success' && <Check size={16} />}
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="profile-name" className="block text-xs font-semibold text-gray-600 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  id="profile-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-xs font-semibold text-gray-600 mb-1">
                E-mail Institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  id="profile-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h2 className="text-sm font-bold text-gray-700">Alterar Senha (Opcional)</h2>

              <div>
                <label htmlFor="profile-pwd" className="block text-xs font-semibold text-gray-600 mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    id="profile-pwd"
                    type="password"
                    placeholder="Deixe em branco para manter a atual"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile-confirm-pwd" className="block text-xs font-semibold text-gray-600 mb-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    id="profile-confirm-pwd"
                    type="password"
                    placeholder="Repita a nova senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-all shadow-sm flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}