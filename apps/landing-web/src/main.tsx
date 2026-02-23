import React from 'react';
import ReactDOM from 'react-dom/client';
import './env'; // 🚨 TITANIUM SECURITY: Enforce Environment Variable Validation at Bootstrap
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
// NUCLEAR CACHE BUST: Unregister any existing service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (const registration of registrations) {
      registration.unregister();
      // console.log('Service Worker Unregistered (Nuclear Cache Bust)');
    }
  });
}
