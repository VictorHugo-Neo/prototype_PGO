import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfilePersonalForm } from './ProfilePersonalForm';

describe('ProfilePersonalForm', () => {
  const initialData = {
    name: 'Carlos Estudante',
    email: 'carlos@instituicao.edu.br',
    phone: '(11) 98765-4321',
  };

  it('renders inputs with prefilled data', () => {
    render(
      <ProfilePersonalForm
        initialData={initialData}
        onSubmit={vi.fn()}
        isSaving={false}
      />
    );

    expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Carlos Estudante');
    expect(screen.getByLabelText(/e-mail institucional/i)).toHaveValue('carlos@instituicao.edu.br');
    expect(screen.getByLabelText(/telefone \/ whatsapp/i)).toHaveValue('(11) 98765-4321');
  });

  it('submits updated values when form is submitted', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <ProfilePersonalForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSaving={false}
      />
    );

    const nameInput = screen.getByLabelText(/nome completo/i);
    fireEvent.change(nameInput, { target: { value: 'Carlos Silva' } });

    const submitBtn = screen.getByRole('button', { name: /salvar informações/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Carlos Silva',
      email: 'carlos@instituicao.edu.br',
      phone: '(11) 98765-4321',
    });
  });
});
