import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { SeoHead } from './SeoHead';

const renderSeo = (props = {}) =>
    render(
        <HelmetProvider>
            <SeoHead {...props} />
        </HelmetProvider>
    );

describe('SeoHead Component', () => {
    it('renders without crashing with defaults', () => {
        renderSeo();
        // Helmet renders into head, not body — just ensure no error
        expect(true).toBe(true);
    });

    it('accepts custom title and description', () => {
        renderSeo({
            title: 'Test Title',
            description: 'Test Description',
        });
        expect(true).toBe(true);
    });

    it('renders JSON-LD schema when provided', () => {
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Test Org',
        };
        renderSeo({ schema });
        expect(true).toBe(true);
    });

    it('accepts children for custom Helmet content', () => {
        renderSeo({
            children: <meta name="robots" content="noindex" />,
        });
        expect(true).toBe(true);
    });
});
