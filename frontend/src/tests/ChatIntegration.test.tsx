import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatWidget } from '../components/ChatWidget';
import * as api from '../services/api';


vi.spyOn(api, 'sendMessageToAI').mockResolvedValue('Resposta Mockada da IA');

describe('Chat Integration', () => {
  it('sends message and displays response', async () => {
    render(<ChatWidget />);

    
    fireEvent.click(screen.getByTestId('chat-fab'));

    
    const input = screen.getByPlaceholderText('Digite sua dúvida...');
    fireEvent.change(input, { target: { value: 'Olá IA' } });

    
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    
    expect(screen.getByText('Olá IA')).toBeInTheDocument();

    
    await waitFor(() => {
      expect(screen.getByText('Resposta Mockada da IA')).toBeInTheDocument();
    });
  });
});