import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileDeleteModal } from './ProfileDeleteModal';

describe('ProfileDeleteModal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <ProfileDeleteModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={false}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('requires typing EXCLUIR to enable confirmation button', () => {
    const handleConfirm = vi.fn();
    render(
      <ProfileDeleteModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
        isDeleting={false}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /excluir definitivamente/i });
    expect(deleteBtn).toBeDisabled();

    const input = screen.getByPlaceholderText(/digite excluir/i);
    fireEvent.change(input, { target: { value: 'excluir' } });

    expect(deleteBtn).not.toBeDisabled();
    fireEvent.click(deleteBtn);
    expect(handleConfirm).toHaveBeenCalled();
  });
});
