import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudentHeader } from './StudentHeader';
import { CoadvisorModal } from './CoadvisorModal';
import type { StudentGuidance } from '../../../types';

describe('Coadvisor Management - StudentHeader Integration', () => {
  const baseGuidance: StudentGuidance = {
    id: 1,
    theme: 'Sistema de TCC Inteligente',
    defense_date: undefined,
    created_at: '2026-03-01T10:00:00',
    student: {
      id: 20,
      name: 'Maria Aluna',
      email: 'maria@universidade.edu',
    },
    advisor: {
      id: 10,
      name: 'Prof. Carlos Orientador',
      email: 'carlos@universidade.edu',
    },
    coadvisor: null,
  };

  const defaultHeaderProps = {
    guidance: baseGuidance,
    myUserId: 10,
    meetingsCount: 2,
    imgError: false,
    onImgError: vi.fn(),
    onFileChange: vi.fn(),
    onOpenMeetingsModal: vi.fn(),
    onDownloadReport: vi.fn(),
    onOpenCreateTaskModal: vi.fn(),
    onOpenCoadvisorModal: vi.fn(),
  };

  it('renders "+ Coorientador" button for principal advisor when no coadvisor is linked', () => {
    const onOpenCoadvisorModal = vi.fn();
    render(
      <MemoryRouter>
        <StudentHeader
          {...defaultHeaderProps}
          onOpenCoadvisorModal={onOpenCoadvisorModal}
        />
      </MemoryRouter>
    );

    const addBtn = screen.getByTestId('add-coadvisor-btn');
    expect(addBtn).toBeInTheDocument();
    expect(addBtn).toHaveTextContent('+ Coorientador');

    fireEvent.click(addBtn);
    expect(onOpenCoadvisorModal).toHaveBeenCalledTimes(1);
  });

  it('renders coadvisor name and manage pencil button for principal advisor when coadvisor exists', () => {
    const onOpenCoadvisorModal = vi.fn();
    const guidanceWithCoadvisor: StudentGuidance = {
      ...baseGuidance,
      coadvisor: {
        id: 15,
        name: 'Profa. Beatriz Coorientadora',
        email: 'beatriz@universidade.edu',
      },
    };

    render(
      <MemoryRouter>
        <StudentHeader
          {...defaultHeaderProps}
          guidance={guidanceWithCoadvisor}
          onOpenCoadvisorModal={onOpenCoadvisorModal}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/beatriz coorientadora/i)).toBeInTheDocument();
    expect(screen.queryByTestId('add-coadvisor-btn')).not.toBeInTheDocument();

    const manageBtn = screen.getByTestId('manage-coadvisor-btn');
    expect(manageBtn).toBeInTheDocument();

    fireEvent.click(manageBtn);
    expect(onOpenCoadvisorModal).toHaveBeenCalledTimes(1);
  });

  it('does NOT render coadvisor management buttons for student', () => {
    render(
      <MemoryRouter>
        <StudentHeader
          {...defaultHeaderProps}
          myUserId={20}
        />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('add-coadvisor-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('manage-coadvisor-btn')).not.toBeInTheDocument();
  });

  it('does NOT render coadvisor management buttons for coadvisor', () => {
    const guidanceWithCoadvisor: StudentGuidance = {
      ...baseGuidance,
      coadvisor: {
        id: 15,
        name: 'Profa. Beatriz Coorientadora',
        email: 'beatriz@universidade.edu',
      },
    };

    render(
      <MemoryRouter>
        <StudentHeader
          {...defaultHeaderProps}
          guidance={guidanceWithCoadvisor}
          myUserId={15}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/beatriz coorientadora/i)).toBeInTheDocument();
    expect(screen.queryByTestId('add-coadvisor-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('manage-coadvisor-btn')).not.toBeInTheDocument();
  });
});

describe('CoadvisorModal Component', () => {
  it('allows entering coadvisor email and submitting to link', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <CoadvisorModal
        isOpen={true}
        onClose={onClose}
        studentName="Maria Aluna"
        theme="Sistema de TCC"
        onSave={onSave}
      />
    );

    expect(screen.getByRole('heading', { name: /vincular coorientador/i })).toBeInTheDocument();
    const emailInput = screen.getByLabelText(/e-mail do docente coorientador/i);

    fireEvent.change(emailInput, { target: { value: 'coadvisor@univ.edu' } });
    const submitBtn = screen.getByRole('button', { name: /vincular coorientador/i });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('coadvisor@univ.edu');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles and displays error message from API on failed save', async () => {
    const onSave = vi.fn().mockRejectedValue({
      response: { data: { detail: 'Usuário não é um orientador cadastrado' } },
    });
    const onClose = vi.fn();

    render(
      <CoadvisorModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const emailInput = screen.getByLabelText(/e-mail do docente coorientador/i);
    fireEvent.change(emailInput, { target: { value: 'invalid@univ.edu' } });

    const submitBtn = screen.getByRole('button', { name: /vincular coorientador/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/usuário não é um orientador cadastrado/i)).toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows existing coadvisor and allows confirmation flow to remove', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onRemove = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <CoadvisorModal
        isOpen={true}
        onClose={onClose}
        currentCoadvisor={{
          id: 15,
          name: 'Profa. Beatriz Coorientadora',
          email: 'beatriz@universidade.edu',
        }}
        onSave={onSave}
        onRemove={onRemove}
      />
    );

    expect(screen.getByText(/gerenciar coorientador/i)).toBeInTheDocument();
    expect(screen.getByText(/coorientador atual/i)).toBeInTheDocument();
    expect(screen.getByText('Profa. Beatriz Coorientadora')).toBeInTheDocument();

    const removeBtn = screen.getByRole('button', { name: /desvincular/i });
    fireEvent.click(removeBtn);

    const confirmBtn = screen.getByRole('button', { name: /confirmar remoção/i });
    expect(confirmBtn).toBeInTheDocument();

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('closes on Escape key press or close button click', () => {
    const onClose = vi.fn();
    render(
      <CoadvisorModal
        isOpen={true}
        onClose={onClose}
        onSave={vi.fn()}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByLabelText(/fechar/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
