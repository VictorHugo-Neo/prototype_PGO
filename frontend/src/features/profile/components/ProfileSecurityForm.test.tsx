import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileSecurityForm } from './ProfileSecurityForm';

describe('ProfileSecurityForm', () => {
  it('validates password matching before submitting', () => {
    const handleSubmit = vi.fn();
    render(<ProfileSecurityForm onSubmit={handleSubmit} isSaving={false} />);

    fireEvent.change(screen.getByLabelText(/^nova senha/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/confirmar nova senha/i), { target: { value: '654321' } });

    fireEvent.click(screen.getByRole('button', { name: /atualizar senha/i }));

    expect(screen.getByText(/as senhas digitadas não coincidem/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits when passwords match and are long enough', () => {
    const handleSubmit = vi.fn();
    render(<ProfileSecurityForm onSubmit={handleSubmit} isSaving={false} />);

    fireEvent.change(screen.getByLabelText(/^nova senha/i), { target: { value: 'novasenha123' } });
    fireEvent.change(screen.getByLabelText(/confirmar nova senha/i), { target: { value: 'novasenha123' } });

    fireEvent.click(screen.getByRole('button', { name: /atualizar senha/i }));

    expect(handleSubmit).toHaveBeenCalledWith('novasenha123');
  });
});
