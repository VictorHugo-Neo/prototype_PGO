import { describe, it, expect, vi } from 'vitest';
import { getTasks } from '../services/taskSevice';
import { api } from '../services/api';

const mockGet = vi.spyOn(api, 'get')

describe('TaskService', () => {
    it('fetches tasks sucessfully', async () => {
        const mockData = [{
            id: 1,
            title: "Teste",
            status: 'pending',
            order: 1
        }];
        mockGet.mockResolvedValue({ data: mockData });
        const result = await getTasks(1);
        expect(api.get).toHaveBeenCalledWith('/guidances/1/tasks');
        expect(result).toEqual(mockData)
    });
});