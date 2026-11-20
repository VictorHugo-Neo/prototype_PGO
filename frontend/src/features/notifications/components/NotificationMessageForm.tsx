import { useState } from 'react';
import { Sparkles, Eye, Edit3 } from 'lucide-react';
import type { NotificationChannel } from '../../../types';

interface NotificationMessageFormProps {
  title: string;
  message: string;
  channel: NotificationChannel;
  advisorName?: string;
  onTitleChange: (title: string) => void;
  onMessageChange: (message: string) => void;
  disabled?: boolean;
}

export function NotificationMessageForm({
  title,
  message,
  channel,
  advisorName = 'Orientador',
  onTitleChange,
  onMessageChange,
  disabled = false,
}: NotificationMessageFormProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const templates = [
    {
      label: '📅 Lembrete de Reunião',
      title: 'Lembrete de Reunião Semanal',
      text: 'Olá! Não se esqueça da nossa reunião de acompanhamento agendada para esta semana. Traga suas dúvidas e os pontos atualizados do seu cronograma.',
    },
    {
      label: '📝 Revisão de Capítulo',
      title: 'Feedback sobre o Capítulo',
      text: 'Finalizei a leitura da última versão enviada. Adicionei apontamentos importantes no documento. Por favor, verifique assim que possível para alinharmos.',
    },
    {
      label: '⏰ Atenção aos Prazos',
      title: 'Atenção aos Prazos de Entrega',
      text: 'Lembro que a data limite da próxima entrega está próxima. Mantenha as tarefas atualizadas no seu quadro Kanban para acompanhamento.',
    },
  ];

  const applyTemplate = (t: { title: string; text: string }) => {
    onTitleChange(t.title);
    onMessageChange(t.text);
  };

  const maxChars = 1000;
  const charsRemaining = maxChars - message.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700">
          Conteúdo da Notificação
        </label>
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-white text-gray-800 shadow-2xs font-semibold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Edit3 size={12} />
            Editar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-gray-800 shadow-2xs font-semibold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Eye size={12} />
            Pré-visualizar
          </button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" /> Modelos rápidos:
            </span>
            {templates.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                disabled={disabled}
                onClick={() => applyTemplate(tpl)}
                className="text-[11px] bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {tpl.label}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="notif-title" className="block text-[11px] font-medium text-gray-600 mb-1">
              Assunto / Título (Opcional)
            </label>
            <input
              id="notif-title"
              type="text"
              disabled={disabled}
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Ex: Lembrete de entrega do capítulo 2"
              className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-xs text-gray-800 outline-none shadow-2xs transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="notif-message" className="block text-[11px] font-medium text-gray-600">
                Mensagem <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-[10px] ${
                  charsRemaining < 50 ? 'text-red-500 font-semibold' : 'text-gray-400'
                }`}
              >
                {message.length}/{maxChars}
              </span>
            </div>
            <textarea
              id="notif-message"
              rows={4}
              disabled={disabled}
              value={message}
              maxLength={maxChars}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Escreva a mensagem que deseja transmitir para o(s) orientando(s)..."
              className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-3 text-xs text-gray-800 outline-none shadow-2xs transition-colors resize-y min-h-[90px]"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
          <span className="text-[11px] font-semibold text-gray-600 block uppercase tracking-wider">
            Simulação da Mensagem
          </span>

          {(channel === 'platform' || channel === 'both') && (
            <div className="bg-white border border-blue-200 rounded-xl p-3 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                  Notificação no Sistema PGO
                </span>
                <span className="text-[10px] text-gray-400">Agora mesmo</span>
              </div>
              <h4 className="text-xs font-bold text-gray-800">
                {title.trim() || 'Nova Notificação da Orientação'}
              </h4>
              <p className="text-xs text-gray-600 whitespace-pre-wrap">
                {message.trim() || '(Mensagem em branco)'}
              </p>
              <span className="text-[10px] text-gray-400 block pt-1">
                Enviada por: {advisorName}
              </span>
            </div>
          )}

          {(channel === 'whatsapp' || channel === 'both') && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                  Mensagem via WhatsApp
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">WhatsApp Notifier</span>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-emerald-100 text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                <p className="font-semibold text-emerald-900">
                  🔔 *PGO - Notificação da Orientação*
                </p>
                <p className="mt-1">
                  Olá, *Aluno*! Seu orientador *{advisorName}* enviou uma notificação:
                </p>
                {title.trim() && (
                  <p className="mt-2 font-semibold">📌 *{title.trim()}*</p>
                )}
                <p className="mt-1">{message.trim() || '(Mensagem em branco)'}</p>
                <p className="mt-2 text-gray-500 text-[11px]">
                  👉 Acesse a plataforma PGO: https://pgo.edu.br
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
