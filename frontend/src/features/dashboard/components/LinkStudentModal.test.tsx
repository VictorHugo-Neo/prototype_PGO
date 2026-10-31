import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LinkStudentModal } from './LinkStudentModal';
import { guidanceService } from '../../../services/api';
import type { AvailableStudent, StudentGuidance } from '../../../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../services/api', async () => {
  const actual = await vi.importActual('../../../services/api');
  return {
    ...actual,
    guidanceService: {
      ...((actual as Record<string, unknown>).guidanceService as Record<string, unknown>),
      getAvailableStudents: vi.fn(),
      linkStudent: vi.fn(),
    },
  };
});

describe('LinkStudentModal - Usability & Creation Flow', () => {
  const mockStudents: AvailableStudent[] = [
    {
      id: 101,
      name: 'Mariana Silva',
      email: 'mariana@pgo.edu.br',
      is_already_linked: false,
    },
    {
      id: 102,
      name: 'Rodrigo Santos',
      email: 'rodrigo@pgo.edu.br',
      is_already_linked: true,
      active_theme: 'IoT na Agricultura de Precisão',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(guidanceService.getAvailableStudents).mockResolvedValue(mockStudents);
  });

  it('renders modal dialog with accessible elements and loads available students', async () => {
    render(
      <MemoryRouter>
        <LinkStudentModal isOpen={true} onClose={vi.fn()} onLink={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nova Orientação' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Orientando \(Aluno\) \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tema do TCC \/ Projeto \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Data Prevista da Banca/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(guidanceService.getAvailableStudents).toHaveBeenCalled();
    });
  });

  it('filters and selects an available student from combobox', async () => {
    render(
      <MemoryRouter>
        <LinkStudentModal isOpen={true} onClose={vi.fn()} onLink={vi.fn()} />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Busque por nome ou e-mail/i);
    fireEvent.focus(searchInput);

    await waitFor(() => {
      expect(screen.getByText('Mariana Silva')).toBeInTheDocument();
      expect(screen.getByText('Rodrigo Santos')).toBeInTheDocument();
    });

    const rodrigoButton = screen.getByText('Rodrigo Santos').closest('button');
    expect(rodrigoButton).toBeDisabled();
    expect(screen.getByText('Já vinculado')).toBeInTheDocument();

    const marianaButton = screen.getByText('Mariana Silva').closest('button');
    expect(marianaButton).not.toBeDisabled();
    fireEvent.click(marianaButton!);

    expect(screen.getByText('Mariana Silva')).toBeInTheDocument();
    expect(screen.getByText('mariana@pgo.edu.br')).toBeInTheDocument();
    expect(screen.getByText('Verificado')).toBeInTheDocument();

    const changeBtn = screen.getByRole('button', { name: /Trocar/i });
    fireEvent.click(changeBtn);

    expect(screen.getByPlaceholderText(/Busque por nome ou e-mail/i)).toBeInTheDocument();
  });

  it('allows selecting a custom typed email when not found in available list', async () => {
    render(
      <MemoryRouter>
        <LinkStudentModal isOpen={true} onClose={vi.fn()} onLink={vi.fn()} />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Busque por nome ou e-mail/i);
    fireEvent.change(searchInput, { target: { value: 'novo_aluno@instituto.edu.br' } });

    await waitFor(() => {
      expect(screen.getByText(/Usar e-mail informado:/i)).toBeInTheDocument();
    });

    const customEmailBtn = screen.getByText(/Usar e-mail informado:/i).closest('button');
    fireEvent.click(customEmailBtn!);

    expect(screen.getByText('novo_aluno@instituto.edu.br')).toBeInTheDocument();
  });

  it('applies quick theme presets and updates prefix smoothly', async () => {
    render(
      <MemoryRouter>
        <LinkStudentModal isOpen={true} onClose={vi.fn()} onLink={vi.fn()} />
      </MemoryRouter>
    );

    const themeInput = screen.getByLabelText(/Tema do TCC \/ Projeto \*/i);
    const tccPresetBtn = screen.getByRole('button', { name: 'TCC I' });

    fireEvent.click(tccPresetBtn);
    expect(themeInput).toHaveValue('TCC I: ');

    fireEvent.change(themeInput, { target: { value: 'TCC I: Sistema de Recomendação com LLMs' } });
    expect(screen.getByText('39 / 250')).toBeInTheDocument();

    const icPresetBtn = screen.getByRole('button', { name: 'Iniciação Científica' });
    fireEvent.click(icPresetBtn);
    expect(themeInput).toHaveValue('Iniciação Científica: Sistema de Recomendação com LLMs');
  });

  it('applies date shortcut presets and clears date', async () => {
    render(
      <MemoryRouter>
        <LinkStudentModal isOpen={true} onClose={vi.fn()} onLink={vi.fn()} />
      </MemoryRouter>
    );

    const dateInput = screen.getByLabelText(/Data Prevista da Banca/i);
    const plus3MonthsBtn = screen.getByRole('button', { name: '+3 meses' });

    fireEvent.click(plus3MonthsBtn);
    expect((dateInput as HTMLInputElement).value).not.toBe('');

    const clearDateBtn = screen.getByRole('button', { name: 'Limpar data' });
    fireEvent.click(clearDateBtn);
    expect((dateInput as HTMLInputElement).value).toBe('');
  });

  it('successfully creates orientation and displays success view with direct Kanban shortcut', async () => {
    const mockOnLink = vi.fn().mockResolvedValue({
      id: 42,
      theme: 'TCC I: Sistema de Recomendação',
    } as unknown as StudentGuidance);

    render(
      <MemoryRouter>
        <LinkStudentModal isOpen={true} onClose={vi.fn()} onLink={mockOnLink} />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Busque por nome ou e-mail/i);
    fireEvent.focus(searchInput);
    await waitFor(() => screen.getByText('Mariana Silva'));
    fireEvent.click(screen.getByText('Mariana Silva').closest('button')!);

    const themeInput = screen.getByLabelText(/Tema do TCC \/ Projeto \*/i);
    fireEvent.change(themeInput, { target: { value: 'TCC I: Sistema de Recomendação' } });

    fireEvent.click(screen.getByRole('button', { name: '+3 meses' }));

    const submitBtn = screen.getByRole('button', { name: 'Criar Orientação' });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnLink).toHaveBeenCalledWith(
        'mariana@pgo.edu.br',
        'TCC I: Sistema de Recomendação',
        expect.stringContaining('T14:00:00')
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Orientação Criada com Sucesso!')).toBeInTheDocument();
    });

    expect(screen.getByText('TCC I: Sistema de Recomendação')).toBeInTheDocument();

    const kanbanBtn = screen.getByRole('button', { name: /Ir para o Quadro Kanban/i });
    fireEvent.click(kanbanBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/guidance/42');
  });

  it('displays friendly error banner when link operation fails', async () => {
    const mockOnLink = vi.fn().mockRejectedValue({
      response: {
        data: {
          detail: 'Aluno não encontrado com este email.',
        },
      },
    });

    render(
      <MemoryRouter>
        <LinkStudentModal isOpen={true} onClose={vi.fn()} onLink={mockOnLink} />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Busque por nome ou e-mail/i);
    fireEvent.focus(searchInput);
    await waitFor(() => screen.getByText('Mariana Silva'));
    fireEvent.click(screen.getByText('Mariana Silva').closest('button')!);

    const themeInput = screen.getByLabelText(/Tema do TCC \/ Projeto \*/i);
    fireEvent.change(themeInput, { target: { value: 'Tema de Teste' } });

    fireEvent.click(screen.getByRole('button', { name: 'Criar Orientação' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Aluno não encontrado com este email.');
    });
  });

  it('closes on Escape key press', () => {
    const mockClose = vi.fn();
    render(
      <MemoryRouter>
        <LinkStudentModal isOpen={true} onClose={mockClose} onLink={vi.fn()} />
      </MemoryRouter>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
