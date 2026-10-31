import { CheckCircle2, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../../../services/api';
import type { AvailableStudent } from '../../../types';

interface SelectedStudentCardProps {
  student: AvailableStudent;
  onChangeStudent: () => void;
}

export function SelectedStudentCard({
  student,
  onChangeStudent,
}: SelectedStudentCardProps) {
  const avatarUrl = student.avatar_path
    ? `${API_BASE_URL}/${student.avatar_path.replace(/\\/g, '/')}`
    : null;

  return (
    <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl">
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={student.name}
            className="w-10 h-10 rounded-full object-cover border border-blue-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            {student.name.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-gray-800">{student.name}</h4>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-full">
              <CheckCircle2 size={10} /> Verificado
            </span>
          </div>
          <p className="text-xs text-gray-500">{student.email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChangeStudent}
        className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1"
      >
        <RefreshCw size={12} /> Trocar
      </button>
    </div>
  );
}
