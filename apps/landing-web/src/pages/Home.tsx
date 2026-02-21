import { useState } from 'react';
import { BookOpen, HeartPulse, GraduationCap, X } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';
import { Hero } from '../components/landing/Hero';
import Services from '../components/landing/Services';
import { Professionals } from '../components/landing/Professionals';
import { FAQ } from '../components/landing/FAQ';
import { Testimonials } from '../components/landing/Testimonials';
import { About } from '../components/landing/About';
import { Footer } from '../components/landing/Footer';
import { TrustBar } from '../components/landing/TrustBar';
import Methodology from '../components/landing/Methodology';

import { BookModal } from '../components/modals/BookModal';
import { ClinicModal } from '../components/modals/ClinicModal';
import { CourseModal } from '../components/modals/CourseModal';
import { LeadCaptureModal } from '../components/modals/LeadCaptureModal';
import { SeoHead } from '../components/shared/SeoHead';

import { TechStack } from '../components/landing/TechStack';

interface ModalData {
  interest?: string;
  [key: string]: unknown;
}

export const Home = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [formStep, setFormStep] = useState(0);

  const openModal = (type: string, data?: unknown) => {
    setActiveModal(type);
    setModalData(data as ModalData);
    setFormStep(0);
  };
  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  const modalConfig: Record<
    string,
    {
      title: string;
      icon: JSX.Element;
      content: JSX.Element;
      className?: string;
      hideTitle?: boolean;
    }
  > = {
    book: {
      title: 'Método Activa: El Libro',
      icon: <BookOpen className="text-brand-primary" size={32} />,
      content: <BookModal />,
    },
    clinic: {
      title: 'Reserva tu Sesión',
      icon: <HeartPulse className="text-brand-primary" size={32} />,
      content: <ClinicModal formStep={formStep} setFormStep={setFormStep} />,
    },
    course: {
      title: 'Certificación Método Activa',
      icon: <GraduationCap className="text-brand-primary" size={32} />,
      content: <CourseModal />,
    },
    'lead-magnet': {
      title: 'Solicitud de Información',
      icon: <BookOpen className="text-brand-primary" size={32} />,
      content: <LeadCaptureModal initialInterest={modalData?.interest} />,
      className: 'p-0',
      hideTitle: true,
    },
  };

  return (
    <>
      <SeoHead />

      {/* MAIN CONTENT WRAPPER */}
      <div id="main-content" className="font-sans antialiased selection:bg-brand-primary selection:text-white bg-brand-dark text-slate-300 min-h-screen relative overflow-x-hidden">
        {/* AMBIENT BACKGROUND LIGHTING (AURORA) */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-brand-primary/10 blur-[120px] rounded-full opacity-60 mix-blend-screen animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vh] bg-brand-secondary/20 blur-[100px] rounded-full opacity-40"></div>
        </div>

        {/* CONTENT LAYER */}
        <div className="relative z-10">
          {/* MODAL COMPONENT */}

          <Navigation />

          <main className="relative flex flex-col justify-center min-h-screen overflow-hidden">
            <section id="hero" data-agent-section="hero">
              <Hero />
            </section>
            <TrustBar />
            <section id="services" data-agent-section="services">
              <Services />
            </section>
            <section id="methodology" data-agent-section="methodology">
              <Methodology onOpenModal={openModal} />
            </section>
            <section id="tech-stack" data-agent-section="tech-stack">
              <TechStack />
            </section>
            <section id="professionals" data-agent-section="professionals">
              <Professionals onOpenModal={openModal} />
            </section>
            <section id="testimonials" data-agent-section="testimonials">
              <Testimonials />
            </section>
            <section id="faq" data-agent-section="faq">
              <FAQ />
            </section>
            <section id="about" data-agent-section="about">
              <About />
            </section>
          </main>
        </div>
        <Footer />
      </div>
      {/* MODAL COMPONENT - ROOT LEVEL PORTAL SIMULATION */}
      {activeModal && modalConfig[activeModal] && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 modal-overlay font-sans"
          role="dialog"
          aria-modal="true"
          aria-label={modalConfig[activeModal].title || 'Modal'}
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'Tab') {
              const focusable = e.currentTarget.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              );
              if (focusable.length === 0) return;
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }
          }}
        >
          <div
            className="absolute inset-0 bg-brand-dark/80 backdrop-blur-xl transition-opacity"
            onClick={closeModal}
            aria-hidden="true"
          ></div>
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden modal-content border border-white/20 ring-1 ring-black/5 transform transition-all scale-100 animate-fade-in-up">
            <div
              className={`bg-white border-b border-gray-100 flex justify-between items-center z-20 relative sticky top-0 ${modalConfig[activeModal].hideTitle ? 'p-4 border-none absolute right-0 bg-transparent' : 'p-8'}`}
            >
              {!modalConfig[activeModal].hideTitle && (
                <div className="flex items-center gap-5">
                  <div className="bg-pink-50 p-3.5 rounded-2xl shadow-sm border border-brand-primary/10 text-brand-primary">
                    {modalConfig[activeModal].icon}
                  </div>
                  <h3 className="font-display font-bold text-2xl text-brand-dark leading-none tracking-tight">
                    {modalConfig[activeModal].title}
                  </h3>
                </div>
              )}
              <button
                onClick={closeModal}
                aria-label="Cerrar modal"
                className={`text-gray-400 hover:text-brand-dark transition-colors p-2.5 rounded-full hover:bg-gray-50 ${modalConfig[activeModal].hideTitle ? 'bg-white/80 shadow-sm' : ''}`}
              >
                <X size={24} />
              </button>
            </div>
            <div
              className={`${modalConfig[activeModal].className || 'p-8'} max-h-[80vh] overflow-y-auto`}
            >
              {modalConfig[activeModal].content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
