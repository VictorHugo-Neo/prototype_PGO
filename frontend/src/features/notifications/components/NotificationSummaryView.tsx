import { CheckCircle2, AlertTriangle, XCircle, Send, RotateCcw } from 'lucide-react';
import type { NotificationSendSummary } from '../../../types';

interface NotificationSummaryViewProps {
  summary: NotificationSendSummary;
  onReset: () => void;
  onClose: () => void;
}

export function NotificationSummaryView({
  summary,
  onReset,
  onClose,
}: NotificationSummaryViewProps) {
  return (
    <div className="space-y-5 py-1">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 size={26} />
        </div>
        <h3 className="text-base font-bold text-gray-800">
          Notificações Processadas com Sucesso!
        </h3>
        <p className="text-xs text-gray-500">
          O lote de notificações foi despachado para os destinatários selecionados.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 text-center">
          <span className="text-[10px] text-gray-500 block uppercase font-semibold">
            Destinatários
          </span>
          <span className="text-xl font-bold text-gray-800 block mt-0.5">
            {summary.total_targeted}
          </span>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
          <span className="text-[10px] text-blue-700 block uppercase font-semibold">
            Plataforma
          </span>
          <span className="text-xl font-bold text-blue-700 block mt-0.5">
            {summary.platform_count}
          </span>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
          <span className="text-[10px] text-emerald-700 block uppercase font-semibold">
            WhatsApp
          </span>
          <span className="text-xl font-bold text-emerald-700 block mt-0.5">
            {summary.whatsapp_count}
          </span>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
          <span className="text-[10px] text-amber-700 block uppercase font-semibold">
            Sem Telefone
          </span>
          <span className="text-xl font-bold text-amber-700 block mt-0.5">
            {summary.whatsapp_skipped_no_phone_count}
          </span>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold sticky top-0">
            <tr>
              <th className="py-2 px-3">Estudante</th>
              <th className="py-2 px-3 text-center">Plataforma</th>
              <th className="py-2 px-3 text-center">WhatsApp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {summary.results.map((res) => (
              <tr key={res.student_id} className="hover:bg-gray-50/50">
                <td className="py-2 px-3">
                  <span className="font-semibold text-gray-800 block">
                    {res.student_name}
                  </span>
                  <span className="text-[10px] text-gray-400 block">
                    {res.student_phone || 'Sem telefone'}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  {res.platform_success ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} /> Entregue
                    </span>
                  ) : (
                    <span className="text-gray-400 text-[11px]">—</span>
                  )}
                </td>
                <td className="py-2 px-3 text-center">
                  {res.whatsapp_success ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} /> Enviado
                    </span>
                  ) : res.whatsapp_skipped_no_phone ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      <AlertTriangle size={11} /> Ignorado
                    </span>
                  ) : res.whatsapp_error ? (
                    <span
                      title={res.whatsapp_error}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full"
                    >
                      <XCircle size={11} /> Falha
                    </span>
                  ) : (
                    <span className="text-gray-400 text-[11px]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer active:scale-95"
        >
          <RotateCcw size={14} />
          Enviar Outra
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer active:scale-95"
        >
          <Send size={14} />
          Concluir
        </button>
      </div>
    </div>
  );
}
