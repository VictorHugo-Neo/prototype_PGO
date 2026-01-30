import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, CheckCircle, PlayCircle, MoreVertical, Calendar, MessageSquare, Send, X } from 'lucide-react';
import { guidanceService, taskService, commentService, userService } from '../services/api';
import type { Task, Comment } from '../services/api';

// --- Interface para Colunas ---
interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  color: string;
  icon: React.ReactNode;
  onMove: (id: number) => void;
  onClickTask: (task: Task) => void; // Novo evento de clique
  nextLabel: string;
}

export default function StudentDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [guidance, setGuidance] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<number>(0); // Para saber qual balão é o meu
  
  // Modal de Nova Tarefa
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');

  // Modal de Detalhes/Chat
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    const user = await userService.getMe();
    setMyUserId(user.id);
  }

  const loadData = async () => {
    try {
      const [gData, tData] = await Promise.all([
        guidanceService.getById(id!),
        taskService.getByGuidance(id!)
      ]);
      setGuidance(gData);
      setTasks(tData);
    } catch (error) {
      console.error(error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica de Comentários ---
  const handleTaskClick = async (task: Task) => {
    setSelectedTask(task);
    const taskComments = await commentService.getByTask(task.id);
    setComments(taskComments);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    try {
      await commentService.create(selectedTask.id, newComment);
      const updatedComments = await commentService.getByTask(selectedTask.id);
      setComments(updatedComments);
      setNewComment('');
    } catch (error) {
      alert("Erro ao enviar comentário");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      await taskService.create({
        title: newTaskTitle,
        description: newTaskDesc,
        guidance_id: Number(id),
        time_estimate: newTaskDate || undefined
      });
      setIsCreateModalOpen(false);
      setNewTaskTitle(''); setNewTaskDesc(''); setNewTaskDate('');
      loadData(); 
    } catch (error) { alert("Erro ao criar tarefa"); }
  };

  const changeStatus = async (taskId: number, newStatus: string) => {
    try { await taskService.updateStatus(taskId, newStatus); loadData(); } 
    catch (error) { alert("Erro ao mover"); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 mb-2 text-sm">
            <ArrowLeft size={16} className="mr-1" /> Voltar
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{guidance?.student?.name}</h1>
              <p className="text-gray-500 text-sm mt-1">Tema: <span className="font-medium text-blue-600">{guidance?.theme}</span></p>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <Plus size={20} /> Nova Tarefa
            </button>
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <KanbanColumn 
            title="A Fazer" tasks={tasks.filter(t => t.status === 'pending')} color="bg-gray-100" icon={<Clock size={18} />}
            onMove={(id) => changeStatus(id, 'in_progress')} onClickTask={handleTaskClick} nextLabel="Iniciar"
          />
          <KanbanColumn 
            title="Em Andamento" tasks={tasks.filter(t => t.status === 'in_progress')} color="bg-blue-50" icon={<PlayCircle size={18} className="text-blue-600"/>}
            onMove={(id) => changeStatus(id, 'completed')} onClickTask={handleTaskClick} nextLabel="Concluir"
          />
          <KanbanColumn 
            title="Concluído" tasks={tasks.filter(t => t.status === 'completed')} color="bg-green-50" icon={<CheckCircle size={18} className="text-green-600"/>}
            onMove={() => {}} onClickTask={handleTaskClick} nextLabel=""
          />
        </div>
      </div>

      {/* MODAL 1: CRIAR TAREFA */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Nova Tarefa</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div><label className="text-sm font-medium">Título</label><input type="text" required value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="text-sm font-medium">Prazo</label><input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="text-sm font-medium">Descrição</label><textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} className="w-full border p-2 rounded mt-1 h-24 resize-none outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHAT & DETALHES */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] shadow-2xl flex overflow-hidden relative">
            <button onClick={() => setSelectedTask(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"><X size={24} /></button>
            
            {/* Esquerda: Detalhes da Tarefa */}
            <div className="w-1/2 p-8 border-r border-gray-100 overflow-y-auto bg-gray-50">
              <span className={`text-xs font-bold px-2 py-1 rounded uppercase mb-4 inline-block ${selectedTask.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {selectedTask.status === 'completed' ? 'Concluído' : selectedTask.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
              </span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedTask.title}</h2>
              {selectedTask.time_estimate && (
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                  <Calendar size={16} />
                  <span>Prazo: {new Date(selectedTask.time_estimate).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
              <div className="prose prose-sm text-gray-600">
                <h3 className="text-gray-900 font-semibold mb-2">Descrição</h3>
                <p className="whitespace-pre-wrap">{selectedTask.description || "Sem descrição detalhada."}</p>
              </div>
            </div>

            {/* Direita: Chat */}
            <div className="w-1/2 flex flex-col bg-white">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-600"/>
                <h3 className="font-semibold text-gray-700">Comentários & Feedback</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center text-gray-400 mt-10 text-sm">Nenhum comentário ainda.<br/>Inicie a conversa!</div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className={`flex flex-col ${comment.user_id === myUserId ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-gray-400 mb-1 px-1">{comment.user_name}</span>
                      <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${comment.user_id === myUserId ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                        {comment.content}
                      </div>
                      <span className="text-[10px] text-gray-300 mt-1 px-1">
                        {new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendComment} className="p-4 border-t border-gray-100 flex gap-2">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Escreva um comentário..." 
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button type="submit" disabled={!newComment.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors">
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Componente Coluna (Atualizado com onClickTask) ---
function KanbanColumn({ title, tasks, color, icon, onMove, onClickTask, nextLabel }: KanbanColumnProps) {
  const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString('pt-BR') : null;

  return (
    <div className={`rounded-xl ${color} p-4 flex flex-col h-full min-h-[500px]`}>
      <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
        {icon} <h3>{title}</h3> <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-xs shadow-sm text-gray-500 border border-gray-100">{tasks.length}</span>
      </div>
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            onClick={() => onClickTask(task)} // <--- CLIQUE NO CARD ABRE CHAT
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-800 break-words pr-6">{task.title}</h4>
            </div>
            <p className="text-xs text-gray-500 line-clamp-3 mb-3 break-words">{task.description || "Sem descrição"}</p>
            {task.time_estimate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 bg-gray-50 p-1.5 rounded w-fit">
                <Calendar size={12} className="text-blue-500"/> <span>{formatDate(task.time_estimate)}</span>
              </div>
            )}
            {nextLabel && (
              <button 
                onClick={(e) => { e.stopPropagation(); onMove(task.id); }} // StopPropagation para não abrir o chat ao mover
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