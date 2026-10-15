import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  message = 'Carregando dados...',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div
      className="flex flex-col items-center justify-center gap-3 p-6"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" aria-hidden="true" />
      <span className="text-sm font-medium text-gray-600">{message}</span>
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">{content}</div>;
  }

  return content;
}
