import { Navigation } from '../../components/layout/Navigation';
import { Footer } from '../../components/landing/Footer';
import { Helmet } from 'react-helmet-async';

export const PrivacyPolicy = () => {
  return (
    <div className="bg-[#020617] min-h-screen text-slate-300 font-['Inter']">
      <Helmet>
        <title>Aviso de Privacidad | Activa S.L.</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navigation />
      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-4xl mx-auto">
        <h1 className="text-4xl text-white font-['Outfit'] font-bold mb-8">Aviso de Privacidad</h1>
        <div className="prose prose-invert prose-lg">
          <p>Última actualización: Enero 2026</p>
          <p>
            En cumplimiento con el Reglamento General de Protección de Datos (RGPD) y la normativa
            sanitaria vigente,
            <strong>Activa S.L.</strong> informa sobre el tratamiento de datos personales.
          </p>
          <h3>1. Responsable del Tratamiento</h3>
          <p>Método Activa S.L. - Madrid, España.</p>

          <h3>2. Finalidad</h3>
          <p>Sus datos clínicos y personales serán utilizados exclusivamente para:</p>
          <ul>
            <li>Gestión de historia clínica y seguimiento terapéutico.</li>
            <li>Facturación y gestión administrativa.</li>
            <li>Comunicación de citas y recordatorios.</li>
          </ul>

          <h3>3. Seguridad</h3>
          <p>
            Implementamos medidas de seguridad de nivel alto (cifrado AES-256, autenticación de
            doble factor) para proteger su información médica sensible.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};
