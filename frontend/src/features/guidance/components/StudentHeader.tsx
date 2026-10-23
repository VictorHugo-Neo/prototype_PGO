import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Plus,
  Camera,
  Users,
  Loader2,
  ChevronDown,
  Download,
  ExternalLink,
} from 'lucide-react';
import type { StudentGuidance } from '../../../types';
import { API_BASE_URL } from '../../../services/api';

interface StudentHeaderProps {
  guidance: StudentGuidance;
  myUserId: number;
  meetingsCount: number;
  imgError: boolean;
  isGeneratingPdf?: boolean;
  onImgError: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateDefenseDate: (date: string) => Promise<void>;
  onOpenMeetingsModal: () => void;
  onDownloadReport: () => void;
  onPreviewReport?: () => void;
  onOpenCreateTaskModal: () => void;
}

export function StudentHeader({
  guidance,
  myUserId,
  meetingsCount,
  imgError,
  isGeneratingPdf = false,
  onImgError,
  onFileChange,
  onUpdateDefenseDate,
  onOpenMeetingsModal,
  onDownloadReport,
  onPreviewReport,
  onOpenCreateTaskModal,
}: StudentHeaderProps) {
  const navigate = useNavigate();
  const isStudent = myUserId === guidance.student.id;
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
  const reportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reportMenuRef.current && !reportMenuRef.current.contains(event.target as Node)) {
        setIsReportMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsReportMenuOpen(false);
      }
    };

    if (isReportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isReportMenuOpen]);

  const handlePreviewClick = () => {
    setIsReportMenuOpen(false);
    if (onPreviewReport) {
      onPreviewReport();
    } else {
      onDownloadReport();
    }
  };

  const handleDownloadClick = () => {
    setIsReportMenuOpen(false);
    onDownloadReport();
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="relative group">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg overflow-hidden border-2 border-white shadow-sm">
                {guidance.student.avatar_path && !imgError ? (
                  <img
                    src={`${API_BASE_URL}/${guidance.student.avatar_path.replace(/\\/g, '/')}`}
                    alt={`Foto de ${guidance.student.name}`}
                    className="w-full h-full object-cover"
                    onError={onImgError}
                  />
                ) : (
                  <span>{guidance.student.name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              {isStudent && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 shadow-md flex items-center justify-center">
                  <Camera size={12} aria-hidden="true" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={onFileChange}
                    aria-label="Alterar foto de perfil"
                  />
                </label>
              )}
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-800">{guidance.student.name}</h1>
              <p className="text-gray-500 text-xs mt-0.5 mb-1.5">
                Tema: <span className="font-medium text-blue-600">{guidance.theme}</span>
              </p>
              <div className="flex items-center gap-2 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 w-fit">
                <label
                  htmlFor="defense-date-input"
                  className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1"
                >
                  <Calendar size={12} aria-hidden="true" /> Banca:
                </label>
                <input
                  id="defense-date-input"
                  type="datetime-local"
                  className="text-xs bg-transparent text-gray-700 focus:outline-none font-medium"
                  value={
                    guidance.defense_date
                      ? new Date(guidance.defense_date).toISOString().slice(0, 16)
                      : ''
                  }
                  onChange={(e) => onUpdateDefenseDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <button
              type="button"
              onClick={onOpenMeetingsModal}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 text-xs font-medium bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors border border-gray-200"
            >
              <Users size={16} aria-hidden="true" />
              Reuniões ({meetingsCount})
            </button>

            <div className="relative" ref={reportMenuRef}>
              <button
                type="button"
                onClick={() => setIsReportMenuOpen((prev) => !prev)}
                disabled={isGeneratingPdf}
                aria-expanded={isReportMenuOpen}
                aria-haspopup="menu"
                aria-label="Ações de Relatório em PDF"
                className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-all border ${
                  isGeneratingPdf
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-gray-50 text-gray-700 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 border-gray-200 shadow-sm'
                }`}
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-blue-600" aria-hidden="true" />
                    <span>Gerando PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText size={16} className="text-blue-600" aria-hidden="true" />
                    <span>PDF Relatório</span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform ${
                        isReportMenuOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>

              {isReportMenuOpen && !isGeneratingPdf && (
                <div
                  role="menu"
                  aria-orientation="vertical"
                  className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-1"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handlePreviewClick}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 text-gray-700 hover:text-blue-700 flex items-start gap-2.5 transition-colors group"
                  >
                    <ExternalLink size={16} className="mt-0.5 text-blue-500 group-hover:text-blue-600 shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-xs font-semibold">Visualizar Relatório</div>
                      <div className="text-[11px] text-gray-500 group-hover:text-blue-600">
                        Abrir em nova aba do navegador
                      </div>
                    </div>
                  </button>

                  <div className="h-px bg-gray-100 my-1" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleDownloadClick}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 flex items-start gap-2.5 transition-colors group"
                  >
                    <Download size={16} className="mt-0.5 text-emerald-500 group-hover:text-emerald-600 shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-xs font-semibold">Baixar Arquivo PDF</div>
                      <div className="text-[11px] text-gray-500 group-hover:text-emerald-600">
                        Download com formatação oficial
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenCreateTaskModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus size={16} aria-hidden="true" /> Nova Tarefa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
