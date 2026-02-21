import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';

// Mock RevealSection
vi.mock('../ui/RevealSection', () => ({
    RevealSection: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock lucide-react icons used in Hero
vi.mock('lucide-react', () => ({
    Rocket: ({ className }: { className?: string }) => <div data-testid="icon-rocket" className={className} />,
    Shield: ({ className }: { className?: string }) => <div data-testid="icon-shield" className={className} />,
    ChevronDown: ({ className }: { className?: string }) => <div data-testid="icon-chevron" className={className} />,
}));

describe('Hero Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<Hero />);
        expect(container.querySelector('section')).toBeTruthy();
    });

    it('displays the main headline', () => {
        render(<Hero />);
        const heading = document.querySelector('h1');
        expect(heading).toBeTruthy();
        expect(heading?.textContent).toContain('TU EMPRESA');
    });

    it('has a CTA button linking to programs', () => {
        render(<Hero />);
        const link = screen.getByText(/Ver Catálogo/i);
        expect(link).toBeTruthy();
        expect(link.closest('a')?.getAttribute('href')).toBe('/programas');
    });

    it('has an audit CTA button', () => {
        render(<Hero />);
        const auditLink = screen.getByText(/Auditoría Técnica/i);
        expect(auditLink).toBeTruthy();
        expect(auditLink.closest('a')?.getAttribute('href')).toContain('mailto:');
    });

    it('shows scroll indicator', () => {
        render(<Hero />);
        expect(screen.getByText(/Scroll/i)).toBeTruthy();
        expect(screen.getByTestId('icon-chevron')).toBeTruthy();
    });

    it('has proper section with aria-label', () => {
        const { container } = render(<Hero />);
        const section = container.querySelector('section');
        expect(section?.getAttribute('aria-label')).toBeTruthy();
    });
});
