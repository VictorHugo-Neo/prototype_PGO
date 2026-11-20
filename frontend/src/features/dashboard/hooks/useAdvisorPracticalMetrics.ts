import { useMemo } from 'react';
import type { StudentGuidance, DashboardStats } from '../../../types';

export interface UpcomingDefenseItem {
  guidance: StudentGuidance;
  date: Date;
  diffDays: number;
  progress: number;
  pendingMeetings: number;
}

export interface StudentAttentionItem {
  guidance: StudentGuidance;
  reasons: string[];
  severity: 'high' | 'medium';
}

export interface CohortStagesBreakdown {
  initialPhase: number;
  devPhase: number;
  finalPhase: number;
  initialPct: number;
  devPct: number;
  finalPct: number;
}

export interface AdvisorPracticalMetricsData {
  upcomingDefenses: UpcomingDefenseItem[];
  withoutDefenseDate: StudentGuidance[];
  studentsNeedingAttention: StudentAttentionItem[];
  cohortStages: CohortStagesBreakdown;
}

export function useAdvisorPracticalMetrics(
  guidances: StudentGuidance[],
  stats: DashboardStats | null
): AdvisorPracticalMetricsData {
  const today = useMemo(() => new Date(), []);

  const upcomingDefenses = useMemo(() => {
    return guidances
      .filter((g) => Boolean(g.defense_date))
      .map((g) => {
        const d = new Date(g.defense_date!);
        const targetMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diffMs = targetMidnight.getTime() - todayMidnight.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const summary = stats?.guidances_summary?.[String(g.id)];
        return {
          guidance: g,
          date: d,
          diffDays,
          progress: summary?.progress ?? 0,
          pendingMeetings: summary?.pending_meetings ?? 0,
        };
      })
      .sort((a, b) => a.diffDays - b.diffDays);
  }, [guidances, stats, today]);

  const withoutDefenseDate = useMemo(() => {
    return guidances.filter((g) => !g.defense_date);
  }, [guidances]);

  const studentsNeedingAttention = useMemo(() => {
    const list: StudentAttentionItem[] = [];

    for (const g of guidances) {
      const summary = stats?.guidances_summary?.[String(g.id)];
      const progress = summary?.progress ?? 0;
      const totalTasks = summary?.total_tasks ?? 0;
      const pendingMeetings = summary?.pending_meetings ?? 0;
      const reasons: string[] = [];
      let severity: 'high' | 'medium' = 'medium';

      if (pendingMeetings > 0) {
        reasons.push(
          `${pendingMeetings} ${pendingMeetings === 1 ? 'reunião aguardando' : 'reuniões aguardando'} resposta`
        );
        severity = 'high';
      }

      if (g.defense_date) {
        const d = new Date(g.defense_date);
        const targetMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diffDays = Math.ceil((targetMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 30 && progress < 60) {
          reasons.push(`Banca em ${diffDays} dias com apenas ${progress}% concluído`);
          severity = 'high';
        } else if (diffDays >= 0 && diffDays <= 15) {
          reasons.push(`Banca próxima (faltam ${diffDays} dias)`);
        }
      }

      if (totalTasks === 0) {
        reasons.push('Quadro Kanban ainda sem tarefas criadas');
      }

      if (reasons.length > 0) {
        list.push({ guidance: g, reasons, severity });
      }
    }

    return list.sort((a, b) => (a.severity === 'high' ? -1 : 1));
  }, [guidances, stats, today]);

  const cohortStages = useMemo(() => {
    let initialPhase = 0;
    let devPhase = 0;
    let finalPhase = 0;

    guidances.forEach((g) => {
      const p = stats?.guidances_summary?.[String(g.id)]?.progress ?? 0;
      if (p >= 80) finalPhase++;
      else if (p >= 31) devPhase++;
      else initialPhase++;
    });

    const total = guidances.length || 1;
    return {
      initialPhase,
      devPhase,
      finalPhase,
      initialPct: Math.round((initialPhase / total) * 100),
      devPct: Math.round((devPhase / total) * 100),
      finalPct: Math.round((finalPhase / total) * 100),
    };
  }, [guidances, stats]);

  return {
    upcomingDefenses,
    withoutDefenseDate,
    studentsNeedingAttention,
    cohortStages,
  };
}
