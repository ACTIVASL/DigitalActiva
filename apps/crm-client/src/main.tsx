import React from 'react';
import ReactDOM from 'react-dom/client';
import './env'; // 🚨 TITANIUM SECURITY: Enforce Environment Variable Validation at Bootstrap
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { BrowserRouter } from 'react-router-dom';

// TITANIUM FENIX DEPLOY

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </I18nextProvider>
  </React.StrictMode>,
);
