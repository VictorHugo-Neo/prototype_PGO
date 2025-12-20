import { useEffect, useState } from 'react';
import type { Task } from '../services/trailService';
import { getStudentTasks, toggleTaskStatus } from '../services/trailService';
import { TaskCard } from '../components/TaskCard';

export default function Trial() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getStudentTasks(1); // ID 1 Hardcoded
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (id: number) => {
    
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const currentStatus = tasks[taskIndex].status;
    const newStatus = currentStatus === 'concluido' ? 'pendente' : 'concluido';

    
    const newTasks = [...tasks];
    newTasks[taskIndex].status = newStatus as any; 
    setTasks(newTasks);

    
    await toggleTaskStatus(id, currentStatus);
  };

  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'concluido').length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  if (loading) return <div className="p-8 text-center">Carregando sua trilha...</div>;

  return (
    <div className="min-h-screen bg-gray-50 max-w-2xl mx-auto shadow-xl min-h-screen bg-white">
      
      <div className="bg-blue-600 p-8 text-white rounded-b-3xl mb-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Olá, Estudante!</h1>
        <p className="opacity-90 mb-6">Aqui está o seu progresso no TCC.</p>

        <div className="bg-blue-800/50 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span>Progresso Geral</span>
            <span>{progressPercentage}%</span>
          </div>
          
          <div className="w-full bg-blue-900/50 rounded-full h-2.5">
            <div 
              className="bg-green-400 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      
      <div className="px-6 pb-12">
        <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">Próximos Passos</h2>
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              {...task}
              onToggle={handleTaskToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}