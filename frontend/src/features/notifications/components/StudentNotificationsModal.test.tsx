import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentNotificationsModal } from './StudentNotificationsModal';
import { notificationService } from '../../../services/api';
import type { Notification } from '../../../types';

vi.mock('../../../services/api', () => ({
  notificationService: {
    getAll: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

const mockStudentNotifs: Notification[] = [
  {
    id: 101,
    title: 'Aviso sobre a Banca',
    message: 'A banca de defesa foi agendada para 10 de Dezembro.',
    read: false,
    created_at: new Date().toISOString(),
    sender_name: 'Dra. Ana Paula',
    channel: 'platform',
  },
  {
    id: 102,
    title: 'Revisão do Resumo',
    message: 'Por favor, ajuste o resumo conforme as normas da ABNT.',
    read: true,
    created_at: new Date().toISOString(),
    sender_name: 'Dra. Ana Paula',
    channel: 'whatsapp',
  },
];

describe('StudentNotificationsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with notifications when open', async () => {
    vi.mocked(notificationService.getAll).mockResolvedValueOnce(mockStudentNotifs);

    render(<StudentNotificationsModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Notificações da Orientação')).toBeInTheDocument();
    expect(await screen.findByText('Aviso sobre a Banca')).toBeInTheDocument();
    expect(screen.getByText('Revisão do Resumo')).toBeInTheDocument();
    expect(screen.getAllByText('Dra. Ana Paula').length).toBeGreaterThan(0);
  });

  it('does not render when closed', () => {
    render(<StudentNotificationsModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('filters notifications when switching tabs', async () => {
    vi.mocked(notificationService.getAll).mockResolvedValue(mockStudentNotifs);

    render(<StudentNotificationsModal isOpen={true} onClose={vi.fn()} />);

    await screen.findByText('Aviso sobre a Banca');

    const unreadTab = screen.getByRole('button', { name: /Não Lidas/i });
    fireEvent.click(unreadTab);

    expect(screen.getByText('Aviso sobre a Banca')).toBeInTheDocument();
    expect(screen.queryByText('Revisão do Resumo')).not.toBeInTheDocument();

    const readTab = screen.getByRole('button', { name: /^Lidas/i });
    fireEvent.click(readTab);

    expect(screen.queryByText('Aviso sobre a Banca')).not.toBeInTheDocument();
    expect(screen.getByText('Revisão do Resumo')).toBeInTheDocument();
  });

  it('marks individual notification as read', async () => {
    vi.mocked(notificationService.getAll).mockResolvedValue(mockStudentNotifs);
    vi.mocked(notificationService.markAsRead).mockResolvedValueOnce(undefined);

    render(<StudentNotificationsModal isOpen={true} onClose={vi.fn()} />);

    const markReadBtn = await screen.findByRole('button', { name: /Marcar lida/i });
    fireEvent.click(markReadBtn);

    await waitFor(() => {
      expect(notificationService.markAsRead).toHaveBeenCalledWith(101);
    });
  });

  it('marks all notifications as read', async () => {
    vi.mocked(notificationService.getAll).mockResolvedValue(mockStudentNotifs);
    vi.mocked(notificationService.markAllAsRead).mockResolvedValueOnce(undefined);

    render(<StudentNotificationsModal isOpen={true} onClose={vi.fn()} />);

    const markAllBtn = await screen.findByRole('button', { name: /Marcar todas como lidas/i });
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(notificationService.markAllAsRead).toHaveBeenCalled();
    });
  });
});
