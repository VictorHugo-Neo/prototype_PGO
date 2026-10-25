import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudentHeader } from './StudentHeader';
import type { StudentGuidance } from '../../../types';

describe('StudentHeader - PDF Report Usability', () => {
  const sampleGuidance: StudentGuidance = {
    id: 1,
    theme: 'Plataforma de Gestão com IA',
    defense_date: '2026-11-20T14:00:00',
    created_at: '2026-02-01T10:00:00',
    student: {
      id: 20,
      name: 'Carlos Oliveira',
      email: 'carlos@pgo.edu.br',
    },
    advisor: {
      id: 10,
      name: 'Profa. Dra. Helena',
      email: 'helena@pgo.edu.br',
    },
  };

  const defaultProps = {
    guidance: sampleGuidance,
    myUserId: 10,
    meetingsCount: 3,
    imgError: false,
    isGeneratingPdf: false,
    onImgError: vi.fn(),
    onFileChange: vi.fn(),
    onUpdateDefenseDate: vi.fn().mockResolvedValue(undefined),
    onOpenMeetingsModal: vi.fn(),
    onDownloadReport: vi.fn(),
    onPreviewReport: vi.fn(),
    onOpenCreateTaskModal: vi.fn(),
  };

  it('renders report button and toggles action menu', () => {
    render(
      <MemoryRouter>
        <StudentHeader {...defaultProps} />
      </MemoryRouter>
    );

    const reportBtn = screen.getByRole('button', { name: /ações de relatório em pdf/i });
    expect(reportBtn).toBeInTheDocument();
    expect(reportBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(reportBtn);
    expect(reportBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: /visualizar relatório/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /baixar arquivo pdf/i })).toBeInTheDocument();
  });

  it('calls onPreviewReport when clicking preview option', () => {
    const handlePreview = vi.fn();
    render(
      <MemoryRouter>
        <StudentHeader {...defaultProps} onPreviewReport={handlePreview} />
      </MemoryRouter>
    );

    const reportBtn = screen.getByRole('button', { name: /ações de relatório em pdf/i });
    fireEvent.click(reportBtn);

    const previewBtn = screen.getByRole('menuitem', { name: /visualizar relatório/i });
    fireEvent.click(previewBtn);

    expect(handlePreview).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menuitem', { name: /visualizar relatório/i })).not.toBeInTheDocument();
  });

  it('calls onDownloadReport when clicking download option', () => {
    const handleDownload = vi.fn();
    render(
      <MemoryRouter>
        <StudentHeader {...defaultProps} onDownloadReport={handleDownload} />
      </MemoryRouter>
    );

    const reportBtn = screen.getByRole('button', { name: /ações de relatório em pdf/i });
    fireEvent.click(reportBtn);

    const downloadBtn = screen.getByRole('menuitem', { name: /baixar arquivo pdf/i });
    fireEvent.click(downloadBtn);

    expect(handleDownload).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menuitem', { name: /baixar arquivo pdf/i })).not.toBeInTheDocument();
  });

  it('displays loading state and disables action button when generating PDF', () => {
    render(
      <MemoryRouter>
        <StudentHeader {...defaultProps} isGeneratingPdf={true} />
      </MemoryRouter>
    );

    const reportBtn = screen.getByRole('button', { name: /ações de relatório em pdf/i });
    expect(reportBtn).toBeDisabled();
    expect(screen.getByText(/gerando pdf.../i)).toBeInTheDocument();
  });

  it('closes dropdown menu when Escape key is pressed', () => {
    render(
      <MemoryRouter>
        <StudentHeader {...defaultProps} />
      </MemoryRouter>
    );

    const reportBtn = screen.getByRole('button', { name: /ações de relatório em pdf/i });
    fireEvent.click(reportBtn);
    expect(screen.getByRole('menuitem', { name: /visualizar relatório/i })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menuitem', { name: /visualizar relatório/i })).not.toBeInTheDocument();
  });
});
