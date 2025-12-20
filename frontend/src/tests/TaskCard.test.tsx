import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from '../components/TaskCard';

describe('TaskCard Component', () => {
  it('renders content correctly', () => {
    render(
      <TaskCard 
        id={1} 
        title="Ler Artigo Base" 
        description="Ler o PDF enviado" 
        status="pendente" 
        onToggle={() => {}} 
      />
    );
    expect(screen.getByText('Ler Artigo Base')).toBeInTheDocument();
    expect(screen.getByText('Ler o PDF enviado')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const handleToggle = vi.fn();
    render(
      <TaskCard 
        id={1} 
        title="Task Teste" 
        status="pendente" 
        onToggle={handleToggle} 
      />
    );

    fireEvent.click(screen.getByTestId('task-1'));
    expect(handleToggle).toHaveBeenCalledWith(1);
  });

  it('applies visual changes when completed', () => {
    render(
      <TaskCard 
        id={1} 
        title="Task Concluida" 
        status="concluido" 
        onToggle={() => {}} 
      />
    );

    const title = screen.getByText('Task Concluida');
    expect(title).toHaveClass('line-through'); // Verifica o estilo riscado
  });
});