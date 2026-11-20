import { useState } from 'react';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../../services/api';

interface ProfileAvatarSectionProps {
  name: string;
  avatarPath?: string;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading?: boolean;
}

export function ProfileAvatarSection({
  name,
  avatarPath,
  onUpload,
  onDelete,
  isLoading = false,
}: ProfileAvatarSectionProps) {
  const [imgError, setImgError] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImgError(false);
      await onUpload(file);
      e.target.value = '';
    }
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'AL';

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-white rounded-2xl border border-gray-100 shadow-2xs">
      <div className="relative group">
        <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-white shadow-sm">
          {avatarPath && !imgError ? (
            <img
              src={`${API_BASE_URL}/${avatarPath.replace(/\\/g, '/')}`}
              alt={`Foto de ${name}`}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </div>

      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-sm font-bold text-gray-800">Foto de Perfil</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Envie uma imagem quadrada em formato PNG, JPG ou WebP.
        </p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3">
          <label className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:opacity-50">
            {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
            <span>Alterar Foto</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isLoading}
              onChange={handleFileChange}
              aria-label="Upload de foto de perfil"
            />
          </label>

          {avatarPath && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={13} />
              <span>Remover Foto</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
