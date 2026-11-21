interface TaskDistributionInsightProps {
  insight: {
    icon: React.ReactNode;
    text: string;
  } | null;
}

export function TaskDistributionInsight({ insight }: TaskDistributionInsightProps) {
  if (!insight) return null;

  return (
    <div className="mt-3 pt-2">
      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50/80 px-3 py-2 rounded-xl">
        {insight.icon}
        <span className="font-medium text-gray-700 leading-tight">{insight.text}</span>
      </div>
    </div>
  );
}
