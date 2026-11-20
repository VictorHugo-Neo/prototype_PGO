import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendNotificationModal } from './SendNotificationModal';
import { notificationService } from '../../../services/api';
import type { StudentGuidance } from '../../../types';

vi.mock('../../../services/api', () => ({
  notificationService: {
    sendNotification: vi.fn(),
    getAll: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

const mockGuidances: StudentGuidance[] = [
  {
    id: 1,
    theme: 'Inteligência Artificial',
    defense_date: '2026-12-01',
    advisor_id: 10,
    student_id: 101,
    student: {
      id: 101,
      name: 'João Silva',
      email: 'joao@faculdade.edu.br',
    },
  },
  {
    id: 2,
    theme: 'Computação em Nuvem',
    defense_date: '2026-12-15',
    advisor_id: 10,
    student_id: 102,
    student: {
      id: 102,
      name: 'Maria Oliveira',
      email: 'maria@faculdade.edu.br',
    },
  },
];

describe('SendNotificationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <SendNotificationModal
        isOpen={true}
        onClose={vi.fn()}
        guidances={mockGuidances}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Enviar Notificação')).toBeInTheDocument();
    expect(screen.getByText('Todos os Orientandos (2)')).toBeInTheDocument();
    expect(screen.getByText('Aluno Individual')).toBeInTheDocument();
    expect(screen.getByText('Plataforma')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Ambos')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <SendNotificationModal
        isOpen={false}
        onClose={vi.fn()}
        guidances={mockGuidances}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('switches between target types and submits notification successfully', async () => {
    vi.mocked(notificationService.sendNotification).mockResolvedValueOnce({
      total_targeted: 2,
      platform_count: 2,
      whatsapp_count: 0,
      whatsapp_skipped_no_phone_count: 2,
      whatsapp_failed_count: 0,
      results: [
        {
          student_id: 101,
          student_name: 'João Silva',
          platform_success: true,
          whatsapp_success: false,
          whatsapp_skipped_no_phone: true,
        },
        {
          student_id: 102,
          student_name: 'Maria Oliveira',
          platform_success: true,
          whatsapp_success: false,
          whatsapp_skipped_no_phone: true,
        },
      ],
    });

    render(
      <SendNotificationModal
        isOpen={true}
        onClose={vi.fn()}
        guidances={mockGuidances}
      />
    );

    const allButton = screen.getByText('Todos os Orientandos (2)');
    fireEvent.click(allButton);

    const platformButton = screen.getByText('Plataforma');
    fireEvent.click(platformButton);

    const messageInput = screen.getByPlaceholderText(/Escreva a mensagem que deseja transmitir/i);
    fireEvent.change(messageInput, { target: { value: 'Aviso geral para a turma de TCC' } });

    const submitBtn = screen.getByRole('button', { name: /Disparar Notificação/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(notificationService.sendNotification).toHaveBeenCalledWith({
        target_type: 'all',
        student_id: undefined,
        channel: 'platform',
        title: undefined,
        message: 'Aviso geral para a turma de TCC',
      });
    });

    expect(await screen.findByText('Notificações Processadas com Sucesso!')).toBeInTheDocument();
  });

  it('calls onClose when close button or cancel is clicked', () => {
    const handleClose = vi.fn();
    render(
      <SendNotificationModal
        isOpen={true}
        onClose={handleClose}
        guidances={mockGuidances}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
