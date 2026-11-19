import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import type { DashboardTaskStat } from '../../../types';

interface TaskDistributionBarsProps {
  data: DashboardTaskStat[];
  orientation: 'columns' | 'horizontal';
  totalTasks: number;
  effectiveIndex: number | null;
  selectedSlug: string | null;
  onItemToggle: (index: number) => void;
  onHoverIndex: (index: number | null) => void;
}

export function TaskDistributionBars({
  data,
  orientation,
  totalTasks,
  effectiveIndex,
  selectedSlug,
  onItemToggle,
  onHoverIndex,
}: TaskDistributionBarsProps) {
  const handleMouseMove = (state: unknown) => {
    const s = state as { activeTooltipIndex?: unknown } | undefined;
    const idx = s?.activeTooltipIndex;
    if (typeof idx === 'number' && selectedSlug === null) {
      onHoverIndex(idx);
    }
  };

  const handleMouseLeave = () => {
    if (selectedSlug === null) {
      onHoverIndex(null);
    }
  };

  return (
    <div className="h-56 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 300, height: 224 }}>
        {orientation === 'columns' ? (
          <BarChart
            data={data}
            margin={{ top: 22, right: 10, left: -20, bottom: 5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 500 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
              formatter={(value: unknown, _name: unknown, props: { payload?: DashboardTaskStat }) => {
                const num = Number(value) || 0;
                const pct = totalTasks > 0 ? Math.round((num / totalTasks) * 100) : 0;
                const entry = props.payload;
                return [`${num} tarefas (${pct}%)`, entry?.name || 'Coluna'];
              }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
                fontWeight: 500,
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '8px 12px',
              }}
            />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
              cursor="pointer"
              onClick={(_, index) => onItemToggle(index)}
            >
              <LabelList
                dataKey="value"
                position="top"
                formatter={(val: unknown) => (Number(val) > 0 ? Number(val) : '')}
                style={{ fontSize: '11px', fontWeight: 700, fill: '#334155' }}
              />
              {data.map((entry, index) => {
                const isHighlighted = effectiveIndex === null || effectiveIndex === index;
                return (
                  <Cell
                    key={`col-cell-${index}`}
                    fill={entry.color}
                    opacity={isHighlighted ? 1 : 0.35}
                    stroke={effectiveIndex === index ? '#1E293B' : 'transparent'}
                    strokeWidth={effectiveIndex === index ? 2 : 0}
                    style={{ transition: 'opacity 200ms ease' }}
                  />
                );
              })}
            </Bar>
          </BarChart>
        ) : (
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={90}
              tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
              formatter={(value: unknown, _name: unknown, props: { payload?: DashboardTaskStat }) => {
                const num = Number(value) || 0;
                const pct = totalTasks > 0 ? Math.round((num / totalTasks) * 100) : 0;
                const entry = props.payload;
                return [`${num} tarefas (${pct}%)`, entry?.name || 'Coluna'];
              }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
                fontWeight: 500,
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '8px 12px',
              }}
            />
            <Bar
              dataKey="value"
              radius={[0, 8, 8, 0]}
              maxBarSize={24}
              cursor="pointer"
              onClick={(_, index) => onItemToggle(index)}
            >
              <LabelList
                dataKey="value"
                position="right"
                formatter={(val: unknown) => {
                  const num = Number(val);
                  if (num <= 0) return '';
                  const pct = totalTasks > 0 ? Math.round((num / totalTasks) * 100) : 0;
                  return `${num} (${pct}%)`;
                }}
                style={{ fontSize: '11px', fontWeight: 600, fill: '#475569' }}
              />
              {data.map((entry, index) => {
                const isHighlighted = effectiveIndex === null || effectiveIndex === index;
                return (
                  <Cell
                    key={`horiz-cell-${index}`}
                    fill={entry.color}
                    opacity={isHighlighted ? 1 : 0.35}
                    stroke={effectiveIndex === index ? '#1E293B' : 'transparent'}
                    strokeWidth={effectiveIndex === index ? 2 : 0}
                    style={{ transition: 'opacity 200ms ease' }}
                  />
                );
              })}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
