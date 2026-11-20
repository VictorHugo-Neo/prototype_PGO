import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { NotificationBell } from './NotificationBell';
import { notificationService } from '../../../services/api';
import type { Notification } from '../../../types';

vi.mock('../../../services/api', () => ({
  notificationService: {
    getAll: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'Aviso Importante',
    message: 'Reunião de alinhamento amanhã às 14h.',
    read: false,
    created_at: new Date().toISOString(),
    sender_name: 'Prof. Silva',
  },
  {
    id: 2,
    title: 'Feedback Concluído',
    message: 'Seu capítulo 1 foi revisado com sucesso.',
    read: true,
    created_at: new Date().toISOString(),
    sender_name: 'Prof. Silva',
  },
];

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders bell button and badge with unread count', async () => {
    vi.mocked(notificationService.getAll).mockResolvedValueOnce(mockNotifications);

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('unread-badge')).toHaveTextContent('1');
    });
  });

  it('opens notifications dropdown when clicked', async () => {
    vi.mocked(notificationService.getAll).mockResolvedValue(mockNotifications);

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    const bellBtn = screen.getByTestId('notification-bell-btn');
    fireEvent.click(bellBtn);

    expect(await screen.findByTestId('notifications-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Aviso Importante')).toBeInTheDocument();
    expect(screen.getByText('Feedback Concluído')).toBeInTheDocument();
  });

  it('marks notification as read when clicking mark read button', async () => {
    vi.mocked(notificationService.getAll).mockResolvedValue(mockNotifications);
    vi.mocked(notificationService.markAsRead).mockResolvedValueOnce(undefined);

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('unread-badge')).toBeInTheDocument();
    });

    const bellBtn = screen.getByTestId('notification-bell-btn');
    fireEvent.click(bellBtn);

    const readBtn = await screen.findByRole('button', { name: /^Lida$/i });
    fireEvent.click(readBtn);

    await waitFor(() => {
      expect(notificationService.markAsRead).toHaveBeenCalledWith(1);
    });
  });
});
