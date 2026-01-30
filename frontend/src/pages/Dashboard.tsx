import { useEffect, useState } from 'react';
import { Users, BookOpen, Search, Plus, Calendar, X } from 'lucide-react'; // Adicionado X
import { guidanceService, userService } from '../services/api';
import type { StudentGuidance } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentGuidance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentTheme, setNewStudentTheme] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Carrega dados do usuário e dos alunos em paralelo
      const [user, data] = await Promise.all([
        userService.getMe(),
        guidanceService.getMyStudents()
      ]);
      
      setUserName(user.name);
      setStudents(data);
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinking(true);
    try {
      await guidanceService.linkStudent(newStudentEmail, newStudentTheme);
      alert("Aluno vinculado com sucesso!");
      setIsModalOpen(false);
      setNewStudentEmail('');
      setNewStudentTheme('');
      loadDashboardData(); // Recarrega a lista
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Erro ao vincular aluno.";
      alert(msg);
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Olá, Prof. {userName}</h1>
            <p className="text-gray-500">Aqui está o resumo das suas orientações.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} /> Novo Aluno
          </button>
        </div>

        {/* Cards (Mantidos iguais) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">Total de Orientandos</p>
              <h3 className="text-2xl font-bold text-gray-800">{students.length}</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><BookOpen size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">Projetos Ativos</p>
              <h3 className="text-2xl font-bold text-gray-800">{students.length}</h3>
            </div>
          </div>

           {/* Card placeholder para estatística futura */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 opacity-60">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Calendar size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">Próximas Bancas</p>
              <h3 className="text-2xl font-bold text-gray-800">0</h3>
            </div>
          </div>
        </div>

        {/* Lista de Alunos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Seus Orientandos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Aluno</th>
                  <th className="px-6 py-4">Tema</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Você ainda não possui alunos vinculados.
                    </td>
                  </tr>
                ) : (
                  students.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/guidance/${item.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {item.student.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.student.name}</p>
                            <p className="text-xs text-gray-500">{item.student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.theme}</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Em dia</span>
                      </td>
                      <td className="px-6 py-4 text-right text-blue-600 text-sm font-medium">Ver Detalhes</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MODAL DE VINCULAR ALUNO --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-bold mb-4 text-gray-800">Vincular Novo Aluno</h2>
              <p className="text-sm text-gray-500 mb-6">Informe o email do aluno para iniciar uma orientação. O aluno já deve ter cadastro no sistema.</p>
              
              <form onSubmit={handleLinkStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email do Aluno</label>
                  <input 
                    type="email" 
                    required
                    value={newStudentEmail}
                    onChange={e => setNewStudentEmail(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="aluno@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tema do Trabalho</label>
                  <input 
                    type="text" 
                    required
                    value={newStudentTheme}
                    onChange={e => setNewStudentTheme(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: IA na Medicina"
                  />
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={linking}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {linking ? 'Vinculando...' : 'Vincular Aluno'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}