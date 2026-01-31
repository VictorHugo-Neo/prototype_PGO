import { useEffect, useState } from 'react';
import { Users, BookOpen, Plus, Calendar, X, Bell } from 'lucide-react'; // Adicione Bell
import { guidanceService, userService, notificationService } from '../services/api';
import type { StudentGuidance, Notification } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentGuidance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  
  // Notificações
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  // Estados do Modal Novo Aluno
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentTheme, setNewStudentTheme] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [user, data, notifs] = await Promise.all([
        userService.getMe(),
        guidanceService.getMyStudents(),
        notificationService.getAll()
      ]);
      setUserName(user.name);
      setStudents(data);
      setNotifications(notifs);
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      await notificationService.markAsRead(notif.id);
      // Atualiza localmente para lido
      setNotifications(notifications.map(n => n.id === notif.id ? {...n, read: true} : n));
    }
    // Redireciona se tiver link
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinking(true);
    try {
      await guidanceService.linkStudent(newStudentEmail, newStudentTheme);
      alert("Aluno vinculado com sucesso!");
      setIsModalOpen(false);
      setNewStudentEmail(''); setNewStudentTheme('');
      loadDashboardData(); 
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erro ao vincular aluno.");
    } finally {
      setLinking(false);
    }
  };

  const upcomingDefenses = students.filter(s => s.defense_date && new Date(s.defense_date) > new Date()).length;
  const unreadCount = notifications.filter(n => !n.read).length;
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center relative">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Olá, Prof. {userName}</h1>
            <p className="text-gray-500">Aqui está o resumo das suas orientações.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* SINO DE NOTIFICAÇÕES */}
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className="p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 relative">
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Dropdown de Notificações */}
              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700 text-sm">Notificações</div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">Nenhuma notificação.</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-blue-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}
                        >
                          <p className={`text-sm ${!n.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{n.message}</p>
                          <span className="text-[10px] text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} /> Novo Aluno
            </button>
          </div>
        </div>

        {/* Cards */}
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Calendar size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">Próximas Bancas</p>
              <h3 className="text-2xl font-bold text-gray-800">{upcomingDefenses}</h3>
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
                  <th className="px-6 py-4">Banca</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/guidance/${item.id}`)}>
                      <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {item.student.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div><p className="font-medium">{item.student.name}</p><p className="text-xs text-gray-500">{item.student.email}</p></div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.theme}</td>
                      <td className="px-6 py-4">{item.defense_date ? <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">{formatDate(item.defense_date)}</span> : <span className="text-xs text-gray-400">Não agendada</span>}</td>
                      <td className="px-6 py-4 text-right text-blue-600 text-sm">Ver Detalhes</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Vincular Aluno (Mantido igual, apenas renderizado se isModalOpen) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              <h2 className="text-xl font-bold mb-4">Vincular Novo Aluno</h2>
              <form onSubmit={handleLinkStudent} className="space-y-4">
                <div><label className="text-sm font-medium">Email</label><input type="email" required value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} className="w-full border p-2 rounded" placeholder="aluno@email.com" /></div>
                <div><label className="text-sm font-medium">Tema</label><input type="text" required value={newStudentTheme} onChange={e => setNewStudentTheme(e.target.value)} className="w-full border p-2 rounded" placeholder="Ex: IA" /></div>
                <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                  <button type="submit" disabled={linking} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{linking ? 'Vinculando...' : 'Vincular'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}