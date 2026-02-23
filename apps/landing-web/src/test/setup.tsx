import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Define mock props interface to avoid any
type MockProps = { children?: React.ReactNode;[key: string]: unknown };

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: MockProps) => <div {...props}>{children}</div>,
        span: ({ children, ...props }: MockProps) => <span {...props}>{children}</span>,
        p: ({ children, ...props }: MockProps) => <p {...props}>{children}</p>,
        section: ({ children, ...props }: MockProps) => <section {...props}>{children}</section>,
        img: (props: MockProps) => <img {...props} />,
    },
    AnimatePresence: ({ children }: MockProps) => <>{children}</>,
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: () => 0,
    useSpring: () => 0,
    useInView: () => true,
    useAnimation: () => ({ start: vi.fn() }),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
    Sparkles: () => <div data-testid="icon-sparkles" />,
    ArrowRight: () => <div data-testid="icon-arrow-right" />,
    MonitorPlay: () => <div data-testid="icon-monitor-play" />,
    GraduationCap: () => <div data-testid="icon-graduation-cap" />,
    CheckCircle2: () => <div data-testid="icon-check-circle" />,
    Award: () => <div data-testid="icon-award" />,
    Globe: () => <div data-testid="icon-globe" />,
}));

// Mock IntersectionObserver
const IntersectionObserverMock = function () {
    return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    };
};
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// Mock Vite PWA Virtual Module
vi.mock('virtual:pwa-register/react', () => ({
    useRegisterSW: () => ({
        needRefresh: [false, vi.fn()],
        offlineReady: [false, vi.fn()],
        updateServiceWorker: vi.fn(),
    }),
}));
