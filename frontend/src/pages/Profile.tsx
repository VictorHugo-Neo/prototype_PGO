import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Trash2 } from 'lucide-react';
import { userService, guidanceService, authService } from '../services/api';
import type { User, StudentGuidance } from '../types';
import type { ProfileFormData, ProfileStatusMessage } from '../features/profile/types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProfileHeader } from '../features/profile/components/ProfileHeader';
import { ProfileAvatarSection } from '../features/profile/components/ProfileAvatarSection';
import { ProfileAcademicCard } from '../features/profile/components/ProfileAcademicCard';
import { ProfilePersonalForm } from '../features/profile/components/ProfilePersonalForm';
import { ProfileSecurityForm } from '../features/profile/components/ProfileSecurityForm';
import { ProfileDeleteModal } from '../features/profile/components/ProfileDeleteModal';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [guidance, setGuidance] = useState<StudentGuidance | null>(null);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isAvatarBusy, setIsAvatarBusy] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [statusMessage, setStatusMessage] = useState<ProfileStatusMessage | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const userData = await userService.getMe();
      setUser(userData);
      if (userData.type === 'student') {
        try {
          const guidanceData = await guidanceService.getStudentGuidance();
          setGuidance(guidanceData);
        } catch {
          setGuidance(null);
        }
      }
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSavePersonal = async (data: ProfileFormData) => {
    setIsSavingPersonal(true);
    setStatusMessage(null);
    try {
      const updated = await userService.updateMe({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
      });
      setUser(updated);
      setStatusMessage({ type: 'success', text: 'Dados pessoais atualizados com sucesso!' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setStatusMessage({ type: 'error', text: axiosErr.response?.data?.detail || 'Erro ao atualizar dados.' });
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleSaveSecurity = async (password: string) => {
    setIsSavingSecurity(true);
    setStatusMessage(null);
    try {
      await userService.updateMe({ password });
      setStatusMessage({ type: 'success', text: 'Senha de acesso atualizada com sucesso!' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setStatusMessage({ type: 'error', text: axiosErr.response?.data?.detail || 'Erro ao atualizar senha.' });
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleUploadAvatar = async (file: File) => {
    setIsAvatarBusy(true);
    setStatusMessage(null);
    try {
      const updated = await userService.uploadAvatar(file);
      setUser(updated);
      setStatusMessage({ type: 'success', text: 'Foto de perfil atualizada!' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setStatusMessage({ type: 'error', text: axiosErr.response?.data?.detail || 'Erro ao enviar foto.' });
    } finally {
      setIsAvatarBusy(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsAvatarBusy(true);
    setStatusMessage(null);
    try {
      const updated = await userService.deleteAvatar();
      setUser(updated);
      setStatusMessage({ type: 'success', text: 'Foto de perfil removida!' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setStatusMessage({ type: 'error', text: axiosErr.response?.data?.detail || 'Erro ao remover foto.' });
    } finally {
      setIsAvatarBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await userService.deleteMe();
      authService.logout();
      navigate('/');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setStatusMessage({ type: 'error', text: axiosErr.response?.data?.detail || 'Erro ao excluir conta.' });
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading || !user) {
    return <LoadingSpinner fullScreen message="Carregando dados do perfil..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 flex justify-center items-start">
      <div className="max-w-2xl w-full space-y-6">
        <ProfileHeader userType={user.type} onBack={() => navigate(-1)} />

        {statusMessage && (
          <div
            role={statusMessage.type === 'error' ? 'alert' : 'status'}
            className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2 ${
              statusMessage.type === 'error'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            {statusMessage.type === 'success' && <Check size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <ProfileAvatarSection
          name={user.name}
          avatarPath={user.avatar_path}
          onUpload={handleUploadAvatar}
          onDelete={handleDeleteAvatar}
          isLoading={isAvatarBusy}
        />

        <ProfileAcademicCard isStudent={user.type === 'student'} guidance={guidance} />

        <ProfilePersonalForm
          initialData={{ name: user.name, email: user.email, phone: user.phone || '' }}
          onSubmit={handleSavePersonal}
          isSaving={isSavingPersonal}
        />

        <ProfileSecurityForm onSubmit={handleSaveSecurity} isSaving={isSavingSecurity} />

        <div className="p-5 bg-white rounded-2xl border border-red-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-bold text-red-600">Zona de Perigo</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Excluir definitivamente sua conta e dados do sistema.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Excluir Conta</span>
          </button>
        </div>

        <ProfileDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteAccount}
          isDeleting={isDeletingAccount}
        />
      </div>
    </div>
  );
}
