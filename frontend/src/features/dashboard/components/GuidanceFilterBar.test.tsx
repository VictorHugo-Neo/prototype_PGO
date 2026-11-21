import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuidanceFilterBar } from './GuidanceFilterBar';

describe('GuidanceFilterBar - Usability & Ergonomics', () => {
  it('renders filter bar with search input, status pills and badges', () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();

    render(
      <GuidanceFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        activeFilter="all"
        onFilterChange={onFilterChange}
        counts={{
          all: 5,
          in_progress: 3,
          completed: 2,
          pending_meetings: 1,
        }}
      />
    );

    expect(screen.getByPlaceholderText(/buscar aluno ou tema/i)).toBeInTheDocument();
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Em Andamento')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Concluídos')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Reuniões')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('triggers onFilterChange when clicking filter pills', () => {
    const onFilterChange = vi.fn();

    render(
      <GuidanceFilterBar
        searchQuery=""
        onSearchChange={vi.fn()}
        activeFilter="all"
        onFilterChange={onFilterChange}
      />
    );

    fireEvent.click(screen.getByText('Em Andamento'));
    expect(onFilterChange).toHaveBeenCalledWith('in_progress');

    fireEvent.click(screen.getByText('Concluídos'));
    expect(onFilterChange).toHaveBeenCalledWith('completed');

    fireEvent.click(screen.getByText('Reuniões'));
    expect(onFilterChange).toHaveBeenCalledWith('pending_meetings');
  });

  it('allows switching viewMode between grid and list', () => {
    const onViewModeChange = vi.fn();

    render(
      <GuidanceFilterBar
        searchQuery=""
        onSearchChange={vi.fn()}
        activeFilter="all"
        onFilterChange={vi.fn()}
        viewMode="grid"
        onViewModeChange={onViewModeChange}
      />
    );

    const listBtn = screen.getByRole('button', { name: /visualização em lista compacta/i });
    fireEvent.click(listBtn);
    expect(onViewModeChange).toHaveBeenCalledWith('list');
  });

  it('allows sorting selection', () => {
    const onSortByChange = vi.fn();

    render(
      <GuidanceFilterBar
        searchQuery=""
        onSearchChange={vi.fn()}
        activeFilter="all"
        onFilterChange={vi.fn()}
        sortBy="name"
        onSortByChange={onSortByChange}
      />
    );

    const select = screen.getByLabelText(/ordenar orientações por/i);
    fireEvent.change(select, { target: { value: 'progress_desc' } });
    expect(onSortByChange).toHaveBeenCalledWith('progress_desc');
  });
});
