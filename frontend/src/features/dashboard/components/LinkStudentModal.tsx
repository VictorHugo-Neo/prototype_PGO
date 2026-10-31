import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UserPlus, Loader2, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { guidanceService } from '../../../services/api';
import type { AvailableStudent, StudentGuidance } from '../../../types';
import { SelectedStudentCard } from './SelectedStudentCard';
import { StudentSearchCombobox } from './StudentSearchCombobox';
import { DefenseDatePicker } from './DefenseDatePicker';
import { LinkStudentSuccessView, type CreatedGuidanceSummary } from './LinkStudentSuccessView';

interface LinkStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (email: string, theme: string, defenseDate?: string) => Promise<StudentGuidance | void>;
}

const THEME_PRESETS = [
  'TCC I',
  'TCC II',
  'Iniciação Científica',
  'Estágio Supervisionado',
  'Dissertação',
];

export function LinkStudentModal({ isOpen, onClose, onLink }: LinkStudentModalProps) {
  const navigate = useNavigate();
  const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<AvailableStudent | null>(null);
  const [theme, setTheme] = useState('');
  const [defenseDate, setDefenseDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdGuidance, setCreatedGuidance] = useState<CreatedGuidanceSummary | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const resetForm = useCallback(() => {
    setSearchQuery('');
    setSelectedStudent(null);
    setTheme('');
    setDefenseDate('');
    setError('');
    setIsSubmitting(false);
    setCreatedGuidance(null);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingStudents(true);
    guidanceService
      .getAvailableStudents()
      .then((students) => {
        if (isMounted) setAvailableStudents(students);
      })
      .catch(() => {
        if (isMounted) setAvailableStudents([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingStudents(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableStudents.slice(0, 6);
    return availableStudents
      .filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
      .slice(0, 8);
  }, [availableStudents, searchQuery]);

  const isEmailPattern = searchQuery.includes('@') && searchQuery.includes('.');
  const hasExactStudentMatch = availableStudents.some(
    (s) => s.email.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  const handleSelectStudent = (student: AvailableStudent) => {
    if (student.is_already_linked) return;
    setSelectedStudent(student);
    setSearchQuery('');
    setIsDropdownOpen(false);
    setError('');
  };

  const handleSelectCustomEmail = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setSelectedStudent({
      id: 0,
      name: trimmed.split('@')[0],
      email: trimmed,
      is_already_linked: false,
    });
    setSearchQuery('');
    setIsDropdownOpen(false);
    setError('');
  };

  const handleApplyThemePreset = (preset: string) => {
    const prefix = `${preset}: `;
    const existingPreset = THEME_PRESETS.find((p) => theme.startsWith(`${p}: `));
    if (existingPreset) {
      const rest = theme.substring(existingPreset.length + 2);
      setTheme(`${prefix}${rest}`);
    } else if (!theme.trim()) {
      setTheme(prefix);
    } else {
      setTheme(`${prefix}${theme}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = selectedStudent?.email?.trim();
    if (!targetEmail || !theme.trim() || isSubmitting) return;

    setError('');
    setIsSubmitting(true);
    try {
      const defenseDateIso = defenseDate ? `${defenseDate}T14:00:00` : undefined;
      const result = await onLink(targetEmail, theme.trim(), defenseDateIso);

      const createdId = result && 'id' in result ? Number(result.id) : 0;
      setCreatedGuidance({
        id: createdId,
        theme: theme.trim(),
        studentName: selectedStudent?.name,
        studentEmail: targetEmail,
        defenseDate: defenseDate || null,
      });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const msg =
        axiosError.response?.data?.detail ||
        'Erro ao vincular aluno. Verifique se o e-mail está cadastrado como aluno.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-link-student-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-150 my-auto">
        {createdGuidance ? (
          <LinkStudentSuccessView
            guidance={createdGuidance}
            onOpenKanban={() => {
              if (createdGuidance.id) {
                navigate(`/guidance/${createdGuidance.id}`);
              } else {
                handleClose();
              }
            }}
            onClose={handleClose}
            onReset={resetForm}
          />
        ) : (
          <>
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <UserPlus size={22} />
                </div>
                <div>
                  <h3 id="modal-link-student-title" className="text-lg font-bold text-gray-800">
                    Nova Orientação
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Selecione o orientando e defina os parâmetros iniciais do projeto
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs leading-relaxed border border-red-100 flex items-start gap-2"
              >
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="student-search-input"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
                  Orientando (Aluno) *
                </label>

                {selectedStudent ? (
                  <SelectedStudentCard
                    student={selectedStudent}
                    onChangeStudent={() => setSelectedStudent(null)}
                  />
                ) : (
                  <StudentSearchCombobox
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    isLoading={isLoadingStudents}
                    isOpen={isDropdownOpen}
                    onOpenChange={setIsDropdownOpen}
                    candidates={filteredCandidates}
                    highlightedIndex={highlightedIndex}
                    onHighlightIndex={setHighlightedIndex}
                    onSelectStudent={handleSelectStudent}
                    onSelectCustomEmail={handleSelectCustomEmail}
                    isEmailPattern={isEmailPattern}
                    hasExactStudentMatch={hasExactStudentMatch}
                  />
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="guidance-theme" className="text-xs font-semibold text-gray-700">
                    Tema do TCC / Projeto *
                  </label>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {theme.length} / 250
                  </span>
                </div>
                <input
                  id="guidance-theme"
                  type="text"
                  required
                  maxLength={250}
                  placeholder="Ex: Arquitetura de Software em Microsserviços com IA"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                    <BookOpen size={12} /> Modelos rápidos:
                  </span>
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleApplyThemePreset(preset)}
                      className="px-2 py-0.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 rounded-md text-[11px] font-medium transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <DefenseDatePicker defenseDate={defenseDate} onChangeDate={setDefenseDate} />

              <div className="flex items-center gap-2 p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-blue-700">
                <Sparkles size={14} className="text-blue-600 shrink-0" />
                <span>
                  O quadro Kanban será gerado automaticamente com colunas <strong>A Fazer</strong>,{' '}
                  <strong>Em Andamento</strong> e <strong>Concluído</strong>.
                </span>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    !selectedStudent ||
                    selectedStudent.is_already_linked ||
                    !theme.trim() ||
                    isSubmitting
                  }
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? 'Criando orientação...' : 'Criar Orientação'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
