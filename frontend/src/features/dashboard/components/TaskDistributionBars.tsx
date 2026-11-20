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
    <div className="h-60 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 300, height: 240 }}>
        {orientation === 'columns' ? (
          <BarChart
            data={data}
            margin={{ top: 24, right: 10, left: -20, bottom: 5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(59, 130, 246, 0.04)' }}
              formatter={(value: unknown, _name: unknown, props: { payload?: DashboardTaskStat }) => {
                const num = Number(value) || 0;
                const pct = totalTasks > 0 ? Math.round((num / totalTasks) * 100) : 0;
                const entry = props.payload;
                return [`${num} tarefas (${pct}%)`, entry?.name || 'Coluna'];
              }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                fontWeight: 600,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
                padding: '8px 12px',
              }}
            />
            <Bar
              dataKey="value"
              radius={[8, 8, 2, 2]}
              maxBarSize={44}
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
                    opacity={isHighlighted ? 1 : 0.3}
                    stroke={effectiveIndex === index ? '#0f172a' : 'transparent'}
                    strokeWidth={effectiveIndex === index ? 2 : 0}
                    style={{ transition: 'opacity 200ms ease, transform 200ms ease' }}
                  />
                );
              })}
            </Bar>
          </BarChart>
        ) : (
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 40, left: 10, bottom: 5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={90}
              tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(59, 130, 246, 0.04)' }}
              formatter={(value: unknown, _name: unknown, props: { payload?: DashboardTaskStat }) => {
                const num = Number(value) || 0;
                const pct = totalTasks > 0 ? Math.round((num / totalTasks) * 100) : 0;
                const entry = props.payload;
                return [`${num} tarefas (${pct}%)`, entry?.name || 'Coluna'];
              }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                fontWeight: 600,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                padding: '8px 12px',
              }}
            />
            <Bar
              dataKey="value"
              radius={[0, 8, 8, 0]}
              maxBarSize={22}
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
                    opacity={isHighlighted ? 1 : 0.3}
                    stroke={effectiveIndex === index ? '#0f172a' : 'transparent'}
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
