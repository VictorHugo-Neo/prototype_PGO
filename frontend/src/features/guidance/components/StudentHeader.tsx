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
  GraduationCap,
  Clock,
  Pencil,
  Trash2,
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
  onUpdateDefenseDate?: (date: string) => Promise<void>;
  onOpenDefenseModal?: () => void;
  onDeleteDefenseDate?: () => Promise<void>;
  onOpenMeetingsModal: () => void;
  onDownloadReport: () => void;
  onPreviewReport?: () => void;
  onOpenCreateTaskModal: () => void;
}

function getDefenseDateMeta(defenseDate?: string | null) {
  if (!defenseDate) return null;
  const d = new Date(defenseDate);
  if (isNaN(d.getTime())) return null;

  const dateFormatted = d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeFormatted = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let badgeText = '';
  let badgeClass = '';

  if (diffDays < 0) {
    badgeText = 'Realizada';
    badgeClass = 'bg-gray-100 text-gray-600 border border-gray-200';
  } else if (diffDays === 0) {
    badgeText = 'Hoje!';
    badgeClass = 'bg-purple-100 text-purple-700 border border-purple-200 font-bold';
  } else if (diffDays <= 7) {
    badgeText = `Faltam ${diffDays}d`;
    badgeClass = 'bg-amber-100 text-amber-800 border border-amber-200 font-bold';
  } else {
    badgeText = `Em ${diffDays}d`;
    badgeClass = 'bg-blue-100 text-blue-700 border border-blue-200';
  }

  return {
    dateFormatted,
    timeFormatted,
    badgeText,
    badgeClass,
  };
}

export function StudentHeader({
  guidance,
  myUserId,
  meetingsCount,
  imgError,
  isGeneratingPdf = false,
  onImgError,
  onFileChange,
  onOpenDefenseModal,
  onDeleteDefenseDate,
  onOpenMeetingsModal,
  onDownloadReport,
  onPreviewReport,
  onOpenCreateTaskModal,
}: StudentHeaderProps) {
  const navigate = useNavigate();
  const isStudent = myUserId === guidance.student.id;
  const isAdvisor = !isStudent || Boolean(guidance.advisor && myUserId === guidance.advisor.id);
  const defenseMeta = getDefenseDateMeta(guidance.defense_date);
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
              {defenseMeta ? (
                <div
                  data-testid="defense-date-badge"
                  className="flex items-center gap-2.5 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-2xs w-fit"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <GraduationCap size={15} aria-hidden="true" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Banca:
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${defenseMeta.badgeClass}`}>
                        {defenseMeta.badgeText}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-800 mt-1">
                      {defenseMeta.dateFormatted} às {defenseMeta.timeFormatted}
                    </span>
                  </div>

                  {isAdvisor && onOpenDefenseModal && (
                    <div className="flex items-center gap-0.5 ml-2 pl-2 border-l border-gray-100">
                      <button
                        type="button"
                        onClick={onOpenDefenseModal}
                        data-testid="edit-defense-date-btn"
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Reagendar data da banca"
                        aria-label="Reagendar data da banca"
                      >
                        <Pencil size={13} />
                      </button>
                      {onDeleteDefenseDate && (
                        <button
                          type="button"
                          onClick={onDeleteDefenseDate}
                          data-testid="delete-defense-date-btn"
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Desmarcar data da banca"
                          aria-label="Desmarcar data da banca"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : isAdvisor && onOpenDefenseModal ? (
                <button
                  type="button"
                  onClick={onOpenDefenseModal}
                  data-testid="schedule-defense-btn"
                  className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100/90 text-blue-700 hover:text-blue-800 border border-blue-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-2xs group"
                  title="Agendar data da apresentação da banca examinadora"
                >
                  <Calendar size={13} className="text-blue-600 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <span>+ Agendar Data da Banca</span>
                </button>
              ) : (
                <div
                  data-testid="defense-date-pending"
                  className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 text-gray-500 px-3 py-1.5 rounded-xl text-xs font-medium w-fit"
                  title="A data da banca examinadora ainda não foi definida pelo orientador"
                >
                  <Clock size={13} className="text-gray-400" aria-hidden="true" />
                  <span>Banca: <strong className="font-semibold text-gray-600">A definir</strong></span>
                </div>
              )}
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
