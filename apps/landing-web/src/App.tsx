import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { NotFound } from './pages/NotFound';

const PrivacyPolicy = lazy(() =>
  import('./pages/legal/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })),
);
const TermsOfService = lazy(() =>
  import('./pages/legal/TermsOfService').then((m) => ({ default: m.TermsOfService })),
);
const DataDeletion = lazy(() =>
  import('./pages/legal/DataDeletion').then((m) => ({ default: m.DataDeletion })),
);

const Home = lazy(() => import('./pages/Home'));
const DigitalizationImportancePost = lazy(() =>
  import('./pages/blog/DigitalizationImportancePost').then((module) => ({ default: module.DigitalizationImportancePost })),
);
const BlogIndex = lazy(() =>
  import('./pages/blog/BlogIndex').then((module) => ({ default: module.BlogIndex })),
);
const Programs = lazy(() =>
  import('./pages/Programs').then((module) => ({ default: module.Programs })),
);


import { ViewTransitions } from './components/ui/ViewTransitions';
import { FilmGrain } from './components/ui/FilmGrain';
import { ErrorBoundary } from '@monorepo/ui-system';


function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <div className="app-container relative">
          <FilmGrain />
          <Router>
            <ViewTransitions />

            <Routes>
              <Route
                path="/"
                element={
                  <Suspense fallback={<div className="min-h-screen" />}>
                    <Home />
                  </Suspense>
                }
              />
              <Route path="/legal/privacy" element={<Suspense fallback={<div className="min-h-screen bg-[#020617]" />}><PrivacyPolicy /></Suspense>} />
              <Route path="/legal/terms" element={<Suspense fallback={<div className="min-h-screen bg-[#020617]" />}><TermsOfService /></Suspense>} />
              <Route path="/legal/data-deletion" element={<Suspense fallback={<div className="min-h-screen bg-[#020617]" />}><DataDeletion /></Suspense>} />


              {/* Blog Routes */}
              <Route
                path="/programas"
                element={
                  <Suspense fallback={<div className="min-h-screen bg-[#020617]" />}>
                    <Programs />
                  </Suspense>
                }
              />
              <Route
                path="/blog"
                element={
                  <Suspense fallback={<div className="min-h-screen bg-[#020617]" />}>
                    <BlogIndex />
                  </Suspense>
                }
              />
              <Route
                path="/blog/importancia-digitalizacion"
                element={
                  <Suspense fallback={<div className="min-h-screen bg-[#020617]" />}>
                    <DigitalizationImportancePost />
                  </Suspense>
                }
              />

              {/* Auth Redirects - SEO Friendly */}
              <Route path="/auth/login" element={<AuthRedirect />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </div>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

const AuthRedirect = () => {
  window.location.href = 'https://activa-sl-corporate.web.app/auth/login';
  return null;
};

const DashboardRedirect = () => {
  window.location.href = 'https://activa-sl-corporate.web.app/dashboard';
  return null;
};

export default App;
