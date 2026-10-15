import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, AlertCircle } from 'lucide-react';
import { guidanceService, authService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function Trail() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyGuidance = async () => {
      try {
        const guidance = await guidanceService.getStudentGuidance();
        if (guidance && guidance.id) {
          navigate(`/guidance/${guidance.id}`, { replace: true });
        }
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setError('Você ainda não foi vinculado a nenhum professor orientador.');
        } else {
          setError('Erro ao carregar seus dados acadêmicos. Tente novamente mais tarde.');
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
    return <LoadingSpinner fullScreen message="Consultando sua orientação..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <AlertCircle size={28} aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Aguardando Vínculo</h1>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {error || 'Seu orientador ainda não vinculou o seu e-mail a um tema de TCC.'}
        </p>
        <p className="text-xs text-gray-400 mb-8 bg-gray-50 p-3 rounded-lg border border-gray-100">
          Solicite ao seu professor orientador que cadastre uma nova orientação usando o mesmo e-mail institucional do seu cadastro.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors mx-auto"
        >
          <LogOut size={16} /> Sair do Sistema
        </button>
      </div>
    </div>
  );
}