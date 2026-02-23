/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.tsx',
        css: true,
        alias: {
            '@': path.resolve(__dirname, './src'),
            '\\.(css|less|sass|scss)$': path.resolve(__dirname, './src/test/file-stub.ts'),
            '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': path.resolve(__dirname, './src/test/file-stub.ts'),
            'virtual:pwa-register/react': path.resolve(__dirname, './src/test/pwa-stub.ts'),
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
