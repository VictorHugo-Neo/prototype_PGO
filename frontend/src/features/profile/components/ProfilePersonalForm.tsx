import { useState, useEffect } from 'react';
import { User, Mail, Phone, Loader2, Save } from 'lucide-react';
import type { ProfileFormData } from '../types';

interface ProfilePersonalFormProps {
  initialData: ProfileFormData;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isSaving: boolean;
}

export function ProfilePersonalForm({
  initialData,
  onSubmit,
  isSaving,
}: ProfilePersonalFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-2xl border border-gray-100 shadow-2xs space-y-4"
    >
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-800">Dados Pessoais</h2>
        <p className="text-[11px] text-gray-500">Atualize seu nome completo, e-mail institucional e telefone de contato.</p>
      </div>

      <div>
        <label htmlFor="profile-name" className="block text-xs font-semibold text-gray-700 mb-1">
          Nome Completo
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400" size={17} aria-hidden="true" />
          <input
            id="profile-name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Nome Completo do Aluno"
          />
        </div>
      </div>

      <div>
        <label htmlFor="profile-email" className="block text-xs font-semibold text-gray-700 mb-1">
          E-mail Institucional
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={17} aria-hidden="true" />
          <input
            id="profile-email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="aluno@instituicao.edu.br"
          />
        </div>
      </div>

      <div>
        <label htmlFor="profile-phone" className="block text-xs font-semibold text-gray-700 mb-1">
          Telefone / WhatsApp (Opcional)
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 text-gray-400" size={17} aria-hidden="true" />
          <input
            id="profile-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="(11) 98765-4321"
          />
        </div>
      </div>

      <div className="flex justify-end pt-3">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{isSaving ? 'Salvando...' : 'Salvar Informações'}</span>
        </button>
      </div>
    </form>
  );
}
