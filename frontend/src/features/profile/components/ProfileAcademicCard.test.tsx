import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileAcademicCard } from './ProfileAcademicCard';
import type { StudentGuidance } from '../../../types';

describe('ProfileAcademicCard', () => {
  it('renders nothing if user is not a student', () => {
    const { container } = render(<ProfileAcademicCard isStudent={false} guidance={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders pending banner if student has no guidance yet', () => {
    render(<ProfileAcademicCard isStudent={true} guidance={null} />);
    expect(screen.getByText(/vínculo de orientação pendente/i)).toBeInTheDocument();
  });

  it('renders research theme and advisor name when guidance is provided', () => {
    const guidance: StudentGuidance = {
      id: 5,
      theme: 'Arquitetura de Microsserviços',
      created_at: '2026-03-01T10:00:00',
      student: { id: 2, name: 'Lucas Aluno', email: 'lucas@pgo.edu.br' },
      advisor: { id: 1, name: 'Prof. Roberto', email: 'roberto@pgo.edu.br' },
    };

    render(<ProfileAcademicCard isStudent={true} guidance={guidance} />);
    expect(screen.getByText('Arquitetura de Microsserviços')).toBeInTheDocument();
    expect(screen.getByText('Prof. Roberto')).toBeInTheDocument();
  });
});
