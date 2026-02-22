/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['Inter', 'sans-serif'],
                'display': ['Outfit', 'sans-serif'], // Replacing 'outfit' key with semantic 'display'
                'body': ['Inter', 'sans-serif'],
            },
            colors: {
                brand: {
                    // Core palette
                    dark: '#020617',       // Deepest background (slate-950)
                    surface: '#0A0F1D',    // Card/modal background
                    card: '#1A2035',       // Elevated card background
                    primary: '#3b82f6',    // Corporate Blue
                    'primary-hover': '#2563eb', // Blue-600
                    pink: '#EC008C',       // Brand Magenta / CTA
                    'pink-hover': '#D6007F', // Magenta hover
                    secondary: '#94a3b8',  // Tech Gray (slate-400)
                    accent: '#f8fafc',     // White text (slate-50)
                    cyan: '#00f3ff',       // Neon cyan accent
                    muted: '#475569',      // Muted text (slate-600)
                    'muted-light': '#64748b', // Muted light (slate-500)
                }
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'bounce-slow': 'bounce 3s infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'flow-deep': 'flowDeep 20s ease-in-out infinite alternate',
                'flow-reverse': 'flowDeep 25s ease-in-out infinite alternate-reverse',
                'cinematic': 'cinematic 60s linear infinite alternate',
                'fade-in': 'fadeIn 1s ease-out forwards',
                'slide-up': 'slideUp 0.8s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                flowDeep: {
                    '0%': { transform: 'scale(1.1) translate(0, 0)' },
                    '100%': { transform: 'scale(1.25) translate(-2%, -2%)' },
                },
                cinematic: {
                    '0%': { transform: 'scale(1.0) translate(0,0)' },
                    '100%': { transform: 'scale(1.25) translate(-3%, -1%)' },
                }
            }
        },
    },
    plugins: [],
}
