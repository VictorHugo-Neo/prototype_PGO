import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, GraduationCap, School } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação de login (Substituir pela chamada à API real depois)
    setTimeout(() => {
      setIsLoading(false);
      // Redireciona baseado no perfil
      if (role === 'student') navigate('/trilha');
      else navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-blue-600 p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo ao PGO</h2>
          <p className="text-blue-100">Plataforma de Gestão de Orientação</p>
        </div>

        {/* Seletor de Perfil */}
        <div className="flex p-2 bg-gray-100 mx-6 mt-6 rounded-lg">
          <button
            onClick={() => setRole('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
              role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <GraduationCap size={18} />
            Aluno
          </button>
          <button
            onClick={() => setRole('instructor')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
              role === 'instructor' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <School size={18} />
            Orientador
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="p-8 pt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Institucional</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'student' ? "aluno@universidade.edu" : "prof@universidade.edu"}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="text-right mt-1">
              <a href="#" className="text-xs text-blue-600 hover:underline">Esqueceu a senha?</a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? 'Entrando...' : (
              <>
                Acessar Painel <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Rodapé */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}