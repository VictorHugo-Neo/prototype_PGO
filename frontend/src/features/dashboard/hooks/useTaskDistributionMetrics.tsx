import { useMemo } from 'react';
import { Sparkles, CheckCircle2, Layers } from 'lucide-react';
import type { DashboardTaskStat } from '../../../types';

export interface TaskDistributionMetrics {
  totalTasks: number;
  hasData: boolean;
  completedItem: DashboardTaskStat | null;
  inProgressItem: DashboardTaskStat | null;
  topItem: DashboardTaskStat | null;
  completionRate: number;
  executiveInsight: {
    icon: React.ReactNode;
    text: string;
  } | null;
}

export function useTaskDistributionMetrics(data: DashboardTaskStat[] = []): TaskDistributionMetrics {
  const totalTasks = useMemo(() => {
    return data.reduce((sum, item) => sum + (item.value || 0), 0);
  }, [data]);

  const hasData = totalTasks > 0;

  const { completedItem, inProgressItem, topItem, completionRate } = useMemo(() => {
    if (!hasData) {
      return {
        completedItem: null,
        inProgressItem: null,
        topItem: null,
        completionRate: 0,
      };
    }

    const completed = data.find((item) => {
      const s = (item.slug || item.name).toLowerCase();
      return s.includes('complete') || s.includes('conclu') || s.includes('done');
    });

    const inProgress = data.find((item) => {
      const s = (item.slug || item.name).toLowerCase();
      return s.includes('progress') || s.includes('andamento') || s.includes('fazendo');
    });

    const sortedByValue = [...data].sort((a, b) => b.value - a.value);
    const top = sortedByValue[0] || null;

    const completedVal = completed?.value || 0;
    const rate = totalTasks > 0 ? Math.round((completedVal / totalTasks) * 100) : 0;

    return {
      completedItem: completed ?? null,
      inProgressItem: inProgress ?? null,
      topItem: top ?? null,
      completionRate: rate,
    };
  }, [data, hasData, totalTasks]);

  const executiveInsight = useMemo(() => {
    if (!hasData) return null;

    if (completionRate === 100) {
      return {
        icon: <CheckCircle2 size={15} className="text-emerald-600 shrink-0" aria-hidden="true" />,
        text: 'Excelente! 100% das tarefas dos seus orientandos foram concluídas no Kanban.',
      };
    }

    if (inProgressItem && inProgressItem.value > 0) {
      const inProgressPct = Math.round((inProgressItem.value / totalTasks) * 100);
      return {
        icon: <Sparkles size={15} className="text-blue-600 shrink-0" aria-hidden="true" />,
        text: `${inProgressItem.value} ${inProgressItem.value === 1 ? 'tarefa ativa' : 'tarefas ativas'} em andamento (${inProgressPct}% do WIP). ${completionRate}% já entregues.`,
      };
    }

    if (topItem && topItem.value > 0) {
      const topPct = Math.round((topItem.value / totalTasks) * 100);
      return {
        icon: <Layers size={15} className="text-indigo-600 shrink-0" aria-hidden="true" />,
        text: `Maior volume de tarefas concentrado na coluna "${topItem.name}" (${topPct}% do fluxo total).`,
      };
    }

    return {
      icon: <Sparkles size={15} className="text-blue-600 shrink-0" aria-hidden="true" />,
      text: `${totalTasks} tarefas monitoradas no fluxo de trabalho dos seus orientandos.`,
    };
  }, [hasData, completionRate, inProgressItem, topItem, totalTasks]);

  return {
    totalTasks,
    hasData,
    completedItem,
    inProgressItem,
    topItem,
    completionRate,
    executiveInsight,
  };
}
