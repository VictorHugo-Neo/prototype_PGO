import { API_BASE_URL} from '../services/api';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Clock, CheckCircle, PlayCircle, Calendar, 
  MessageSquare, Send, X, Paperclip, Download, Bell, 
  Sparkles, FileText, Camera 
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import Cropper from 'react-easy-crop';
import { ChatWidget } from '../components/ChatWidget'; // <--- O NOVO COMPONENTE
import { getCroppedImg } from '../utils/cropImage';
import { 
  guidanceService, 
  taskService, 
  commentService, 
  userService, 
  attachmentService, 
  notificationService, 
  meetingService, 
  aiService, 
  reportService   
} from '../services/api';
import type { Task, Comment, Attachment, Notification, Meeting } from '../services/api';

export default function StudentDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [guidance, setGuidance] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Usuário Logado
  const [myUserId, setMyUserId] = useState<number>(0);
  
  // Notificações & Reuniões
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingTopic, setNewMeetingTopic] = useState('');

  // Modais de Tarefa & Detalhes
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // IA - Gerar Tarefas (Botão do Header)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Crop (Avatar)
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      const user = await userService.getMe();
      setMyUserId(user.id);
    } catch (error) { console.error("Erro ao carregar usuário", error); }
  }

  const loadData = async () => {
    try {
      const [gData, tData, notifs, meetData] = await Promise.all([
        guidanceService.getById(id!),
        taskService.getByGuidance(id!),
        notificationService.getAll(),
        meetingService.getByGuidance(id!)
      ]);
      setGuidance(gData);
      setTasks(tData);
      setNotifications(notifs);
      setMeetings(meetData);
      setImgError(false); 
    } catch (error) { 
      console.error(error);
      navigate('/dashboard'); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- LÓGICA DE CROP ---
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => { setImageSrc(reader.result as string); setIsCropModalOpen(true); });
      reader.readAsDataURL(file);
      e.target.value = ''; 
    }
  };
  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => setCroppedAreaPixels(croppedAreaPixels), []);
  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageBlob) {
        const fileToSend = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });
        await userService.uploadAvatar(fileToSend);
        await loadData();
        setIsCropModalOpen(false); setImageSrc(null);
        alert("Foto atualizada!");
      }
    } catch (e) { alert("Erro ao cortar imagem."); }
  };

  // --- OUTRAS FUNÇÕES ---
  const handleGenerateAI = async () => {
    if (!window.confirm("A IA vai ler o tema e gerar sugestões de tarefas. Deseja continuar?")) return;
    setIsGeneratingAI(true);
    try { await aiService.generateTasks(Number(id)); await loadData(); alert("Tarefas geradas com sucesso! 🤖✨"); } 
    catch (e) { alert("Erro ao gerar tarefas."); } finally { setIsGeneratingAI(false); }
  };
  const handleDownloadReport = async () => { try { await reportService.download(Number(id)); } catch (e) { alert("Erro ao baixar relatório."); } };
  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newMeetingDate || !newMeetingTopic) return;
    try { await meetingService.create({ date: newMeetingDate, topic: newMeetingTopic, guidance_id: Number(id) }); setNewMeetingDate(''); setNewMeetingTopic(''); const u = await meetingService.getByGuidance(id!); setMeetings(u); alert("Solicitação enviada!"); } catch (e) { alert("Erro ao solicitar reunião."); }
  };
  const handleUpdateMeetingStatus = async (meetingId: number, status: 'confirmed' | 'rejected') => {
    try { await meetingService.updateStatus(meetingId, status); setMeetings(meetings.map(m => m.id === meetingId ? {...m, status} : m)); } catch (e) { alert("Erro ao atualizar status."); }
  };
  const onDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const newStatus = destination.droppableId;
    const taskId = Number(draggableId);
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
    try { await taskService.updateStatus(taskId, newStatus); } catch (e) { loadData(); }
  };
  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) { await notificationService.markAsRead(notif.id); setNotifications(notifications.map(n => n.id === notif.id ? {...n, read: true} : n)); }
    if (notif.link && notif.link !== window.location.pathname) { navigate(notif.link); } setShowNotif(false);
  };
  const handleTaskClick = async (task: Task) => { setSelectedTask(task); const [c, a] = await Promise.all([commentService.getByTask(task.id), attachmentService.getByTask(task.id)]); setComments(c); setAttachments(a); };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { if (!e.target.files || !selectedTask) return; setIsUploading(true); try { await attachmentService.upload(selectedTask.id, e.target.files[0]); const a = await attachmentService.getByTask(selectedTask.id); setAttachments(a); } catch (e) { alert("Erro no upload."); } finally { setIsUploading(false); } };
  const handleSendComment = async (e: React.FormEvent) => { e.preventDefault(); if (!newComment.trim() || !selectedTask) return; try { await commentService.create(selectedTask.id, newComment); const c = await commentService.getByTask(selectedTask.id); setComments(c); setNewComment(''); } catch (e) { alert("Erro ao comentar"); } };
  const handleCreateTask = async (e: React.FormEvent) => { e.preventDefault(); try { await taskService.create({ title: newTaskTitle, description: newTaskDesc, guidance_id: Number(id), time_estimate: newTaskDate || undefined }); setIsCreateModalOpen(false); loadData(); } catch (e) { alert("Erro ao criar tarefa"); } };
  const handleUpdateDefenseDate = async (d: string) => { try { await guidanceService.update(Number(id), {defense_date: d}); setGuidance({...guidance, defense_date: d}); } catch(e){} };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 text-sm"><ArrowLeft size={16} className="mr-1" /> Voltar</button>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMeetingModalOpen(true)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm font-medium bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"><Calendar size={18} /> Agendar Reunião</button>
              <div className="relative">
                <button onClick={() => setShowNotif(!showNotif)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 relative transition-colors"><Bell size={20} className="text-gray-600" />{notifications.filter(n=>!n.read).length > 0 && (<span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>)}</button>
                {showNotif && (<div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"><div className="p-3 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700 text-xs uppercase">Notificações</div><div className="max-h-64 overflow-y-auto">{notifications.length === 0 ? <div className="p-6 text-center text-gray-400 text-sm">Nada novo.</div> : notifications.map(n => <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-3 border-b hover:bg-blue-50 cursor-pointer ${!n.read ? 'bg-blue-50/40' : ''}`}><p className="text-sm text-gray-800">{n.message}</p></div>)}</div></div>)}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
                {/* ÁREA DO AVATAR */}
                <div className="relative group">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm bg-gray-200 flex items-center justify-center relative">
                        {guidance?.student?.avatar_path && !imgError ? (
                            <img 
                              key={guidance.student.avatar_path} 
                              src={`${API_BASE_URL}/${guidance.student.avatar_path.replace(/\\/g, '/')}`} 
                              alt="Avatar" 
                              className="w-full h-full object-cover" 
                              onError={() => setImgError(true)} 
                            />
                        ) : (<span className="text-2xl font-bold text-gray-500">{guidance?.student?.name?.substring(0, 2).toUpperCase()}</span>)}
                    </div>
                    {myUserId === guidance?.student?.id && (<label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-md z-10 flex"><Camera size={12} /><input type="file" className="hidden" accept="image/*" onChange={onFileChange} /></label>)}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{guidance?.student?.name}</h1>
                    <p className="text-gray-500 text-sm mt-1 mb-2">Tema: <span className="font-medium text-blue-600">{guidance?.theme}</span></p>
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100 w-fit"><label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Calendar size={12}/> Banca:</label><input type="datetime-local" className="text-sm bg-transparent text-gray-700 focus:outline-none font-medium" value={guidance?.defense_date ? new Date(guidance.defense_date).toISOString().slice(0, 16) : ''} onChange={(e) => handleUpdateDefenseDate(e.target.value)} /></div>
                </div>
            </div>
            <div className="flex gap-3 items-center">
              <button onClick={handleGenerateAI} disabled={isGeneratingAI} className={`px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm text-white transition-all ${isGeneratingAI ? 'bg-purple-400 cursor-wait' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-md'}`}><Sparkles size={20} className={isGeneratingAI ? "animate-spin" : ""} />{isGeneratingAI ? 'Criando...' : 'Gerar Tarefas'}</button>
              <button onClick={handleDownloadReport} className="flex items-center gap-2 text-gray-600 hover:text-red-600 text-sm font-medium bg-gray-50 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-gray-200"><FileText size={18} />PDF</button>
              <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"><Plus size={20} /> Nova Tarefa</button>
            </div>
          </div>
        </div>
      </div>

      {/* --- KANBAN --- */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto p-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <KanbanColumn id="pending" title="A Fazer" tasks={tasks.filter(t => t.status === 'pending')} color="bg-gray-100" icon={<Clock size={18} />} onClickTask={handleTaskClick} />
            <KanbanColumn id="in_progress" title="Em Andamento" tasks={tasks.filter(t => t.status === 'in_progress')} color="bg-blue-50" icon={<PlayCircle size={18} className="text-blue-600"/>} onClickTask={handleTaskClick} />
            <KanbanColumn id="completed" title="Concluído" tasks={tasks.filter(t => t.status === 'completed')} color="bg-green-50" icon={<CheckCircle size={18} className="text-green-600"/>} onClickTask={handleTaskClick} />
          </div>
        </div>
      </DragDropContext>

      {/* --- CHAT WIDGET (SUBSTITUINDO O CÓDIGO ANTIGO) --- */}
      <ChatWidget guidanceId={Number(id)} />

      {/* --- MODAIS COM ESTILO CLEAN (Sem bordas pretas) --- */}
      
      {/* 1. Modal de Crop */}
      {isCropModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-700">Ajustar Foto</h3>
              <button onClick={()=>setIsCropModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="relative h-64 bg-gray-900">{imageSrc && <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom}/>}</div>
            <div className="p-4 flex flex-col gap-4 bg-white">
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e)=>setZoom(Number(e.target.value))} className="w-full accent-blue-600"/>
              <button onClick={handleSaveCrop} className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">Salvar Foto</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal de Reunião */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative shadow-2xl">
            <button onClick={()=>setIsMeetingModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Agendar Reunião</h2>
            <form onSubmit={handleCreateMeeting} className="mb-6 flex gap-4">
              <input type="datetime-local" required value={newMeetingDate} onChange={e=>setNewMeetingDate(e.target.value)} className="border border-gray-200 p-3 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"/>
              <input type="text" required placeholder="Assunto da reunião" value={newMeetingTopic} onChange={e=>setNewMeetingTopic(e.target.value)} className="border border-gray-200 p-3 rounded-lg flex-[2] outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"/>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-medium transition-colors">Agendar</button>
            </form>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {meetings.length === 0 && <p className="text-gray-400 text-center py-4">Nenhuma reunião agendada.</p>}
              {meetings.map(m=>(<div key={m.id} className="border border-gray-100 bg-gray-50 p-3 rounded-lg flex justify-between items-center"><div><p className="font-bold text-sm text-gray-800">{m.topic}</p><p className="text-xs text-gray-500">{new Date(m.date).toLocaleString()}</p></div><span className={`text-xs font-bold uppercase px-2 py-1 rounded ${m.status==='confirmed'?'bg-green-100 text-green-700':m.status==='rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{m.status === 'pending' ? 'Pendente' : m.status === 'confirmed' ? 'Confirmada' : 'Recusada'}</span></div>))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Nova Tarefa */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Nova Tarefa</h2>
              <button onClick={()=>setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Título</label>
                <input placeholder="Ex: Ler capítulo 1" required value={newTaskTitle} onChange={e=>setNewTaskTitle(e.target.value)} className="w-full border border-gray-200 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Descrição</label>
                <textarea placeholder="Detalhes da tarefa..." value={newTaskDesc} onChange={e=>setNewTaskDesc(e.target.value)} className="w-full border border-gray-200 p-3 rounded-lg h-24 resize-none outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Prazo (Opcional)</label>
                <input type="date" value={newTaskDate} onChange={e=>setNewTaskDate(e.target.value)} className="w-full border border-gray-200 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"/>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={()=>setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">Criar Tarefa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Detalhes da Tarefa */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex relative shadow-2xl overflow-hidden">
            <button onClick={()=>setSelectedTask(null)} className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600"><X size={24}/></button>
            {/* Lado Esquerdo: Info */}
            <div className="w-1/2 p-8 border-r border-gray-100 overflow-y-auto bg-gray-50">
              <span className={`text-xs font-bold px-2 py-1 rounded uppercase mb-4 inline-block ${selectedTask.status==='completed'?'bg-green-100 text-green-700':selectedTask.status==='in_progress'?'bg-blue-100 text-blue-700':'bg-gray-200 text-gray-700'}`}>{selectedTask.status === 'pending' ? 'A Fazer' : selectedTask.status === 'in_progress' ? 'Em Andamento' : 'Concluído'}</span>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">{selectedTask.title}</h2>
              {selectedTask.time_estimate && <div className="flex items-center gap-2 text-gray-500 text-sm mb-6"><Calendar size={16} /><span>Prazo: {new Date(selectedTask.time_estimate).toLocaleDateString('pt-BR')}</span></div>}
              <div className="prose prose-sm text-gray-600">
                <h3 className="text-gray-900 font-semibold mb-2">Descrição</h3>
                <p className="whitespace-pre-wrap leading-relaxed">{selectedTask.description || "Sem descrição."}</p>
              </div>
            </div>
            {/* Lado Direito: Chat e Arquivos */}
            <div className="w-1/2 flex flex-col bg-white">
              <div className="p-4 border-b border-gray-100 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Paperclip size={14}/> Arquivos</h4>
                  <label className="cursor-pointer text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium transition-colors">
                    {isUploading ? 'Enviando...' : '+ Adicionar'}
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading}/>
                  </label>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {attachments.length === 0 && <p className="text-xs text-gray-400 italic">Nenhum arquivo anexado.</p>}
                  {attachments.map(f=>(<div key={f.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded border border-gray-100 hover:border-blue-200 transition-colors"><span className="truncate max-w-[200px] text-gray-600">{f.filename}</span><a href={`${API_BASE_URL}${f.file_path}`} target="_blank" className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Download size={14}/></a></div>))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {comments.length === 0 && <div className="text-center py-10"><MessageSquare size={32} className="mx-auto text-gray-200 mb-2"/><p className="text-gray-400 text-sm">Nenhum comentário ainda.</p></div>}
                {comments.map(c=>(<div key={c.id} className={`flex flex-col ${c.user_id===myUserId?'items-end':'items-start'}`}><span className="text-[10px] text-gray-400 mb-1 px-1">{c.user_name}</span><div className={`px-4 py-2 rounded-2xl text-sm shadow-sm max-w-[85%] ${c.user_id===myUserId?'bg-blue-600 text-white rounded-tr-none':'bg-white text-gray-700 border border-gray-100 rounded-tl-none'}`}>{c.content}</div></div>))}
              </div>
              <form onSubmit={handleSendComment} className="p-3 border-t border-gray-100 flex gap-2 bg-white">
                <input value={newComment} onChange={e=>setNewComment(e.target.value)} className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Escreva um comentário..."/>
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors shadow-sm"><Send size={18}/></button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Kanban Component (Estilizado Clean)
function KanbanColumn({ id, title, tasks, color, icon, onClickTask }: any) {
  return (
    <div className={`rounded-xl ${color} p-4 flex flex-col h-full min-h-[500px]`}>
      <div className="flex items-center gap-2 mb-4 font-bold text-gray-700">
        {icon} <h3>{title}</h3>
        <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-xs shadow-sm text-gray-500 border border-gray-100">{tasks.length}</span>
      </div>
      <Droppable droppableId={id}>
        {(provided, snapshot)=>(
          <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 space-y-3 transition-colors ${snapshot.isDraggingOver?'bg-blue-100/20 rounded-lg':''}`}>
            {tasks.map((t:any, i:number)=>(
              <Draggable key={t.id} draggableId={String(t.id)} index={i}>
                {(provided, snapshot)=>(
                  <div 
                    ref={provided.innerRef} 
                    {...provided.draggableProps} 
                    {...provided.dragHandleProps} 
                    onClick={()=>onClickTask(t)} 
                    style={{ ...provided.draggableProps.style }}
                    className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative ${snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-blue-500 z-50' : ''}`}
                  >
                    <h4 className="font-medium text-gray-800 break-words line-clamp-2">{t.title}</h4>
                    {t.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{t.description}</p>}
                    {t.time_estimate && (
                      <div className="flex items-center gap-1 mt-3 text-[10px] text-gray-400 bg-gray-50 w-fit px-2 py-1 rounded">
                        <Calendar size={10} /> {new Date(t.time_estimate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}