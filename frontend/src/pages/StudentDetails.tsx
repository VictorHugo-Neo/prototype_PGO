import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Clock, CheckCircle, PlayCircle, Calendar, 
  MessageSquare, Send, X, Paperclip, Download, Bell, Check, 
  XCircle, Sparkles, FileText, Camera, ZoomIn 
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import { 
  guidanceService, taskService, commentService, userService, 
  attachmentService, notificationService, meetingService, 
  aiService, reportService 
} from '../services/api';
import type { Task, Comment, Attachment, Notification, Meeting } from '../services/api';

export default function StudentDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [guidance, setGuidance] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Usuário
  const [myUserId, setMyUserId] = useState<number>(0);
  const [myUserType, setMyUserType] = useState<string>('');
  
  // Notificações & Reuniões
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingTopic, setNewMeetingTopic] = useState('');

  // Modais de Tarefa & Chat
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // --- ESTADOS PARA O CROP (Corte de Imagem) ---
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  
  // Estado para controlar erro de imagem visualmente sem sumir com a tag
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
      setMyUserType(user.type);
    } catch (error) {
      console.error("Erro ao carregar usuário", error);
    }
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
      // Reseta erro de imagem ao recarregar dados
      setImgError(false);
    } catch (error) {
      console.error(error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE SELEÇÃO E CROP ---
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      setIsCropModalOpen(true);
      e.target.value = ''; 
    }
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageBlob) {
        // Envia como arquivo
        const fileToSend = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });
        await userService.uploadAvatar(fileToSend);
        
        // Recarrega dados para atualizar a foto na tela
        await loadData();
        
        alert("Foto atualizada com sucesso!");
        setIsCropModalOpen(false);
        setImageSrc(null);
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao cortar imagem.");
    }
  };

  // --- OUTRAS FUNÇÕES ---
  const handleGenerateAI = async () => {
    if (!window.confirm("A IA vai ler o tema do projeto e gerar sugestões de tarefas. Deseja continuar?")) return;
    setIsGeneratingAI(true);
    try { await aiService.generateTasks(Number(id)); await loadData(); alert("Tarefas geradas com sucesso! 🤖✨"); } 
    catch (error) { alert("Erro ao gerar tarefas."); } finally { setIsGeneratingAI(false); }
  };

  const handleDownloadReport = async () => { try { await reportService.download(Number(id)); } catch (error) { alert("Erro ao baixar relatório."); } };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingDate || !newMeetingTopic) return;
    try { await meetingService.create({ date: newMeetingDate, topic: newMeetingTopic, guidance_id: Number(id) }); alert("Solicitação enviada!"); setNewMeetingDate(''); setNewMeetingTopic(''); const updated = await meetingService.getByGuidance(id!); setMeetings(updated); } 
    catch (error) { alert("Erro ao solicitar reunião."); }
  };

  const handleUpdateMeetingStatus = async (meetingId: number, status: 'confirmed' | 'rejected') => {
    try { await meetingService.updateStatus(meetingId, status); setMeetings(meetings.map(m => m.id === meetingId ? {...m, status} : m)); } catch (error) { alert("Erro ao atualizar status."); }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const newStatus = destination.droppableId;
    const taskId = Number(draggableId);
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t);
    setTasks(updatedTasks);
    try { await taskService.updateStatus(taskId, newStatus); } catch (error) { console.error("Erro ao mover", error); loadData(); }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) { await notificationService.markAsRead(notif.id); setNotifications(notifications.map(n => n.id === notif.id ? {...n, read: true} : n)); }
    if (notif.link && notif.link !== window.location.pathname) { navigate(notif.link); } setShowNotif(false);
  };
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleUpdateDefenseDate = async (newDate: string) => { try { await guidanceService.update(Number(id), { defense_date: newDate }); setGuidance({ ...guidance, defense_date: newDate }); } catch (error) { alert("Erro ao atualizar data."); } };

  const handleTaskClick = async (task: Task) => { setSelectedTask(task); const [taskComments, taskAttachments] = await Promise.all([commentService.getByTask(task.id), attachmentService.getByTask(task.id)]); setComments(taskComments); setAttachments(taskAttachments); };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { if (!e.target.files || e.target.files.length === 0 || !selectedTask) return; const file = e.target.files[0]; setIsUploading(true); try { await attachmentService.upload(selectedTask.id, file); const updatedList = await attachmentService.getByTask(selectedTask.id); setAttachments(updatedList); alert("Sucesso!"); } catch (error) { alert("Erro no upload."); } finally { setIsUploading(false); } };
  const handleSendComment = async (e: React.FormEvent) => { e.preventDefault(); if (!newComment.trim() || !selectedTask) return; try { await commentService.create(selectedTask.id, newComment); const updated = await commentService.getByTask(selectedTask.id); setComments(updated); setNewComment(''); } catch (error) { alert("Erro ao comentar"); } };
  const handleCreateTask = async (e: React.FormEvent) => { e.preventDefault(); if (!newTaskTitle) return; try { await taskService.create({ title: newTaskTitle, description: newTaskDesc, guidance_id: Number(id), time_estimate: newTaskDate || undefined }); setIsCreateModalOpen(false); setNewTaskTitle(''); setNewTaskDesc(''); setNewTaskDate(''); loadData(); } catch (error) { alert("Erro ao criar tarefa"); } };

  const avatarUrl =
  guidance?.student?.avatar_path
    ? `http://localhost:8000/${guidance.student.avatar_path.replace(/\\/g, "/")}?t=${Date.now()}`
    : null;


  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  console.log("GUIDANCE COMPLETO:", guidance);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 text-sm"><ArrowLeft size={16} className="mr-1" /> Voltar</button>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMeetingModalOpen(true)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm font-medium bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"><Calendar size={18} /> Agendar Reunião</button>
              <div className="relative">
                <button onClick={() => setShowNotif(!showNotif)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 relative transition-colors"><Bell size={20} className="text-gray-600" />{unreadCount > 0 && (<span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>)}</button>
                {showNotif && (<div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"><div className="p-3 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700 text-xs uppercase">Notificações</div><div className="max-h-64 overflow-y-auto">{notifications.length === 0 ? (<div className="p-6 text-center text-gray-400 text-sm">Nenhuma notificação nova.</div>) : (notifications.map(n => (<div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-blue-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}><p className={`text-sm ${!n.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{n.message}</p><span className="text-[10px] text-gray-400 mt-1 block">{new Date(n.created_at).toLocaleDateString()}</span></div>)))}</div></div>)}
              </div>
            </div>
          </div>
          
          {/* Profile Bar */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
                {/* ÁREA DO AVATAR - BLINDAGEM CONTRA ERROS */}
                <div className="relative group">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm bg-gray-200 flex items-center justify-center relative">
                        {avatarUrl && !imgError ? (
                            <img
                                key={avatarUrl} // força recriação do componente
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <span className="text-2xl font-bold text-gray-500">
                                {guidance?.student?.name?.substring(0, 2).toUpperCase()}
                            </span>
                        )}
                    </div>
                    
                    {/* Botão de Câmera: VISÍVEL APENAS PARA O DONO DO PERFIL (ALUNO) */}
                    {myUserId === guidance?.student?.id && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-md transition-transform transform group-hover:scale-110 z-10 flex items-center justify-center">
                          <Camera size={12} />
                          <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                      </label>
                    )}
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{guidance?.student?.name}</h1>
                    <p className="text-gray-500 text-sm mt-1 mb-2">Tema: <span className="font-medium text-blue-600">{guidance?.theme}</span></p>
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100 w-fit"><label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Calendar size={12}/> Banca:</label><input type="datetime-local" className="text-sm bg-transparent text-gray-700 focus:outline-none font-medium" value={guidance?.defense_date ? new Date(guidance.defense_date).toISOString().slice(0, 16) : ''} onChange={(e) => handleUpdateDefenseDate(e.target.value)} /></div>
                </div>
            </div>
            
            <div className="flex gap-3 items-center">
              <button onClick={handleGenerateAI} disabled={isGeneratingAI} className={`px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm text-white transition-all ${isGeneratingAI ? 'bg-purple-400 cursor-wait' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-md'}`}><Sparkles size={20} className={isGeneratingAI ? "animate-spin" : ""} />{isGeneratingAI ? 'Criando Tarefas...' : 'Gerar com IA'}</button>
              <button onClick={handleDownloadReport} className="flex items-center gap-2 text-gray-600 hover:text-red-600 text-sm font-medium bg-gray-50 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-gray-200" title="Baixar Relatório Oficial"><FileText size={18} />PDF</button>
              <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"><Plus size={20} /> Nova Tarefa</button>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto p-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <KanbanColumn id="pending" title="A Fazer" tasks={tasks.filter(t => t.status === 'pending')} color="bg-gray-100" icon={<Clock size={18} />} onClickTask={handleTaskClick} />
            <KanbanColumn id="in_progress" title="Em Andamento" tasks={tasks.filter(t => t.status === 'in_progress')} color="bg-blue-50" icon={<PlayCircle size={18} className="text-blue-600"/>} onClickTask={handleTaskClick} />
            <KanbanColumn id="completed" title="Concluído" tasks={tasks.filter(t => t.status === 'completed')} color="bg-green-50" icon={<CheckCircle size={18} className="text-green-600"/>} onClickTask={handleTaskClick} />
          </div>
        </div>
      </DragDropContext>

      {/* --- MODAL DE RECORTE (CROP) --- */}
      {isCropModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-700">Ajustar Foto de Perfil</h3>
              <button onClick={() => setIsCropModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            
            <div className="relative h-72 w-full bg-gray-900">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  showGrid={true}
                />
              )}
            </div>
            
            <div className="p-6 flex flex-col gap-4 bg-white">
              <div className="flex items-center gap-3">
                <ZoomIn size={18} className="text-gray-400"/>
                <input 
                  type="range" 
                  value={zoom} 
                  min={1} 
                  max={3} 
                  step={0.1} 
                  onChange={(e) => setZoom(Number(e.target.value))} 
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setIsCropModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancelar</button>
                <button onClick={handleSaveCrop} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors">Salvar Foto</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OUTROS MODAIS (Mantidos) */}
      {isMeetingModalOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col"><button onClick={() => setIsMeetingModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button><h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="text-blue-600"/> Agendamento de Reuniões</h2><form onSubmit={handleCreateMeeting} className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100"><h3 className="text-sm font-bold text-gray-700 mb-3">Solicitar Nova Reunião</h3><div className="flex gap-4"><div className="flex-1"><label className="text-xs text-gray-500 font-medium mb-1 block">Data e Hora</label><input type="datetime-local" required value={newMeetingDate} onChange={e => setNewMeetingDate(e.target.value)} className="w-full border p-2 rounded text-sm" /></div><div className="flex-[2]"><label className="text-xs text-gray-500 font-medium mb-1 block">Assunto</label><input type="text" required value={newMeetingTopic} onChange={e => setNewMeetingTopic(e.target.value)} placeholder="Ex: Revisão do Cap. 1" className="w-full border p-2 rounded text-sm" /></div><div className="flex items-end"><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium h-[38px]">Solicitar</button></div></div></form><div className="flex-1 overflow-y-auto"><h3 className="text-sm font-bold text-gray-700 mb-3">Histórico de Agendamentos</h3>{meetings.length === 0 ? (<p className="text-center text-gray-400 py-8 text-sm">Nenhuma reunião agendada.</p>) : (<div className="space-y-3">{meetings.map(m => (<div key={m.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"><div className="flex items-center gap-3"><div className="text-center bg-gray-100 px-3 py-1 rounded"><span className="block text-xs font-bold text-gray-500">{new Date(m.date).toLocaleDateString()}</span><span className="block text-xs text-gray-400">{new Date(m.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div><div><p className="font-medium text-gray-800 text-sm">{m.topic}</p><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${m.status === 'confirmed' ? 'bg-green-100 text-green-700' : m.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.status === 'confirmed' ? 'Confirmada' : m.status === 'rejected' ? 'Recusada' : 'Pendente'}</span></div></div>{myUserType === 'advisor' && m.status === 'pending' && (<div className="flex gap-2"><button onClick={() => handleUpdateMeetingStatus(m.id, 'confirmed')} title="Confirmar" className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"><Check size={16}/></button><button onClick={() => handleUpdateMeetingStatus(m.id, 'rejected')} title="Recusar" className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><XCircle size={16}/></button></div>)}</div>))}</div>)}</div></div></div>)}
      {isCreateModalOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"><h2 className="text-xl font-bold mb-4">Nova Tarefa</h2><form onSubmit={handleCreateTask} className="space-y-4"><div><label className="text-sm font-medium">Título</label><input type="text" required value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500" /></div><div><label className="text-sm font-medium">Prazo</label><input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500" /></div><div><label className="text-sm font-medium">Descrição</label><textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} className="w-full border p-2 rounded mt-1 h-24 resize-none outline-none focus:ring-2 focus:ring-blue-500" /></div><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Criar</button></div></form></div></div>)}
      {selectedTask && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] shadow-2xl flex overflow-hidden relative"><button onClick={() => setSelectedTask(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"><X size={24} /></button><div className="w-1/2 p-8 border-r border-gray-100 overflow-y-auto bg-gray-50"><span className={`text-xs font-bold px-2 py-1 rounded uppercase mb-4 inline-block ${selectedTask.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{selectedTask.status}</span><h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedTask.title}</h2>{selectedTask.time_estimate && <div className="flex items-center gap-2 text-gray-500 text-sm mb-6"><Calendar size={16} /><span>Prazo: {new Date(selectedTask.time_estimate).toLocaleDateString('pt-BR')}</span></div>}<div className="prose prose-sm text-gray-600"><h3 className="text-gray-900 font-semibold mb-2">Descrição</h3><p className="whitespace-pre-wrap">{selectedTask.description || "Sem descrição."}</p></div></div><div className="w-1/2 flex flex-col bg-white"><div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2"><MessageSquare size={18} className="text-blue-600"/><h3 className="font-semibold text-gray-700">Atividade e Arquivos</h3></div><div className="p-4 border-b border-gray-100 bg-white"><div className="flex justify-between items-center mb-2"><h4 className="text-xs font-bold text-gray-400 uppercase">Anexos</h4><label className="cursor-pointer text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1"><Paperclip size={12} />{isUploading ? '...' : 'Adicionar'}<input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading}/></label></div><div className="space-y-2">{attachments.map((file) => (<div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100 text-sm"><div className="flex items-center gap-2 overflow-hidden"><Paperclip size={14} className="text-gray-400 flex-shrink-0" /><span className="truncate text-gray-700">{file.filename}</span></div><a href={`http://localhost:8000/${file.file_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 p-1"><Download size={14} /></a></div>))}</div></div><div className="flex-1 overflow-y-auto p-4 space-y-4">{comments.map(c => (<div key={c.id} className={`flex flex-col ${c.user_id === myUserId ? 'items-end' : 'items-start'}`}><span className="text-xs text-gray-400 mb-1 px-1">{c.user_name}</span><div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${c.user_id === myUserId ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>{c.content}</div></div>))}</div><form onSubmit={handleSendComment} className="p-4 border-t border-gray-100 flex gap-2"><input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Escreva..." className="flex-1 border rounded-full px-4 py-2 text-sm" /><button type="submit" className="bg-blue-600 text-white p-2 rounded-full"><Send size={18} /></button></form></div></div></div>)}
    </div>
  );
}

// --- Coluna Droppable ---
interface KanbanColumnProps { id: string; title: string; tasks: Task[]; color: string; icon: React.ReactNode; onClickTask: (task: Task) => void; }
function KanbanColumn({ id, title, tasks, color, icon, onClickTask }: KanbanColumnProps) {
  const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString('pt-BR') : null;
  return (<div className={`rounded-xl ${color} p-4 flex flex-col h-full min-h-[500px]`}><div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">{icon} <h3>{title}</h3> <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-xs shadow-sm text-gray-500 border border-gray-100">{tasks.length}</span></div><Droppable droppableId={id}>{(provided, snapshot) => (<div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-100/50 rounded-lg' : ''}`}>{tasks.map((task, index) => (<Draggable key={task.id} draggableId={task.id.toString()} index={index}>{(provided, snapshot) => (<div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => onClickTask(task)} style={{ ...provided.draggableProps.style }} className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative cursor-pointer ${snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-blue-500 z-50' : ''}`}><div className="flex justify-between items-start mb-2"><h4 className="font-medium text-gray-800 break-words pr-2">{task.title}</h4></div><p className="text-xs text-gray-500 line-clamp-3 mb-3 break-words">{task.description || "Sem descrição"}</p>{task.time_estimate && (<div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 p-1.5 rounded w-fit"><Calendar size={12} className="text-blue-500"/> <span>{formatDate(task.time_estimate)}</span></div>)}</div>)}</Draggable>))}{provided.placeholder}</div>)}</Droppable></div>)
}