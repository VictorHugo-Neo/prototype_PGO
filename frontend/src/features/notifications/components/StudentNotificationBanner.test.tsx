import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentNotificationBanner } from './StudentNotificationBanner';
import { notificationService } from '../../../services/api';
import type { Notification } from '../../../types';

vi.mock('../../../services/api', () => ({
  notificationService: {
    getAll: vi.fn(),
    markAsRead: vi.fn(),
  },
}));

const mockUnreadNotifs: Notification[] = [
  {
    id: 10,
    title: 'Aviso de Reunião',
    message: 'Nossa reunião será hoje às 15h.',
    read: false,
    created_at: new Date().toISOString(),
    sender_name: 'Prof. Carlos Alberto',
  },
];

describe('StudentNotificationBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders banner with unread notification details', async () => {
    vi.mocked(notificationService.getAll).mockResolvedValueOnce(mockUnreadNotifs);

    render(<StudentNotificationBanner onOpenAllNotifications={vi.fn()} />);

    expect(await screen.findByRole('region', { name: 'Aviso do Orientador' })).toBeInTheDocument();
    expect(screen.getByText('Prof. Carlos Alberto')).toBeInTheDocument();
    expect(screen.getByText('Aviso de Reunião')).toBeInTheDocument();
    expect(screen.getByText('Nossa reunião será hoje às 15h.')).toBeInTheDocument();
  });

  it('does not render when all notifications are read', async () => {
    vi.mocked(notificationService.getAll).mockResolvedValueOnce([
      { ...mockUnreadNotifs[0], read: true },
    ]);

    render(<StudentNotificationBanner onOpenAllNotifications={vi.fn()} />);

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Aviso do Orientador' })).not.toBeInTheDocument();
    });
  });

  it('calls markAsRead when clicking the mark as read button', async () => {
    vi.mocked(notificationService.getAll).mockResolvedValueOnce(mockUnreadNotifs);
    vi.mocked(notificationService.markAsRead).mockResolvedValueOnce(undefined);

    render(<StudentNotificationBanner onOpenAllNotifications={vi.fn()} />);

    const readBtn = await screen.findByRole('button', { name: /Marcar como lida/i });
    fireEvent.click(readBtn);

    await waitFor(() => {
      expect(notificationService.markAsRead).toHaveBeenCalledWith(10);
    });
  });

  it('calls onOpenAllNotifications when clicking view all', async () => {
    vi.mocked(notificationService.getAll).mockResolvedValueOnce(mockUnreadNotifs);
    const handleOpenAll = vi.fn();

    render(<StudentNotificationBanner onOpenAllNotifications={handleOpenAll} />);

    const viewAllBtn = await screen.findByRole('button', { name: /Ver todas/i });
    fireEvent.click(viewAllBtn);

    expect(handleOpenAll).toHaveBeenCalledTimes(1);
  });
});
