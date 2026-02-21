import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { FAQ } from './FAQ';

// Mock Helmet to render children inline (for schema detection)
vi.mock('react-helmet-async', async () => {
    const actual = await vi.importActual('react-helmet-async') as Record<string, unknown>;
    return {
        ...actual,
        Helmet: ({ children }: { children?: React.ReactNode }) => <div data-testid="helmet">{children}</div>,
    };
});

const renderFAQ = () =>
    render(
        <HelmetProvider>
            <FAQ />
        </HelmetProvider>
    );

describe('FAQ Component', () => {
    it('renders without crashing', () => {
        const { container } = renderFAQ();
        expect(container.querySelector('section')).toBeTruthy();
    });

    it('renders all FAQ items with <details>/<summary> semantic structure', () => {
        renderFAQ();
        const details = document.querySelectorAll('details');
        expect(details.length).toBeGreaterThanOrEqual(5);
    });

    it('each FAQ item has a summary and answer', () => {
        renderFAQ();
        const details = document.querySelectorAll('details');
        details.forEach((detail) => {
            const summary = detail.querySelector('summary');
            expect(summary).toBeTruthy();
            expect(summary?.textContent?.length).toBeGreaterThan(5);
        });
    });

    it('injects FAQPage JSON-LD schema', () => {
        renderFAQ();
        const helmet = screen.getByTestId('helmet');
        const script = helmet.querySelector('script[type="application/ld+json"]');
        expect(script).toBeTruthy();
        if (script) {
            const schema = JSON.parse(script.textContent || '{}');
            expect(schema['@type']).toBe('FAQPage');
            expect(schema.mainEntity.length).toBeGreaterThanOrEqual(5);
            expect(schema.mainEntity[0]['@type']).toBe('Question');
        }
    });

    it('includes questions about pricing and timelines', () => {
        renderFAQ();
        const summaries = document.querySelectorAll('summary');
        const summaryTexts = Array.from(summaries).map(s => s.textContent || '');
        const hasPricing = summaryTexts.some(t => t.toLowerCase().includes('cuesta'));
        const hasTimeline = summaryTexts.some(t => t.toLowerCase().includes('tarda'));
        expect(hasPricing).toBe(true);
        expect(hasTimeline).toBe(true);
    });
});
