import { Users, User, AlertCircle, Phone, CheckCircle2 } from 'lucide-react';
import type { NotificationTargetType, NotificationChannel } from '../../../types';
import type { RecipientOption } from '../types';

interface NotificationRecipientSelectorProps {
  targetType: NotificationTargetType;
  selectedStudentId?: number;
  channel: NotificationChannel;
  recipients: RecipientOption[];
  onTargetTypeChange: (type: NotificationTargetType) => void;
  onSelectStudent: (studentId: number) => void;
  disabled?: boolean;
}

export function NotificationRecipientSelector({
  targetType,
  selectedStudentId,
  channel,
  recipients,
  onTargetTypeChange,
  onSelectStudent,
  disabled = false,
}: NotificationRecipientSelectorProps) {
  const selectedStudent = recipients.find((r) => r.id === selectedStudentId);
  const totalCount = recipients.length;
  const withPhoneCount = recipients.filter((r) => r.hasPhone).length;
  const withoutPhoneCount = totalCount - withPhoneCount;

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-gray-700">
        Destinatário(s)
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={disabled || totalCount === 0}
          onClick={() => onTargetTypeChange('all')}
          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            targetType === 'all'
              ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 shadow-2xs'
              : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/70 shadow-2xs'
          } ${disabled || totalCount === 0 ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.99]'}`}
        >
          <div
            className={`p-2 rounded-lg ${
              targetType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Users size={18} />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-800">
              Todos os Orientandos ({totalCount})
            </span>
            <span className="block text-[11px] text-gray-500 mt-0.5">
              Disparo simultâneo para todos os alunos vinculados.
            </span>
          </div>
        </button>

        <button
          type="button"
          disabled={disabled || totalCount === 0}
          onClick={() => {
            onTargetTypeChange('individual');
            if (!selectedStudentId && recipients.length > 0) {
              onSelectStudent(recipients[0].id);
            }
          }}
          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            targetType === 'individual'
              ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 shadow-2xs'
              : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/70 shadow-2xs'
          } ${disabled || totalCount === 0 ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.99]'}`}
        >
          <div
            className={`p-2 rounded-lg ${
              targetType === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <User size={18} />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-800">
              Aluno Individual
            </span>
            <span className="block text-[11px] text-gray-500 mt-0.5">
              Selecione um orientando específico da lista.
            </span>
          </div>
        </button>
      </div>

      {targetType === 'individual' && (
        <div className="space-y-1.5 pt-1">
          <label htmlFor="student-select" className="block text-[11px] font-medium text-gray-600">
            Selecione o Orientando
          </label>
          <div className="relative">
            <select
              id="student-select"
              disabled={disabled}
              value={selectedStudentId ?? ''}
              onChange={(e) => onSelectStudent(Number(e.target.value))}
              className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-xs text-gray-800 outline-none shadow-2xs transition-colors cursor-pointer"
            >
              <option value="" disabled>
                Escolha um estudante...
              </option>
              {recipients.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.name} — {rec.theme || 'Sem tema definido'}{' '}
                  {rec.hasPhone ? '📱 (WhatsApp OK)' : '⚠️ (Sem WhatsApp)'}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200/80 rounded-lg text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block text-xs">
                    {selectedStudent.name}
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    {selectedStudent.email}
                  </span>
                </div>
              </div>

              {selectedStudent.hasPhone ? (
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <CheckCircle2 size={12} />
                  <span>WhatsApp: {selectedStudent.phone}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  <Phone size={12} />
                  <span>Sem telefone cadastrado</span>
                </div>
              )}
            </div>
          )}

          {selectedStudent && !selectedStudent.hasPhone && channel !== 'platform' && (
            <div className="flex items-start gap-2 p-2.5 bg-amber-50/80 border border-amber-200 text-amber-800 rounded-lg text-[11px] leading-relaxed">
              <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <span>
                Este aluno não possui número de telefone cadastrado no perfil. O envio via WhatsApp será ignorado e ele receberá a notificação apenas na plataforma.
              </span>
            </div>
          )}
        </div>
      )}

      {targetType === 'all' && channel !== 'platform' && withoutPhoneCount > 0 && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50/80 border border-amber-200 text-amber-800 rounded-lg text-[11px] leading-relaxed">
          <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
          <span>
            {withoutPhoneCount} dos {totalCount} orientandos não possuem telefone cadastrado. Eles receberão a notificação normalmente na plataforma, mas o envio do WhatsApp será omitido para eles.
          </span>
        </div>
      )}
    </div>
  );
}
