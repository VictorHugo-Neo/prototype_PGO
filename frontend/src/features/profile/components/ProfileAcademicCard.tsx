import { GraduationCap, User, Users, Calendar, Clock } from 'lucide-react';
import type { StudentGuidance } from '../../../types';

interface ProfileAcademicCardProps {
  isStudent: boolean;
  guidance: StudentGuidance | null;
}

export function ProfileAcademicCard({ isStudent, guidance }: ProfileAcademicCardProps) {
  if (!isStudent) {
    return null;
  }

  if (!guidance) {
    return (
      <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-amber-800">
        <div className="flex items-center gap-2 font-semibold text-xs text-amber-900 mb-1">
          <Clock size={16} />
          <span>Vínculo de Orientação Pendente</span>
        </div>
        <p className="text-xs text-amber-700 leading-relaxed">
          Você ainda não possui um orientador cadastrado neste projeto. Assim que seu orientador vincular seu e-mail, os dados do seu TCC aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <GraduationCap size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-800">Dados Acadêmicos do TCC</h2>
          <p className="text-[11px] text-gray-500">Informações vinculadas ao seu trabalho de conclusão</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Tema da Pesquisa
          </span>
          <span className="font-semibold text-gray-800 text-sm">{guidance.theme}</span>
        </div>

        <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            <User size={12} />
            <span>Professor Orientador</span>
          </div>
          <span className="font-semibold text-gray-800 block">
            {guidance.advisor ? guidance.advisor.name : 'Não informado'}
          </span>
          {guidance.advisor && (
            <span className="text-gray-500 text-[11px] block">{guidance.advisor.email}</span>
          )}
        </div>

        {guidance.coadvisor && (
          <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              <Users size={12} />
              <span>Docente Coorientador</span>
            </div>
            <span className="font-semibold text-gray-800 block">{guidance.coadvisor.name}</span>
            <span className="text-gray-500 text-[11px] block">{guidance.coadvisor.email}</span>
          </div>
        )}

        {guidance.defense_date && (
          <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              <Calendar size={12} />
              <span>Data Prevista da Banca</span>
            </div>
            <span className="font-semibold text-gray-800 block">
              {new Date(guidance.defense_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
