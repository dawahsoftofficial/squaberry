// schema.org structured data (JSON-LD) for search engines. Rendered with components/JsonLd.tsx.
import { absoluteUrl, siteDescription, siteEmail, siteName, siteTagline, siteUrl } from './seo';

type Thing = Record<string, unknown>;

export const organizationId = `${siteUrl}/#organization`;
const websiteId = `${siteUrl}/#website`;

/** The business and the website: added to every public page by the (site) layout. */
export function siteSchema(): Thing[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': organizationId,
      name: siteName,
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/icon-512.png'), width: 512, height: 512 },
      image: absoluteUrl('/og/home.jpg'),
      email: siteEmail,
      description: siteDescription,
      slogan: siteTagline,
      contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: siteEmail, availableLanguage: ['English'] },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      url: siteUrl,
      name: siteName,
      description: siteDescription,
      inLanguage: 'en-GB',
      publisher: { '@id': organizationId },
    },
  ];
}

/** Breadcrumb trail; Home is added first. */
export function breadcrumbSchema(trail: { name: string; path: string }[]): Thing {
  const items = [{ name: 'Home', path: '/' }, ...trail];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}

export function serviceSchema(service: { name: string; summary: string; slug: string; tags: string[] }, image: string): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${absoluteUrl(`/services/${service.slug}`)}#service`,
    name: service.name,
    serviceType: service.name,
    description: service.summary,
    url: absoluteUrl(`/services/${service.slug}`),
    image,
    provider: { '@id': organizationId },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: service.name,
      itemListElement: service.tags.map(tag => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: tag } })),
    },
  };
}

export function productSchema(product: { name: string; slug: string; intro: string; tagline: string; features: { title: string }[] }, image: string): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${absoluteUrl(`/products/${product.slug}`)}#product`,
    name: product.name,
    headline: product.tagline,
    description: product.intro,
    url: absoluteUrl(`/products/${product.slug}`),
    image,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    featureList: product.features.map(feature => feature.title),
    publisher: { '@id': organizationId },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
  };
}

export function caseStudySchema(project: { title: string; slug: string; summary: string | null; client: string | null; site_url: string | null }, description: string, image: string | null): Thing {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${absoluteUrl(`/work/${project.slug}`)}#work`,
    name: `${project.title} case study`,
    headline: project.summary ?? project.title,
    description,
    url: absoluteUrl(`/work/${project.slug}`),
    ...(image ? { image } : {}),
    ...(project.client ? { genre: project.client } : {}),
    ...(project.site_url ? { about: { '@type': 'WebSite', name: project.title, url: project.site_url } } : {}),
    creator: { '@id': organizationId },
    inLanguage: 'en-GB',
  };
}
