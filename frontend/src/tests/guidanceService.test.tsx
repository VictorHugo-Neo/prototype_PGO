import {describe, it, expect} from 'vitest'
import {getDashboardData} from '../services/guidanceService'

describe('GuidanceService', () => {
    it('return formatted dashboard date', async () => {
        const date = await getDashboardData(1);
        expect(date).toHaveLength(3);
        expect(date[0]).toHaveProperty("progress");
        expect(date[0].nameStudent).toBe("Pedro");

    });
});