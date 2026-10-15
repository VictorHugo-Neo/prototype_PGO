interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label = 'Progresso' }: ProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{safeProgress}%</span>
      </div>
      <div
        className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden"
        role="progressbar"
        aria-valuenow={safeProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${safeProgress}%`}
      >
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
}