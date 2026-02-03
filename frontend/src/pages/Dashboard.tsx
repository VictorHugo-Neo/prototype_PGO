import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, CheckSquare, Plus, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'; // <--- Gráficos
import { API_BASE_URL, guidanceService, statsService } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [guidances, setGuidances] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [gData, sData] = await Promise.all([
        guidanceService.getMyStudents(),
        statsService.getDashboard()
      ]);
      setGuidances(gData);
      setStats(sData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard de Orientação</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <Plus size={20} /> Nova Orientação
          </button>
        </div>

        {/* --- KPI CARDS (Números Importantes) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total de Alunos</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats?.total_students || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckSquare size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tarefas Concluídas</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats?.task_stats.find((t:any) => t.name === 'Concluído')?.value || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><Calendar size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Reuniões Pendentes</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats?.pending_meetings || 0}</h3>
            </div>
          </div>
        </div>

        {/* --- GRÁFICOS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Gráfico de Pizza: Status Geral */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Status Geral das Tarefas</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.task_stats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats?.task_stats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {stats?.task_stats.map((entry: any) => (
                <div key={entry.name} className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de Barras: Ranking de Alunos */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Progresso dos Alunos (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.student_ranking} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="progress" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* --- LISTA DE ALUNOS (Mantida) --- */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Suas Orientações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guidances.map((guidance) => (
              <div 
                key={guidance.id} 
                onClick={() => navigate(`/guidance/${guidance.id}`)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    {guidance.student.avatar_path ? (
                         <img src={`${API_BASE_URL}/${guidance.student.avatar_path.replace(/\\/g, '/')}`} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-lg font-bold text-gray-500">{guidance.student.name.substring(0,2).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{guidance.student.name}</h3>
                    <p className="text-xs text-gray-500 truncate w-40">{guidance.theme}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500 mt-4 pt-4 border-t border-gray-50">
                   <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {guidance.defense_date ? new Date(guidance.defense_date).toLocaleDateString() : 'Sem data'}
                   </div>
                   <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600"/>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}