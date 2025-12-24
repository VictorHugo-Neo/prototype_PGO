import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChatWidget } from '../components/ChatWidget';

describe('ChatWidget UI', () => {
  it('starts closed and opens on click', () => {
    render(<ChatWidget />);

    const fab = screen.getByTestId('chat-fab');
    expect(fab).toBeInTheDocument();

    expect(screen.queryByTestId('chat-window')).not.toBeInTheDocument();

    fireEvent.click(fab);

    expect(screen.getByTestId('chat-window')).toBeInTheDocument();
    expect(screen.getByText('Assistente PGO')).toBeInTheDocument();
  });

  it('shows suggestion chips', () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByTestId('chat-fab'));

    expect(screen.getByText('Como formatar citação?')).toBeInTheDocument();
  });
});