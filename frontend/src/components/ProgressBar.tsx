interface ProgressBarProps {
  progress: number; 
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5" role="progressbar" aria-valuenow={safeProgress}>
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
        style={{ width: `${safeProgress}%` }}
      ></div>
    </div>
  );
}