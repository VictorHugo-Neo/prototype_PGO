import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, GraduationCap, School, CheckCircle, Loader2 } from 'lucide-react';
import type { UserType } from '../types';
import { authService } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserType>('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        type: role,
      });

      setSuccess('Cadastro realizado com sucesso! Redirecionando para login...');
      setTimeout(() => navigate('/'), 1200);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const msg = axiosError.response?.data?.detail || 'Erro ao realizar cadastro.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <header className="p-8 pb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Crie sua conta</h1>
          <p className="text-xs text-gray-500 mt-1">
            Selecione o seu perfil e preencha os dados de acesso
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mx-8 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium text-center"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mx-8 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-medium text-center"
          >
            {success}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 px-8 pt-4 pb-2">
          <button
            type="button"
            onClick={() => setRole('student')}
            aria-pressed={role === 'student'}
            className={`border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all relative ${
              role === 'student'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-200 text-gray-600'
            }`}
          >
            <GraduationCap size={24} />
            <span className="font-semibold text-xs">Sou Aluno</span>
            {role === 'student' && (
              <CheckCircle size={14} className="absolute top-2 right-2 text-blue-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setRole('advisor')}
            aria-pressed={role === 'advisor'}
            className={`border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all relative ${
              role === 'advisor'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-200 text-gray-600'
            }`}
          >
            <School size={24} />
            <span className="font-semibold text-xs">Sou Orientador</span>
            {role === 'advisor' && (
              <CheckCircle size={14} className="absolute top-2 right-2 text-blue-600" />
            )}
          </button>
        </div>

        <form onSubmit={handleRegister} className="p-8 pt-4 space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-xs font-semibold text-gray-600 mb-1">
              Nome Completo *
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                id="reg-name"
                name="name"
                type="text"
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold text-gray-600 mb-1">
              E-mail *
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="seu.email@instituicao.edu.br"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold text-gray-600 mb-1">
              Senha *
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-gray-600 mb-1">
              Confirmar Senha *
            </label>
            <input
              id="reg-confirm-password"
              name="confirmPassword"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Repita a senha"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md text-sm mt-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>

        <footer className="text-center pb-6 text-gray-500 text-xs">
          Já tem uma conta?{' '}
          <Link to="/" className="text-blue-600 font-semibold hover:underline">
            Fazer login
          </Link>
        </footer>
      </div>
    </div>
  );
}