import { Helmet } from 'react-helmet-async';

interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: Record<string, unknown>;
  children?: React.ReactNode;
}

/**
 * Dynamic SEO injector — adds page-specific meta, OG, Twitter, canonical
 * and optional JSON-LD schema. Merges with index.html base tags via Helmet.
 */
export const SeoHead = ({
  title = 'Activa SL Digital | Agencia de Inteligencia Artificial & Transformación Digital',
  description = 'Consultora de Ingeniería de Software de Alto Impacto. Especialistas en Transformación Digital, Sistemas Operativos Empresariales y Google Cloud.',
  keywords = 'agencia ia, software factory, transformacion digital, google cloud, enterprise software, activa sl digital',
  image = 'https://activa-sl-digital.web.app/og-image.png',
  url = 'https://activa-sl-corporate.web.app',
  type = 'website',
  schema,
  children,
}: SeoHeadProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph — Page-specific overrides */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Dynamic JSON-LD Schema */}
      {schema && <script type="application/ld+json">{JSON.stringify(schema)}</script>}

      {children}
    </Helmet>
  );
};
