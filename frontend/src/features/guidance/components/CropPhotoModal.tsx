import { useState } from 'react';
import Cropper from 'react-easy-crop';
import { X, Loader2 } from 'lucide-react';
import { getCroppedImg } from '../../../utils/cropImage';

interface CropPhotoModalProps {
  imageSrc: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCrop: (croppedBlob: Blob) => Promise<void>;
}

export function CropPhotoModal({
  imageSrc,
  isOpen,
  onClose,
  onSaveCrop,
}: CropPhotoModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !imageSrc) return null;

  const handleSave = async () => {
    if (!croppedAreaPixels || isSaving) return;

    setIsSaving(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedBlob) {
        await onSaveCrop(croppedBlob);
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-crop-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 id="modal-crop-title" className="font-bold text-gray-700">
            Ajustar Foto de Perfil
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative h-64 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-4 flex flex-col gap-4 bg-white">
          <label className="text-xs font-semibold text-gray-500 uppercase">
            Zoom
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-blue-600 mt-1"
            />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {isSaving ? 'Salvando...' : 'Salvar Foto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
