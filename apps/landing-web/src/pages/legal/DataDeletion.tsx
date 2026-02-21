import { Navigation } from '../../components/layout/Navigation';
import { Footer } from '../../components/landing/Footer';
import { Helmet } from 'react-helmet-async';

export const DataDeletion = () => {
  return (
    <div className="bg-[#020617] min-h-screen text-slate-300 font-['Inter']">
      <Helmet>
        <title>Solicitud de Eliminación de Datos | Activa S.L.</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navigation />
      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-4xl mx-auto">
        <h1 className="text-4xl text-white font-['Outfit'] font-bold mb-8">
          Solicitud de Eliminación de Datos
        </h1>
        <div className="prose prose-invert prose-lg">
          <p>
            En cumplimiento con las políticas de Google Play y la normativa de protección de datos,
            ponemos a su disposición este mecanismo para solicitar la eliminación de su cuenta y sus
            datos asociados.
          </p>

          <h3 className="text-pink-500">1. Pasos para solicitar la eliminación</h3>
          <p>
            Para eliminar su cuenta y todos sus datos personales de nuestros sistemas, por favor
            siga estos pasos:
          </p>
          <ol>
            <li>
              Envíe un correo electrónico a <strong>info@activa-sl.digital</strong>
            </li>
            <li>
              Indique en el asunto: <strong>"SOLICITUD DE BAJA / ELIMINACIÓN DE DATOS"</strong>.
            </li>
            <li>
              En el cuerpo del mensaje, incluya el correo electrónico asociado a su cuenta de
              usuario.
            </li>
          </ol>

          <h3 className="text-pink-500">2. Datos que se eliminarán</h3>
          <p>Al procesar su solicitud, se eliminarán permanentemente los siguientes datos:</p>
          <ul>
            <li>Información de perfil (Nombre, Email, Foto).</li>
            <li>Credenciales de acceso.</li>
            <li>Configuraciones personales.</li>
            <li>Registros de actividad no esenciales.</li>
          </ul>

          <h3 className="text-pink-500">3. Retención de Datos (Excepciones)</h3>
          <p>
            Tenga en cuenta que ciertos datos clínicos o de facturación podrían conservarse durante
            el periodo estipulado por la ley (mínimo 5 años para historias clínicas según normativa
            sanitaria española) antes de su destrucción total. Estos datos permanecerán bloqueados y
            accesibles solo para autoridades competentes.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};
