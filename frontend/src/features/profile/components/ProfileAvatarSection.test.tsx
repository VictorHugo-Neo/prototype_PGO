import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileAvatarSection } from './ProfileAvatarSection';

describe('ProfileAvatarSection', () => {
  it('renders initials when no avatar path is provided', () => {
    render(
      <ProfileAvatarSection
        name="Ana Maria"
        onUpload={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('AM')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remover foto/i })).not.toBeInTheDocument();
  });

  it('renders image and remove button when avatar path is present', () => {
    render(
      <ProfileAvatarSection
        name="Ana Maria"
        avatarPath="static/avatars/user_1.png"
        onUpload={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('img', { name: /foto de ana maria/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remover foto/i })).toBeInTheDocument();
  });

  it('calls onDelete when remove button is clicked', () => {
    const handleDelete = vi.fn();
    render(
      <ProfileAvatarSection
        name="Ana Maria"
        avatarPath="static/avatars/user_1.png"
        onUpload={vi.fn()}
        onDelete={handleDelete}
      />
    );

    const removeBtn = screen.getByRole('button', { name: /remover foto/i });
    fireEvent.click(removeBtn);
    expect(handleDelete).toHaveBeenCalled();
  });
});
