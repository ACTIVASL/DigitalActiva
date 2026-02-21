import { Navigation } from '../../components/layout/Navigation';
import { Footer } from '../../components/landing/Footer';
import { SeoHead } from '../../components/shared/SeoHead';

export const Terms = () => {
  return (
    <>
      <SeoHead title="Términos de Servicio | Activa S.L." />
      <Navigation />
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto font-sans">
        <h1 className="text-4xl font-display font-bold mb-8 text-brand-dark">
          Términos de Servicio
        </h1>
        <div className="prose prose-lg max-w-none text-gray-600">
          <p>
            Al utilizar los servicios de Activa Digital, usted acepta los siguientes términos.
          </p>

          <h3>1. Uso de la Plataforma</h3>
          <p>
            Esta plataforma es una herramienta de gestión empresarial y transformación digital.
          </p>

          <h3>2. Propiedad Intelectual</h3>
          <p>
            Todo el contenido (código, algoritmos, metodología) es propiedad exclusiva de Activa
            S.L. Digital.
          </p>

          <h3>3. Cancelaciones</h3>
          <p>Las citas deben cancelarse con al menos 24 horas de antelación.</p>
        </div>
      </main>
      <Footer />
    </>
  );
};
