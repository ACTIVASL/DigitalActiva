import { Navigation } from '../../components/layout/Navigation';
import { Footer } from '../../components/landing/Footer';
import { Helmet } from 'react-helmet-async';

export const TermsOfService = () => {
  return (
    <div className="bg-[#020617] min-h-screen text-slate-300 font-['Inter']">
      <Helmet>
        <title>Términos y Condiciones | Activa S.L.</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navigation />
      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-4xl mx-auto">
        <h1 className="text-4xl text-white font-['Outfit'] font-bold mb-8">
          Términos y Condiciones
        </h1>
        <div className="prose prose-invert prose-lg">
          <p>Vigente desde: Enero 2026</p>

          <h3>1. Naturaleza del Servicio</h3>
          <p>
            Activa S.L. ofrece servicios de rehabilitación neurológica y terapia musical
            basada en evidencia científica. Los resultados pueden variar según el paciente y la
            patología.
          </p>

          <h3>2. Cancelaciones</h3>
          <p>
            Las sesiones deben cancelarse con al menos 24 horas de antelación. En caso contrario, se
            podrá cobrar el importe íntegro de la sesión reservada.
          </p>

          <h3>3. Propiedad Intelectual</h3>
          <p>
            Todo el material didáctico, informes y software proporcionados son propiedad de Método
            Activa S.L.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};
