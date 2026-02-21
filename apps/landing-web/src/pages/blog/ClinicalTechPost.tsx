import { Helmet } from 'react-helmet-async';
import { Navigation } from '../../components/layout/Navigation';
import { Footer } from '../../components/landing/Footer';
import { RevealSection } from '../../components/ui/RevealSection';
import { Calendar, MessageCircle, ArrowLeft, ShieldCheck, Zap, Activity } from 'lucide-react';
import blogHeader from '../../assets/images/blog_header.png';
import { Link } from 'react-router-dom';

export const ClinicalTechPost = () => {
    // SEO Structured Data
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: 'Gestión Clínica 2.0: Por qué tu Excel ya no es suficiente',
        image: 'https://activa-sl-corporate.web.app/assets/blog-tech.jpg',
        author: {
            '@type': 'Organization',
            name: 'Activa S.L.',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Activa S.L.',
            logo: {
                '@type': 'ImageObject',
                url: 'https://activa-sl-corporate.web.app/activa-logo-new.png',
            },
        },
        datePublished: '2026-02-05',
        dateModified: '2026-02-05',
        description:
            'Descubre cómo la tecnología clínica especializada supera a las hojas de cálculo en seguridad, eficiencia y protección de datos.',
    };

    return (
        <div className="bg-slate-950 min-h-screen font-sans text-slate-300 selection:bg-brand-primary selection:text-white">
            <Helmet>
                <title>Gestión Clínica Digital vs Excel | Activa S.L.</title>
                <meta
                    name="description"
                    content="Análisis: Riesgos de usar Excel en terapia y ventajas de un CRM Clínico especializado (Titanium Standard)."
                />
                <script type="application/ld+json">{JSON.stringify(schema)}</script>
            </Helmet>

            <Navigation />

            <main className="pt-32 pb-24">
                {/* ARTICLE HEADER */}
                <article className="max-w-4xl mx-auto px-6 lg:px-12">
                    <RevealSection>
                        <Link
                            to="/"
                            className="inline-flex items-center text-brand-primary hover:text-white transition-colors mb-8 group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Volver al inicio
                        </Link>

                        <div className="flex flex-wrap gap-4 text-sm font-medium mb-6 text-slate-400">
                            <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-cyan-400" /> 5 febrero, 2026
                            </span>
                            <span className="flex items-center">
                                <MessageCircle className="w-4 h-4 mr-2 text-cyan-400" /> 0 comentarios
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs uppercase tracking-wider">
                                Tecnología Clínica
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-tight mb-8">
                            Gestión Clínica 2.0: <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-cyan-400">
                                El Fin del Excel
                            </span>
                        </h1>
                    </RevealSection>

                    {/* Featured Image */}
                    <div className="w-full aspect-video rounded-3xl border border-white/10 mb-12 flex items-center justify-center overflow-hidden relative group shadow-2xl bg-slate-900">
                        <div className="absolute inset-0 bg-brand-primary/10 blur-[50px] opacity-40"></div>
                        <img
                            src={blogHeader}
                            alt="Digitalización Clínica"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                            fetchPriority="high"
                        />
                    </div>

                    {/* ARTICLE CONTENT */}
                    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-white prose-p:text-slate-300 prose-a:text-brand-primary prose-li:text-slate-300 prose-strong:text-white">
                        <RevealSection delay={200}>
                            <p className="lead text-xl leading-relaxed text-slate-200">
                                Durante años, la hoja de cálculo ha sido la mejor amiga del terapeuta independiente. Sin embargo, en 2026, gestionar datos sensibles de pacientes en un archivo local no solo es ineficiente: <strong>es un riesgo crítico de seguridad</strong>.
                            </p>

                            <h2>El "Falso Amigo": Por qué Excel te está frenando</h2>
                            <p>
                                Iniciar una práctica clínica con un Excel es normal y comprensible. Es gratis y familiar. Pero a medida que tu cartera de pacientes crece, las limitaciones se vuelven muros infranqueables:
                            </p>
                            <ul>
                                <li><strong>Datos Dispersos:</strong> Facturas en una carpeta, notas clínicas en Word, citas en Google Calendar.</li>
                                <li><strong>Sin Seguridad Real:</strong> Un archivo de Excel se puede copiar, enviar por error o perder si falla tu disco duro.</li>
                                <li><strong>Cero Auditoría:</strong> ¿Quién modificó esa celda? ¿Cuándo se cambió el historial médico? En Excel, no hay rastro.</li>
                            </ul>

                            <div className="p-8 my-8 bg-brand-dark border-l-4 border-brand-primary rounded-r-xl">
                                <p className="italic text-lg text-white m-0">
                                    "La digitalización no es usar un ordenador. Es usar sistemas inteligentes que trabajen por ti mientras tú cuidas de tus pacientes."
                                </p>
                            </div>

                            <h2>La Era del CRM Clínico (Titanium Standard)</h2>
                            <p>
                                La tecnología especializada (SaaS Clínico) ha democratizado herramientas que antes solo tenían los grandes hospitales. Plataformas como <strong>Activa Titanium</strong> ofrecen:
                            </p>

                            <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                                <div className="p-6 rounded-2xl bg-[#1A2035] border border-white/5 hover:border-cyan-400/30 transition-colors group">
                                    <ShieldCheck className="w-8 h-8 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                                    <h4 className="text-xl font-bold text-white mb-2 font-display">
                                        Seguridad Blindada
                                    </h4>
                                    <p className="text-sm text-slate-300">
                                        Encriptación de grado militar, copias de seguridad automáticas y cumplimiento estricto de LOPD/GDPR. Tus datos no están en "tu ordenador", están en la nube segura.
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-[#1A2035] border border-white/5 hover:border-brand-primary/30 transition-colors group">
                                    <Zap className="w-8 h-8 text-brand-primary mb-4 group-hover:scale-110 transition-transform" />
                                    <h4 className="text-xl font-bold text-white mb-2 font-display">
                                        Automatización Total
                                    </h4>
                                    <p className="text-sm text-slate-300">
                                        Facturas recurrentes generadas solas. Recordatorios de citas automáticos. Informes clínicos con un clic. Recupera 10 horas al mes.
                                    </p>
                                </div>
                            </div>

                            <h3>Lo que ganas al migrar hoy</h3>
                            <p>
                                El cambio asusta, pero el coste de no cambiar es mayor. Al adoptar un sistema operativo clínico:
                            </p>
                            <ul>
                                <li><strong>Profesionalidad:</strong> Tus pacientes reciben facturas y comunicaciones con tu marca, no emails genéricos.</li>
                                <li><strong>Paz Mental:</strong> Saber que si pierdes tu portátil, no pierdes tu clínica.</li>
                                <li><strong>Escalabilidad:</strong> Crece sin miedo. Gestiona 10 o 100 pacientes con la misma facilidad.</li>
                            </ul>

                            <h2>Conclusión: Tu tiempo es para sanar</h2>
                            <p>
                                No estudiaste años de terapia para pelearte con celdas y fórmulas. Deja que la tecnología se encargue de la burocracia.
                            </p>
                            <p>
                                Da el salto a la **Gestión Clínica 2.0**. Tu "yo del futuro" te lo agradecerá.
                            </p>

                            <div className="mt-12 p-8 bg-gradient-to-br from-brand-primary/20 to-cyan-400/10 rounded-3xl border border-white/10 text-center">
                                <h3 className="text-2xl font-bold text-white mb-4">¿Listo para modernizar tu clínica?</h3>
                                <p className="text-slate-300 mb-6">Únete a cientos de terapeutas que ya usan Activa.</p>
                                <a
                                    href="https://activa-sl-digital.web.app/auth/login"
                                    className="inline-flex items-center px-8 py-3 bg-brand-primary hover:bg-[#D6007F] text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-brand-primary/20"
                                >
                                    <Activity className="w-5 h-5 mr-2" />
                                    Empezar Prueba Gratuita
                                </a>
                            </div>

                        </RevealSection>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
};
