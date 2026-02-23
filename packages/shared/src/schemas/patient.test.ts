import { describe, it, expect } from 'vitest';
import { PatientSchema } from './patient';

describe('Patient Zod Schema', () => {
    it('should validate a correct core patient profile', () => {
        const validData = {
            id: 'p-123',
            name: 'John Doe',
            age: 45,
            diagnosis: 'TBI',
            pathologyType: 'neuro',
            status: 'active',
        };

        const result = PatientSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should require a name', () => {
        const invalidData = {
            id: 'p-123',
            age: 45,
        };

        const result = PatientSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.some(i => i.path.includes('name'))).toBe(true);
        }
    });

    it('should fallback securely for legacy childProfile data', () => {
        const dataWithBadChildProfile = {
            id: 'p-123',
            name: 'John Doe',
            age: 45,
            childProfile: 'this is completely wrong, should be a record of records or drop via catch',
        };

        const result = PatientSchema.safeParse(dataWithBadChildProfile);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.childProfile).toBeUndefined(); // Caught and dropped safely
        }
    });
});
