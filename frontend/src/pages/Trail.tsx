import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guidanceService } from '../services/api';
import { LogOut } from 'lucide-react';
import { authService } from '../services/api';

export default function Trilha() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyGuidance = async () => {
      try {
        // Tenta buscar "Minha Orientação"
        const guidance = await guidanceService.getStudentGuidance();
        
        // Se achou, manda o aluno direto para o Kanban
        if (guidance && guidance.id) {
          navigate(`/guidance/${guidance.id}`);
        }
      } catch (err: any) {
        // Se deu erro 404, significa que ele não tem orientador ainda
        if (err.response && err.response.status === 404) {
          setError("Você ainda não foi vinculado a nenhum orientador.");
        } else {
          setError("Erro ao carregar seus dados. Tente novamente.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyGuidance();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando sua trilha...</div>;
  }

  // Se chegou aqui, é porque não tem orientação vinculada ainda
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          !
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Aguardando Vínculo</h1>
        <p className="text-gray-600 mb-6">
          {error || "Seu professor orientador ainda não criou o vínculo com o seu email."}
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Peça para ele adicionar o email que você usou no cadastro.
        </p>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium mx-auto"
        >
          <LogOut size={18} /> Sair do Sistema
        </button>
      </div>
    </div>
  );
}