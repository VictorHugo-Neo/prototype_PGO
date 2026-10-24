import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MeetingsModal } from './MeetingsModal';
import type { Meeting } from '../../../types';

describe('MeetingsModal - Complete Meeting CRUD', () => {
  const sampleMeetings: Meeting[] = [
    {
      id: 1,
      date: '2026-10-25T14:30:00',
      topic: 'Definição do Tema e Metodologia',
      status: 'pending',
      guidance_id: 10,
    },
    {
      id: 2,
      date: '2026-11-01T10:00:00',
      topic: 'Revisão da Introdução e Bibliografia',
      status: 'confirmed',
      guidance_id: 10,
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    meetings: sampleMeetings,
    isAdvisor: true,
    onRequestMeeting: vi.fn().mockResolvedValue(undefined),
    onUpdateStatus: vi.fn().mockResolvedValue(undefined),
    onUpdateMeeting: vi.fn().mockResolvedValue(undefined),
    onDeleteMeeting: vi.fn().mockResolvedValue(undefined),
  };

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <MeetingsModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders list of meetings and displays count, topic and date', () => {
    render(<MeetingsModal {...defaultProps} />);

    expect(screen.getByText(/Reuniões Agendadas \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('Definição do Tema e Metodologia')).toBeInTheDocument();
    expect(screen.getByText('Revisão da Introdução e Bibliografia')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aceitar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recusar/i })).toBeInTheDocument();
  });

  it('renders empty message when meetings list is empty', () => {
    render(<MeetingsModal {...defaultProps} meetings={[]} />);

    expect(screen.getByText(/Nenhuma reunião cadastrada para este projeto/i)).toBeInTheDocument();
  });

  it('calls onRequestMeeting when submitting the create form', async () => {
    render(<MeetingsModal {...defaultProps} />);

    const topicInput = screen.getByLabelText(/Pauta da Reunião/i);
    const dateInput = screen.getByLabelText(/Data e Horário/i);
    const submitBtn = screen.getByRole('button', { name: /agendar reunião/i });

    fireEvent.change(topicInput, { target: { value: 'Nova Reunião de Alinhamento' } });
    fireEvent.change(dateInput, { target: { value: '2026-11-10T09:00' } });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(defaultProps.onRequestMeeting).toHaveBeenCalledWith(
      '2026-11-10T09:00',
      'Nova Reunião de Alinhamento'
    );
  });

  it('calls onUpdateStatus when advisor clicks Aceitar or Recusar', async () => {
    render(<MeetingsModal {...defaultProps} />);

    const acceptBtn = screen.getByRole('button', { name: /aceitar/i });
    await act(async () => {
      fireEvent.click(acceptBtn);
    });
    expect(defaultProps.onUpdateStatus).toHaveBeenCalledWith(1, 'confirmed');

    const rejectBtn = screen.getByRole('button', { name: /recusar/i });
    await act(async () => {
      fireEvent.click(rejectBtn);
    });
    expect(defaultProps.onUpdateStatus).toHaveBeenCalledWith(1, 'rejected');
  });

  it('opens edit mode, allows editing topic/date/status and saves changes', async () => {
    render(<MeetingsModal {...defaultProps} />);

    const editBtn = screen.getByLabelText('Editar reunião Definição do Tema e Metodologia');
    fireEvent.click(editBtn);

    expect(screen.getByTestId('meeting-edit-card-1')).toBeInTheDocument();

    const topicInput = screen.getByLabelText(/Pauta \*/i);
    const statusSelect = screen.getByLabelText(/Status/i);
    const saveBtn = screen.getByRole('button', { name: /salvar alterações/i });

    fireEvent.change(topicInput, { target: { value: 'Tema e Escopo Atualizados' } });
    fireEvent.change(statusSelect, { target: { value: 'confirmed' } });

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(defaultProps.onUpdateMeeting).toHaveBeenCalledWith(1, {
      topic: 'Tema e Escopo Atualizados',
      date: expect.any(String),
      status: 'confirmed',
    });
  });

  it('cancels edit mode when cancel button is clicked', () => {
    render(<MeetingsModal {...defaultProps} />);

    const editBtn = screen.getByLabelText('Editar reunião Definição do Tema e Metodologia');
    fireEvent.click(editBtn);

    expect(screen.getByTestId('meeting-edit-card-1')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);

    expect(screen.queryByTestId('meeting-edit-card-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('meeting-item-1')).toBeInTheDocument();
  });

  it('opens delete confirmation and calls onDeleteMeeting when confirmed', async () => {
    render(<MeetingsModal {...defaultProps} />);

    const deleteBtn = screen.getByLabelText('Excluir reunião Definição do Tema e Metodologia');
    fireEvent.click(deleteBtn);

    expect(screen.getByTestId('meeting-delete-card-1')).toBeInTheDocument();
    expect(screen.getByText(/Excluir esta reunião\?/i)).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole('button', { name: /confirmar exclusão/i });
    await act(async () => {
      fireEvent.click(confirmDeleteBtn);
    });

    expect(defaultProps.onDeleteMeeting).toHaveBeenCalledWith(1);
  });

  it('cancels delete confirmation when cancel button is clicked', () => {
    render(<MeetingsModal {...defaultProps} />);

    const deleteBtn = screen.getByLabelText('Excluir reunião Definição do Tema e Metodologia');
    fireEvent.click(deleteBtn);

    expect(screen.getByTestId('meeting-delete-card-1')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);

    expect(screen.queryByTestId('meeting-delete-card-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('meeting-item-1')).toBeInTheDocument();
  });
});
