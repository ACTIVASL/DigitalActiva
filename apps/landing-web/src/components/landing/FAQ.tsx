import { Helmet } from 'react-helmet-async';

const faqs = [
  {
    question: '¿Qué diferencia hay entre una Web High-Performance y una normal?',
    answer:
      'La velocidad y la conversión. Nuestras webs cargan en <0.5s, tienen SEO técnico avanzado y están diseñadas para convertir visitas en clientes, no solo para "tener presencia".',
  },
  {
    question: '¿El CRM y los datos son realmente míos?',
    answer:
      'SÍ. A diferencia de SaaS alquilados donde tus datos están secuestrados, nosotros te entregamos la soberanía total. Base de datos propia bajo tu control legal y técnico.',
  },
  {
    question: '¿Cuánto cuesta un proyecto?',
    answer:
      'Modelo por proyecto, no suscripción. Auditoría técnica desde €5.000. Desarrollo de plataformas desde €15.000. Cada presupuesto es cerrado con hitos de entrega garantizados. El software resultante es un activo de tu empresa, no un alquiler.',
  },
  {
    question: '¿Cuánto tarda un proyecto?',
    answer:
      'Depende de la complejidad: una web high-performance se entrega en 4-6 semanas. Un CRM completo personalizado entre 8-12 semanas. Siempre con hitos quincenales donde ves avances reales en producción.',
  },
  {
    question: '¿Qué mantenimiento requiere la tecnología?',
    answer:
      'El software está diseñado para ser robusto y autónomo. Ofrecemos planes de mantenimiento opcionales para actualizaciones de seguridad y mejoras evolutivas.',
  },
  {
    question: '¿Las Apps funcionan sin internet?',
    answer:
      'Sí. Nuestras PWA (Progressive Web Apps) almacenan datos localmente y sincronizan cuando recuperan conexión. Ideal para operarios en campo o sótanos sin cobertura.',
  },
  {
    question: '¿Cómo se formaliza el contrato?',
    answer:
      'Agendamos una auditoría técnica gratuita. Si encajamos, presentamos propuesta cerrada con hitos de entrega garantizados. Facturación 50% inicio, 50% entrega.',
  },
];

// Auto-generate FAQPage JSON-LD schema from faqs array
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export const FAQ = () => {
  return (
    <section id="faq" aria-label="Preguntas frecuentes" className="py-24 bg-gradient-to-b from-blue-950 to-slate-900 relative overflow-hidden">
      {/* FAQPage Schema for Google Rich Snippets */}
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="absolute top-0 left-0 w-full h-px bg-white/5"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <span className="text-brand-primary font-bold tracking-wider text-sm uppercase font-['Outfit']">
            Resolviendo Dudas
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-black text-white">
            Preguntas <span className="text-brand-primary">Frecuentes</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-white/5 rounded-2xl border border-white/10 open:bg-white/10 open:shadow-xl open:border-brand-primary/30 transition-all duration-300"
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-display font-bold text-white text-lg select-none">
                {faq.question}
                <span className="transform transition-transform duration-300 group-open:rotate-180 bg-white/10 p-2 rounded-full shadow-sm text-brand-primary flex-shrink-0 ml-4">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-slate-300 font-body leading-relaxed animate-fadeIn">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

