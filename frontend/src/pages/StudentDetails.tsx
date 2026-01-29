import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, CheckCircle, PlayCircle, MoreVertical } from 'lucide-react';
import { guidanceService, taskService } from '../services/api';
import type { Task } from '../services/api';

// --- Interface para o Componente de Coluna (Correção Opção 2) ---
interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  color: string;
  icon: React.ReactNode;
  onMove: (id: number) => void; // Define que a função recebe um número
  nextLabel: string;
}

export default function StudentDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  // Estados
  const [guidance, setGuidance] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // Carregar dados ao entrar na tela
  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      // Busca dados da orientação e das tarefas em paralelo
      const [gData, tData] = await Promise.all([
        guidanceService.getById(id!),
        taskService.getByGuidance(id!)
      ]);
      setGuidance(gData);
      setTasks(tData);
    } catch (error) {
      console.error("Erro ao carregar detalhes", error);
      alert("Erro ao carregar dados. Verifique se o aluno existe.");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    try {
      await taskService.create({
        title: newTaskTitle,
        description: newTaskDesc,
        guidance_id: Number(id)
      });
      setIsModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      loadData(); // Recarrega lista para mostrar a nova tarefa
    } catch (error) {
      alert("Erro ao criar tarefa");
    }
  };

  const changeStatus = async (taskId: number, newStatus: string) => {
    try {
      // Atualiza no backend
      await taskService.updateStatus(taskId, newStatus);
      // Recarrega a tela
      loadData(); 
    } catch (error) {
      console.error("Erro ao mover card", error);
      alert("Não foi possível mover a tarefa.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando trilha...</div>;

  // Filtra as tarefas para cada coluna
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const progressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 mb-2 text-sm transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Voltar ao Dashboard
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{guidance?.student?.name}</h1>
              <p className="text-gray-500 text-sm mt-1">Tema: <span className="font-medium text-blue-600">{guidance?.theme}</span></p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus size={20} /> Nova Tarefa
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          
          {/* Coluna: A Fazer */}
          <KanbanColumn 
            title="A Fazer" 
            tasks={pendingTasks} 
            color="bg-gray-100" 
            icon={<Clock size={18} />}
            onMove={(id) => changeStatus(id, 'in_progress')}
            nextLabel="Iniciar"
          />

          {/* Coluna: Em Andamento */}
          <KanbanColumn 
            title="Em Andamento" 
            tasks={progressTasks} 
            color="bg-blue-50" 
            icon={<PlayCircle size={18} className="text-blue-600"/>}
            onMove={(id) => changeStatus(id, 'completed')}
            nextLabel="Concluir"
          />

          {/* Coluna: Concluído */}
          <KanbanColumn 
            title="Concluído" 
            tasks={completedTasks} 
            color="bg-green-50" 
            icon={<CheckCircle size={18} className="text-green-600"/>}
            onMove={() => {}} // Função vazia pois não move para frente
            nextLabel=""
          />
          
        </div>
      </div>

      {/* Modal Nova Tarefa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Criar Nova Tarefa</h2>
            <form onSubmit={handleCreateTask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título</label>
                  <input 
                    type="text" 
                    required
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: Escrever Introdução"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea 
                    value={newTaskDesc}
                    onChange={e => setNewTaskDesc(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                    placeholder="Detalhes da tarefa..."
                  />
                </div>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// --- Subcomponente Tipado Corretamente ---
function KanbanColumn({ title, tasks, color, icon, onMove, nextLabel }: KanbanColumnProps) {
  return (
    <div className={`rounded-xl ${color} p-4 flex flex-col h-full min-h-[500px]`}>
      <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
        {icon}
        <h3>{title}</h3>
        <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-xs shadow-sm text-gray-500 border border-gray-100">
          {tasks.length}
        </span>
      </div>
      
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-800 break-words">{task.title}</h4>
              <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 line-clamp-3 mb-3 break-words">
              {task.description || "Sem descrição"}
            </p>
            
            {nextLabel && (
              <button 
                onClick={() => onMove(task.id)}
                className="w-full text-xs font-medium bg-gray-50 hover:bg-blue-50 text-blue-600 py-2 rounded transition-colors border border-gray-100 mt-auto"
              >
                Mover para {nextLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}