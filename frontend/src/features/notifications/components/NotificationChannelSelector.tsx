import { Monitor, MessageSquare, Zap } from 'lucide-react';
import type { NotificationChannel } from '../../../types';

interface NotificationChannelSelectorProps {
  channel: NotificationChannel;
  onChange: (channel: NotificationChannel) => void;
  disabled?: boolean;
}

export function NotificationChannelSelector({
  channel,
  onChange,
  disabled = false,
}: NotificationChannelSelectorProps) {
  const options: {
    value: NotificationChannel;
    title: string;
    description: string;
    icon: typeof Monitor;
    badge?: string;
  }[] = [
    {
      value: 'platform',
      title: 'Plataforma',
      description: 'Notificação interna visível no painel do sistema.',
      icon: Monitor,
    },
    {
      value: 'whatsapp',
      title: 'WhatsApp',
      description: 'Mensagem instantânea via microserviço de mensageria.',
      icon: MessageSquare,
    },
    {
      value: 'both',
      title: 'Ambos',
      description: 'Envio simultâneo na plataforma e no WhatsApp.',
      icon: Zap,
      badge: 'Recomendado',
    },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-700">
        Canal de Envio
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = channel === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={`relative flex flex-col items-start text-left p-3 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 shadow-2xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/70 shadow-2xs'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.99]'}`}
            >
              {opt.badge && (
                <span className="absolute top-2.5 right-2.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {opt.badge}
                </span>
              )}
              <div
                className={`p-1.5 rounded-lg mb-2 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Icon size={16} />
              </div>
              <span className="text-xs font-bold text-gray-800">{opt.title}</span>
              <span className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
