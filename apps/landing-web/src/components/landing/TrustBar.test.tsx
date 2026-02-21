import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrustBar } from './TrustBar';

// Mock RevealSection
vi.mock('../ui/RevealSection', () => ({
    RevealSection: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock lucide-react icons used in TrustBar
vi.mock('lucide-react', () => ({
    Users: ({ className }: { className?: string }) => <div data-testid="icon-users" className={className} />,
    Building: ({ className }: { className?: string }) => <div data-testid="icon-building" className={className} />,
    Award: ({ className }: { className?: string }) => <div data-testid="icon-award" className={className} />,
    Globe: ({ className }: { className?: string }) => <div data-testid="icon-globe" className={className} />,
}));

describe('TrustBar Component', () => {
    it('renders without crashing', () => {
        render(<TrustBar />);
        expect(screen.getByText(/POWERED BY/i)).toBeTruthy();
    });

    it('displays all 4 trust metrics', () => {
        render(<TrustBar />);
        expect(screen.getByText('B2B')).toBeTruthy();
        expect(screen.getByText('100%')).toBeTruthy();
        expect(screen.getByText('24/7')).toBeTruthy();
        expect(screen.getByText('GCP')).toBeTruthy();
    });

    it('displays metric labels', () => {
        render(<TrustBar />);
        expect(screen.getByText(/Google Cloud Partner/i)).toBeTruthy();
        expect(screen.getByText(/Propiedad del Código/i)).toBeTruthy();
    });

    it('renders all 4 icons', () => {
        render(<TrustBar />);
        expect(screen.getByTestId('icon-users')).toBeTruthy();
        expect(screen.getByTestId('icon-building')).toBeTruthy();
        expect(screen.getByTestId('icon-award')).toBeTruthy();
        expect(screen.getByTestId('icon-globe')).toBeTruthy();
    });
});
