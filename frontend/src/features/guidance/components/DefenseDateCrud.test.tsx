import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudentHeader } from './StudentHeader';
import { DefenseDateModal } from './DefenseDateModal';
import type { StudentGuidance } from '../../../types';

describe('Defense Date CRUD & Usability', () => {
  const guidanceWithDate: StudentGuidance = {
    id: 1,
    theme: 'Inteligência Artificial na Educação',
    defense_date: '2026-11-28T14:30:00',
    created_at: '2026-02-01T10:00:00',
    student: {
      id: 20,
      name: 'Ana Carolina',
      email: 'ana@aluno.edu',
    },
    advisor: {
      id: 10,
      name: 'Prof. Ricardo Santos',
      email: 'ricardo@professor.edu',
    },
  };

  const guidanceWithoutDate: StudentGuidance = {
    ...guidanceWithDate,
    defense_date: undefined,
  };

  describe('StudentHeader - Defense Date Display (Read State)', () => {
    it('renders formatted date, countdown and advisor actions when date is set', () => {
      const handleOpenModal = vi.fn();
      const handleDelete = vi.fn().mockResolvedValue(undefined);

      render(
        <MemoryRouter>
          <StudentHeader
            guidance={guidanceWithDate}
            myUserId={10}
            meetingsCount={2}
            imgError={false}
            onImgError={() => {}}
            onFileChange={() => {}}
            onOpenMeetingsModal={() => {}}
            onDownloadReport={() => {}}
            onOpenCreateTaskModal={() => {}}
            onOpenDefenseModal={handleOpenModal}
            onDeleteDefenseDate={handleDelete}
          />
        </MemoryRouter>
      );

      const badge = screen.getByTestId('defense-date-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent(/28 de nov/i);
      expect(badge).toHaveTextContent(/14:30/i);

      const editBtn = screen.getByTestId('edit-defense-date-btn');
      expect(editBtn).toBeInTheDocument();
      fireEvent.click(editBtn);
      expect(handleOpenModal).toHaveBeenCalledTimes(1);

      const delBtn = screen.getByTestId('delete-defense-date-btn');
      expect(delBtn).toBeInTheDocument();
      fireEvent.click(delBtn);
      expect(handleDelete).toHaveBeenCalledTimes(1);
    });

    it('renders "+ Agendar Data da Banca" button for advisor when date is not set', () => {
      const handleOpenModal = vi.fn();

      render(
        <MemoryRouter>
          <StudentHeader
            guidance={guidanceWithoutDate}
            myUserId={10}
            meetingsCount={0}
            imgError={false}
            onImgError={() => {}}
            onFileChange={() => {}}
            onOpenMeetingsModal={() => {}}
            onDownloadReport={() => {}}
            onOpenCreateTaskModal={() => {}}
            onOpenDefenseModal={handleOpenModal}
          />
        </MemoryRouter>
      );

      const scheduleBtn = screen.getByTestId('schedule-defense-btn');
      expect(scheduleBtn).toBeInTheDocument();
      expect(scheduleBtn).toHaveTextContent(/agendar data da banca/i);

      fireEvent.click(scheduleBtn);
      expect(handleOpenModal).toHaveBeenCalledTimes(1);
    });

    it('renders friendly pending indicator for student without edit controls', () => {
      render(
        <MemoryRouter>
          <StudentHeader
            guidance={guidanceWithoutDate}
            myUserId={20}
            meetingsCount={0}
            imgError={false}
            onImgError={() => {}}
            onFileChange={() => {}}
            onOpenMeetingsModal={() => {}}
            onDownloadReport={() => {}}
            onOpenCreateTaskModal={() => {}}
          />
        </MemoryRouter>
      );

      const pendingBadge = screen.getByTestId('defense-date-pending');
      expect(pendingBadge).toBeInTheDocument();
      expect(pendingBadge).toHaveTextContent(/a definir/i);
      expect(screen.queryByTestId('schedule-defense-btn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-defense-date-btn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-defense-date-btn')).not.toBeInTheDocument();
    });
  });

  describe('DefenseDateModal - Create, Update & Delete Lifecycle', () => {
    it('allows choosing date and time, applying quick presets, and saving (Create / Update)', async () => {
      const handleSave = vi.fn().mockResolvedValue(undefined);
      const handleDelete = vi.fn().mockResolvedValue(undefined);
      const handleClose = vi.fn();

      render(
        <DefenseDateModal
          isOpen={true}
          onClose={handleClose}
          currentDate={null}
          studentName="Ana Carolina"
          theme="Inteligência Artificial na Educação"
          onSave={handleSave}
          onDelete={handleDelete}
        />
      );

      expect(screen.getByText(/agendar data da banca/i)).toBeInTheDocument();
      expect(screen.getByText('Ana Carolina')).toBeInTheDocument();

      const preset60 = screen.getByRole('button', { name: /\+60 dias/i });
      fireEvent.click(preset60);

      expect(screen.getByText(/pré-visualização da banca/i)).toBeInTheDocument();

      const timeInput = screen.getByLabelText(/horário \*/i);
      fireEvent.change(timeInput, { target: { value: '16:00' } });

      const submitBtn = screen.getByRole('button', { name: /confirmar agendamento/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledTimes(1);
        expect(handleSave).toHaveBeenCalledWith(expect.stringContaining('T16:00:00'));
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });

    it('displays pre-filled date and enables deletion confirmation flow (Delete)', async () => {
      const handleSave = vi.fn();
      const handleDelete = vi.fn().mockResolvedValue(undefined);
      const handleClose = vi.fn();

      render(
        <DefenseDateModal
          isOpen={true}
          onClose={handleClose}
          currentDate="2026-11-28T14:30:00"
          studentName="Ana Carolina"
          theme="Inteligência Artificial na Educação"
          onSave={handleSave}
          onDelete={handleDelete}
        />
      );

      expect(screen.getByText(/reagendar data da banca/i)).toBeInTheDocument();

      const deleteInitBtn = screen.getByRole('button', { name: /desmarcar banca/i });
      expect(deleteInitBtn).toBeInTheDocument();
      fireEvent.click(deleteInitBtn);

      expect(screen.getByText(/desmarcar banca examinadora\?/i)).toBeInTheDocument();

      const confirmDeleteBtn = screen.getByRole('button', { name: /confirmar desmarcação/i });
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(handleDelete).toHaveBeenCalledTimes(1);
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });

    it('closes modal when Escape key is pressed', () => {
      const handleClose = vi.fn();

      render(
        <DefenseDateModal
          isOpen={true}
          onClose={handleClose}
          currentDate={null}
          studentName="Ana Carolina"
          theme="Inteligência Artificial na Educação"
          onSave={async () => {}}
          onDelete={async () => {}}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
