import { Helmet } from 'react-helmet-async';
import { Navigation } from '../../components/layout/Navigation';
import { Footer } from '../../components/landing/Footer';
import { RevealSection } from '../../components/ui/RevealSection';
import { Calendar, MessageCircle, ArrowLeft } from 'lucide-react';
import blogHeader from '../../assets/images/blog_header.png';
import { Link } from 'react-router-dom';

export const BenefitsPost = () => {
  // SEO Structured Data
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Beneficios de la Musicoterapia en la Salud',
    image: 'https://activa-sl-digital.web.app/assets/blog-musicoterapia.jpg', // Placeholder
    author: {
      '@type': 'Organization',
      name: 'Activa S.L.',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Activa S.L.',
      logo: {
        '@type': 'ImageObject',
        url: 'https://activa-sl-digital.web.app/logo-premium.png',
      },
    },
    datePublished: '2021-06-04',
    dateModified: '2026-01-16',
    description:
      'Descubre cómo la musicoterapia clínica ayuda a tratar trastornos físicos, cognitivos y emocionales, incluyendo Autismo, TDAH y Alzheimer.',
  };

  return (
    <div className="bg-slate-950 min-h-screen font-sans text-slate-300 selection:bg-brand-primary selection:text-white">
      <Helmet>
        <title>Beneficios de la Musicoterapia | Método Activa</title>
        <meta
          name="description"
          content="Análisis profundo sobre los beneficios clínicos de la musicoterapia en trastornos neurológicos, emocionales y del desarrollo."
        />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <Navigation />

      <main className="pt-32 pb-24">
        {/* ARTICLE HEADER */}
        <article className="max-w-4xl mx-auto px-6 lg:px-12">
          {/* SPLIT HEADER: Title is Revealed, Image is INSTANT (LCP Optimization) */}
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
                <Calendar className="w-4 h-4 mr-2 text-cyan-400" /> 4 junio, 2021
              </span>
              <span className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-2 text-cyan-400" /> 1 comentario
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs uppercase tracking-wider">
                Divulgación
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-tight mb-8">
              Beneficios de la <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-cyan-400">
                Musicoterapia Clínica
              </span>
            </h1>
          </RevealSection>

          {/* Featured Image - EAGER LOAD (No Reveal Animation for LCP) */}
          <div className="w-full aspect-video rounded-3xl border border-white/10 mb-12 flex items-center justify-center overflow-hidden relative group shadow-2xl bg-slate-900">
            <div className="absolute inset-0 bg-brand-primary/10 blur-[50px] opacity-40"></div>
            <img
              src={blogHeader}
              alt="Representación artística de Nano-tecnología musical y cerebro humano"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              fetchPriority="high"
              loading="eager"
              decoding="sync"
            />
          </div>

          {/* ARTICLE CONTENT */}
          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-white prose-p:text-slate-300 prose-a:text-brand-primary prose-li:text-slate-300 prose-strong:text-white">
            <RevealSection delay={200}>
              <p className="lead text-xl leading-relaxed text-slate-200">
                Que la música y el entretenimiento están estrechamente ligadas es algo que no da
                lugar a demasiado debate. Sin embargo, no hay que olvidar los{' '}
                <strong>beneficios de la musicoterapia</strong> para tratar ciertos trastornos.
              </p>

              <p>
                Podemos encontrar la música en las calles gracias a increíbles artistas callejeros,
                también podemos verla en las bandas sonoras de la mayoría de películas, en
                espectáculos de cualquier tipo, en multitudes de plataformas musicales, en la
                orquesta de forma más clásica y sofisticada, en la publicidad, en la radio del coche
                y un largo etcétera.
              </p>
              <p>
                Además, la música se constituye junto a la arquitectura, pintura, escultura, danza,
                literatura y cine, como uno de los 7 artes clásicos. La cual destaca por una
                combinación de ritmo, armonía y melodía de sonidos instrumentales y vocales.
              </p>

              <div className="p-8 my-8 bg-brand-dark border-l-4 border-brand-primary rounded-r-xl">
                <p className="italic text-lg text-white m-0">
                  "Sin embargo, la música no se queda ahí, y va mucho más allá del propio
                  entretenimiento y del arte. Ya que si se utiliza como es debido, es capaz de
                  ayudar a resolver problemas físicos, sociales, psicológicos o emocionales de las
                  personas… ¡Gracias a los beneficios de la musicoterapia!"
                </p>
              </div>

              <h2>Ahora bien… ¿Qué es la musicoterapia?</h2>
              <p>
                En primer lugar, si atendemos a la etimología del término, la musicoterapia se
                divide en “música” y “terapia”, es decir: la terapia de la música.
              </p>
              <p>
                Es básicamente un proceso terapéutico en el que se utiliza música y los elementos
                propios de ella: efectos sonoros, ritmos, armonías, melodías… para tratar de
                favorecer la comunicación, las relaciones interpersonales, la motivación,
                expresividad, el aprendizaje o el movimiento corporal de personas con problemas de
                estas características.
              </p>
              <p>
                Los beneficios de la musicoterapia se relacionan directamente con el sistema
                sensorial auditivo y es de tipo no verbal, aunque se puede combinar con alguna
                terapia de este tipo.
              </p>
              <p>
                Por otro lado, aunque es muy común el uso de la musicoterapia en bebés, niños y
                ancianos (sobre todo para tratar el Alzheimer), también se realizan tratamientos
                para adultos igual de efectivos.
              </p>

              <h3>¿Cómo surgió la terapia musical?</h3>
              <p>
                Pese a que la musicoterapia parezca un concepto relativamente moderno, podríamos
                decir que lleva existiendo y utilizándose desde la antigüedad, aunque no con la
                misma base científica con la que se utiliza hoy en día.
              </p>
              <p>
                Documentos encontrados constatan que desde el año 1500 antes de Cristo la música se
                ha utilizado para tratar de curar problemas. Algunos ejemplos son:
              </p>
              <ul>
                <li>En el antiguo Egipto: curar la fertilidad de mujeres</li>
                <li>En la antigua Grecia: prevenir o curar enfermedades</li>
                <li>
                  Hace miles de años en China: Sanar órganos mediante notas musicales específicas
                </li>
              </ul>
              <p>
                Ya en el siglo XVIII se comenzó a investigar sobre los efectos de la música en las
                personas y en el cuerpo humano desde una perspectiva científica, y no sólo empírica.
              </p>
              <p>
                Durante el siglo XX se procede a la aplicación práctica y científica de la
                musicoterapia, tocando instrumentos musicales en los hospitales americanos en los
                que estaban ingresados combatientes de guerra. A partir de aquí empezaron los
                primeros estudios oficiales y formación académica de musicoterapeutas, hasta
                culminar con el primer congreso mundial de musicoterapia (París, 1974). Actualmente,
                esta ciencia no deja de evolucionar y de adaptarse a las nuevas tecnologías para
                realizar terapias musicales más efectivas.
              </p>

              <h2>¿Quién se encarga de la musicoterapia?</h2>
              <p>
                Obviamente, para sacar los beneficios de la musicoterapia se requiere de un
                profesional cualificado y con experiencia que sepa guiar al paciente durante este
                proceso.
              </p>
              <p>
                Un musicoterapeuta no es simplemente un profesor de música, ya que el objetivo no es
                enseñar música, sino solucionar problemas que presenta el individuo por medio de la
                música.
              </p>
              <p>
                Por ende, el profesional debe estar formado y ser capaz de registrar los cambios y
                evolución que experimenta el paciente. Así pues, los conocimientos en el áreas como
                psicológica, pedagógica o médica (además del ámbito musical) serán necesarios.
              </p>

              <h2>Los tipos de terapia musical</h2>
              <p>
                La terapia con música, no se limita a un solo modo de proceder, si no que cuenta con
                diversas opciones diferentes de tratar al paciente. La primera distinción que
                podemos hacer es según el grado de implicación del paciente, es decir si participan
                de forma activa o son meros receptores. Podemos distinguir dos tipos:
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                <div className="p-6 rounded-2xl bg-[#1A2035] border border-white/5 hover:border-cyan-400/30 transition-colors">
                  <h4 className="text-xl font-bold text-white mb-2 font-display">
                    Musicoterapia receptiva
                  </h4>
                  <p className="text-sm text-slate-300">
                    En este caso el paciente se limita a escuchar los sonidos musicales de la sesión
                    que ha preparado el terapeuta. Este tipo de terapia favorece sobre todo la
                    motivación y el estado anímico, es relajante y reduce los niveles de nerviosismo
                    y ansiedad.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-[#1A2035] border border-white/5 hover:border-brand-primary/30 transition-colors">
                  <h4 className="text-xl font-bold text-white mb-2 font-display">
                    Musicoterapia activa
                  </h4>
                  <p className="text-sm text-slate-300">
                    Esta modalidad por su parte, implica mucho más al paciente, el cual debe
                    interactuar con la música ya sea de forma vocal, instrumental y también corporal
                    (danza). Esta terapia se considera más efectiva en casos complejos.
                  </p>
                </div>
              </div>

              <p>
                Dentro de este grupo podríamos incluir actividades como la improvisación musical con
                instrumentos o de forma vocal, la recreación musical de obras musicales ya
                existentes o la composición musical en la que se debe contemplar también la
                creatividad de idear una pieza musical desde 0.
              </p>

              <h3>Algunas actividades propias de una sesión</h3>
              <ul>
                <li>
                  Escuchar música escogida por el especialista ya sea en vivo o mediante un
                  dispositivo de reproducción de audio.
                </li>
                <li>
                  Técnicas de relajación corporal y respiración profunda, mediante música de
                  acompañamiento (similar al mindfulness).
                </li>
                <li>
                  Cantar alguna canción popular (normalmente con acompañamiento instrumental).
                </li>
                <li>
                  Practicar con algún instrumento musical (instrumentos de percusión y cuerda suelen
                  ser muy habituales).
                </li>
                <li>Improvisación musical o composición musical.</li>
                <li>Análisis de otras obras musicales.</li>
                <li>Baile y danza con un ritmo adecuado para el paciente.</li>
                <li>Detectar las emociones que nos provoca cada pieza musical.</li>
              </ul>

              <h2>Beneficios de la musicoterapia</h2>
              <div className="space-y-4">
                <div>
                  <strong className="text-cyan-400 block mb-1">Beneficios cognitivos:</strong>
                  Mejora la capacidad de aprendizaje, la orientación, la atención, el desarrollo del
                  cerebro, la concentración, las capacidad comunicativas y el lenguaje y expresión
                  oral.
                </div>
                <div>
                  <strong className="text-brand-primary block mb-1">Beneficios físicos:</strong>
                  Articulaciones más fuertes y flexibles, mejora de la musculatura, relajación
                  corporal, mejor coordinación del sistema locomotor.
                </div>
                <div>
                  <strong className="text-yellow-400 block mb-1">
                    Beneficios sociales y emocionales:
                  </strong>
                  Mejores relaciones y habilidades sociales, mayor autoestima, ayuda a evitar el
                  aislamiento social y fomenta la integración, mejora problemas de ansiedad,
                  emocionales y afectivos, mejor estado anímico, mayor facilidad para expresar
                  sentimientos y conseguir un mejor desarrollo personal.
                </div>
              </div>

              <h2>3 importantes trastornos que se pueden tratar</h2>

              <h3>Musicoterapia y autismo</h3>
              <p>
                Los niños y niñas con problemas de TEA o trastorno del espectro autista, suelen
                mostrar mucho interés o incluso fijación por algo concreto, y generalmente, la
                música y los sonidos, es algo con lo que les suele suceder. De hecho los jóvenes
                autistas suelen tener una muy buena capacidad de memoria musical y también gran
                habilidad para componer.
              </p>
              <p>
                Gracias a la música los autistas pueden expresar sus sentimientos y emociones,
                gestionar mejor sus crisis y sentirse más seguros con música, en lugares en los que
                están incómodos. Así pues, ya no solo la musicoterapia puede ser una opción muy
                acertada para trabajar este trastorno, sino directamente el uso de la música en su
                día a día puede mejorar mucho su estado de ánimo y reducir sus niveles de ansiedad.
              </p>

              <h3>Terapia musical y TDAH</h3>
              <p>
                Otro de los trastornos en los que la musicoterapia es muy adecuada, es el de déficit
                de atención e hiperactividad. En este caso, la música supone un medio para conseguir
                relajar y calmar a personas con este tipo de patologías.
              </p>

              <h3>Musicoterapia y Alzheimer</h3>
              <p>
                Por último, el Alzheimer, una de las enfermedades que afecta casi en su totalidad a
                personas ancianas, también se puede tratar mediante la terapia musical. Aunque no
                exista cura para la enfermedad, la musicoterapia puede (de forma no invasiva y sin
                uso de medicamentos) hacer que la enfermedad no se agrave tanto.
              </p>
              <p>
                El tratamiento de musicoterapia para el Alzheimer puede mejorar la función
                cognitiva, reducir la depresión y mejorar en gran medida la calidad de vida de los
                pacientes. La música está directamente ligada a los recuerdos, experiencias y
                vivencias por lo que puede hacer despertar alguna emoción o sensación agradable.
                Además la música puede ayudar a establecer vínculos entre la persona afectada y el
                resto del entorno( cuidadores, familiares, el resto de pacientes…)
              </p>

              <p className="mt-8 text-xl font-medium text-white">
                Como habéis podido comprobar, la música es un muy valioso recurso con el que las
                personas interactuamos constantemente, no solo para disfrutar sino también para
                mejorar nuestra salud y calidad de vida.
              </p>
            </RevealSection>
          </div>

          {/* COMMENTS SECTION UI */}
          <div className="mt-20 border-t border-white/10 pt-16">
            <h3 className="text-2xl font-bold font-display text-white mb-8">Comentarios (1)</h3>

            {/* Existing Comment */}
            <div className="flex gap-4 mb-12">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-cyan-400 flex items-center justify-center font-bold text-white text-lg shrink-0">
                MV
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-white">Musica Viva</span>
                  <span className="text-xs text-slate-500">12 diciembre, 2022 12:37 pm</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed bg-brand-dark p-4 rounded-xl border border-white/5">
                  Gracias por compartir esta información, la verdad que es de gran valor poder
                  disfrutar de la música, que nos ayuda a mejorar nuestro bienestar y algunas
                  habilidades como la creatividad.
                </p>
                <button className="text-cyan-400 text-xs font-bold uppercase tracking-wider mt-2 hover:text-cyan-300">
                  Responder
                </button>
              </div>
            </div>

            {/* Leave a Comment Form */}
            <div className="bg-brand-dark p-8 rounded-3xl border border-white/5">
              <h4 className="text-xl font-bold text-white mb-1">Dejar una respuesta</h4>
              <p className="text-slate-500 text-sm mb-6">
                Tu dirección de correo electrónico no será publicada. Los campos obligatorios están
                marcados con *
              </p>

              <form className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Comentario *
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none resize-none"
                  ></textarea>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-brand-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Correo *
                    </label>
                    <input
                      type="email"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-brand-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Web
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-brand-primary outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="rounded bg-slate-950 border-white/10 text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="privacy" className="text-sm text-slate-400">
                    He leído y acepto la{' '}
                    <span className="text-cyan-400 cursor-pointer hover:underline">
                      Política de privacidad
                    </span>{' '}
                    *
                  </label>
                </div>
                <button
                  type="button"
                  className="px-8 py-3 bg-brand-primary hover:bg-[#D6007F] text-white font-bold rounded-full transition-colors shadow-lg shadow-brand-primary/20"
                >
                  Publicar Comentario
                </button>
              </form>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};
