import { Navigation } from '../../components/layout/Navigation';
import { Footer } from '../../components/landing/Footer';
import { SeoHead } from '../../components/shared/SeoHead';

export const Privacy = () => {
  return (
    <>
      <SeoHead title="Política de Privacidad | Activa S.L." />
      <Navigation />
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto font-sans">
        <h1 className="text-4xl font-display font-bold mb-8 text-brand-dark">
          Política de Privacidad
        </h1>
        <div className="prose prose-lg max-w-none text-gray-600">
          <p>Última actualización: Enero 2026</p>
          <p>
            En Activa Digital, nos comprometemos a proteger la privacidad y seguridad de sus
            datos empresariales y personales.
          </p>

          <h3>1. Responsable del Tratamiento</h3>
          <p>
            Activa S.L. Digital
            <br />
            Dirección: Madrid, España
            <br />
            Email: legal@activa-sl.digital
          </p>

          <h3>2. Datos que Recopilamos</h3>
          <ul>
            <li>Datos de identificación (Nombre, Email, Teléfono)</li>
            <li>
              Datos de salud (Motivo de consulta, Diagnóstico previo) - Solo bajo consentimiento
              explícito.
            </li>
            <li>Datos técnicos (IP, Navegador) para seguridad y analítica.</li>
          </ul>

          <h3>3. Finalidad</h3>
          <p>
            Gestionar la reserva de citas, prestar servicios de telemedicina y cumplir
            conobligaciones legales sanitarias.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};
