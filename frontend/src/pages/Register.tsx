import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, GraduationCap, School, CheckCircle } from 'lucide-react';
import { authService } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword){ //melhorar validação
      alert('As senhas não coincidem!');
      return;
    }
    try{
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        type: role === 'student' ? 'student' : 'advisor' // traduz para o inglês - backend
      })
      alert('Cadastro realizado com sucesso! Faça o seu Login.')
      navigate('/') // tela de login
    }catch (error: any){
      console.error(error)
      const msg = error.response?.data?.detail || "Erro ao realizar cadastro"
      alert(msg)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        <div className="p-8 text-center pb-0">
          <h2 className="text-2xl font-bold text-gray-800">Crie sua conta</h2>
          <p className="text-gray-500 mt-1">Comece sua jornada acadêmica no PGO</p>
        </div>

        {/* Seletor de Tipo de Conta */}
        <div className="grid grid-cols-2 gap-4 p-6 pb-2">
          <div 
            onClick={() => setRole('student')}
            className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
              role === 'student' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            <GraduationCap size={24} />
            <span className="font-medium text-sm">Sou Aluno</span>
            {role === 'student' && <CheckCircle className="absolute top-2 right-2 text-blue-500 w-4 h-4" />}
          </div>

          <div 
            onClick={() => setRole('instructor')}
            className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
              role === 'instructor' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            <School size={24} />
            <span className="font-medium text-sm">Sou Orientador</span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="p-8 pt-2 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                name="name"
                type="text"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Seu nome"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                name="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="email@instituicao.edu"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="******"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Confirmar</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="******"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            Criar Conta
          </button>
        </form>

        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Já possui conta?{' '}
            <Link to="/" className="text-blue-600 font-semibold hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}