import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import type { StudentGuidance } from '../../../types';
import { API_BASE_URL } from '../../../services/api';

interface GuidanceCardProps {
  guidance: StudentGuidance;
}

export function GuidanceCard({ guidance }: GuidanceCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/guidance/${guidance.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/guidance/${guidance.id}`);
        }
      }}
      role="button"
      tabIndex={0}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 overflow-hidden flex items-center justify-center border border-gray-100">
          {guidance.student.avatar_path ? (
            <img
              src={`${API_BASE_URL}/${guidance.student.avatar_path.replace(/\\/g, '/')}`}
              alt={`Avatar de ${guidance.student.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-base font-bold text-blue-600">
              {guidance.student.name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
            {guidance.student.name}
          </h3>
          <p className="text-xs text-gray-500 truncate" title={guidance.theme}>
            {guidance.theme}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} aria-hidden="true" />
          <span>
            {guidance.defense_date
              ? new Date(guidance.defense_date).toLocaleDateString('pt-BR')
              : 'Data de banca não definida'}
          </span>
        </div>
        <ArrowRight
          size={16}
          className="text-blue-600 transform group-hover:translate-x-1 transition-transform"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
