import { describe, it, expect } from 'vitest';
import { getStudentTasks, toggleTaskStatus } from '../services/trailService';

describe('TrilhaService', () => {
  it('fetches tasks ordered by mock data', async () => {
    const tasks = await getStudentTasks(1);
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0].title).toBe("Definir Tema do Projeto");
  });

  it('toggles status logic', async () => {
    const newStatus = await toggleTaskStatus(1, 'pendente');
    expect(newStatus).toBe('concluido');

    const revertedStatus = await toggleTaskStatus(1, 'concluido');
    expect(revertedStatus).toBe('pendente');
  });
});