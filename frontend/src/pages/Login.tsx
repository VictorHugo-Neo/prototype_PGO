import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { authService, userService } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      await authService.login(email.trim(), password);
      const user = await userService.getMe();

      if (user.type === 'advisor') {
        navigate('/dashboard');
      } else {
        navigate('/trail');
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const msg = axiosError.response?.data?.detail || 'E-mail ou senha incorretos.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">PGO</h1>
          <p className="text-sm text-gray-500 mt-1">
            Plataforma de Gestão de Orientação de TCC
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-xs text-center font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-gray-700 mb-1">
              E-mail Institucional
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="seu.email@instituicao.edu.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-100 text-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <footer className="text-center mt-6 text-gray-600 text-xs">
          Ainda não tem conta?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Criar conta
          </Link>
        </footer>
      </div>
    </div>
  );
}