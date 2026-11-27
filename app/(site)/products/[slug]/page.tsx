import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CaseNav from '@/components/CaseNav';
import Icon from '@/components/Icon';
import JsonLd from '@/components/JsonLd';
import ProductCard from '@/components/ProductCard';
import ProductSignupForm from '@/components/ProductSignupForm';
import SectionIntro from '@/components/SectionIntro';
import { getProduct, onboardingSteps, products, type ProductImage } from '@/lib/products';
import { breadcrumbSchema, faqSchema, productSchema } from '@/lib/schema';
import { absoluteUrl, clip, ogImage, pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

// Only the products in lib/products.ts exist; any other address is a plain 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return products.map(product => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return { title: 'Product not found' };
  return pageMetadata({
    title: `${product.name} for your ${product.organisation ?? 'business'}`,
    description: clip(product.intro, 158),
    path: `/products/${product.slug}`,
    og: `product-${product.slug}`,
  });
}

function Shot({ image, sizes }: { image: ProductImage; sizes: string }) {
  return (
    <figure className="case-shot reveal">
      <Image src={image.src} alt={image.alt} fill sizes={sizes} />
    </figure>
  );
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const [wide, tall, side] = product.gallery;
  const others = products.filter(item => item.slug !== product.slug);
  const style = { ['--accent' as string]: product.accent };
  const organisation = product.organisation ?? 'business';
  // Four related cards sit two by two; three stay in one row (no card alone on a row).
  // Sidebar links, in page order (the gallery only when there are screenshots).
  const sections = [
    { id: 'features', label: 'What’s included' },
    ...(wide ? [{ id: 'gallery', label: 'See it in action' }] : []),
    { id: 'setup', label: 'Getting started' },
    { id: 'faq', label: 'Questions' },
  ];

  return (
    <main id="main" className="product-page" style={style}>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: 'Products', path: '/products' }, { name: product.name, path: `/products/${product.slug}` }]),
          productSchema(product, absoluteUrl(ogImage(`product-${product.slug}`))),
          faqSchema(product.faqs),
        ]}
      />
      <section className="container product-hero" aria-labelledby="pageTitle">
        <div className="product-hero-main">
          <span className="eyebrow rise"><Link href="/products">Products</Link> <span aria-hidden="true">/</span> {product.name}</span>
          <h1 id="pageTitle" className="display-l rise d1">{product.tagline}</h1>
          <p className="lead rise d2">{product.intro}</p>
          <ul className="product-highlights rise d2">
            {product.highlights.map(item => (
              <li key={item}><span className="product-check" aria-hidden="true"><Icon name="check" size={14} /></span>{item}</li>
            ))}
          </ul>
          <div className="product-meta rise d3">
            <ul className="tag-row" aria-label="Made for">
              {product.audience.map(item => <li className="tag" key={item}>{item}</li>)}
            </ul>
            {product.liveExample && (
              <a className="text-link" href={product.liveExample.url} target="_blank" rel="noopener noreferrer">
                See it live at {product.liveExample.label} <Icon name="arrow-up-right" size={16} /><span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
        <div className="product-hero-form rise d2" id="signup">
          <ProductSignupForm product={product.slug} productName={product.name} organisation={product.organisation} />
        </div>
      </section>

      <div className="container product-cover reveal">
        <div className="product-cover-media">
          <Image src={product.cover.src} alt={product.cover.alt} fill sizes="(max-width: 1400px) 100vw, 1320px" priority />
        </div>
      </div>

      <div className="container case-layout product-layout">
        <aside className="case-side product-side" aria-label="About this product">
          <div className="case-side-inner" data-lenis-prevent>
            <CaseNav sections={sections} articleId="product-article" />
            <dl className="case-facts">
              <div className="is-wide">
                <dt>Made for</dt>
                <dd><ul className="tag-row">{product.audience.map(item => <li className="tag" key={item}>{item}</li>)}</ul></dd>
              </div>
              {product.liveExample && (
                <div className="is-wide">
                  <dt>See it live</dt>
                  <dd><a href={product.liveExample.url} target="_blank" rel="noopener noreferrer">{product.liveExample.label}<span className="visually-hidden"> (opens in a new tab)</span></a></dd>
                </div>
              )}
            </dl>
            <a className="btn is-accent" href="#signup"><span>Get started</span><span className="btn-icon"><Icon name="arrow-up-right" size={18} /></span></a>
          </div>
        </aside>

        <div className="product-article" id="product-article">
          <section id="features" aria-labelledby="featuresTitle">
            <SectionIntro label="What’s included" title="Everything you need, ready on day one." id="featuresTitle">
              <p>{product.name} comes set up for your {organisation}, with the features below and room to grow.</p>
            </SectionIntro>
            <ul className={`feature-grid${product.features.length % 4 === 0 ? ' cols-4' : ''}`}>
              {product.features.map(feature => (
                <li className="feature-card reveal" key={feature.title}>
                  <span className="feature-icon"><Icon name={feature.icon} size={26} /></span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </li>
              ))}
            </ul>
          </section>

          {wide && (
            <section id="gallery" aria-labelledby="galleryTitle">
              <SectionIntro label="See it in action" title={product.liveExample ? 'Already running for real customers.' : 'A closer look.'} id="galleryTitle">
                {product.liveExample ? (
                  <p>These screens are from <a className="text-link" href={product.liveExample.url} target="_blank" rel="noopener noreferrer">{product.liveExample.label}</a>, built on {product.name}.</p>
                ) : (
                  <p>Illustrations of how {product.name} looks and works.</p>
                )}
              </SectionIntro>
              <div className="product-gallery">
                <Shot image={wide} sizes="(max-width: 960px) 100vw, 900px" />
                {(tall || side) && (
                  <div className={`case-pair${tall && side ? '' : ' is-single'}`}>
                    {tall && <Shot image={tall} sizes="(max-width: 640px) 100vw, 360px" />}
                    {side && <Shot image={side} sizes="(max-width: 640px) 100vw, 540px" />}
                  </div>
                )}
              </div>
            </section>
          )}

          <section id="setup" className="panel panel-lav product-steps" aria-labelledby="stepsTitle">
            <SectionIntro label="Getting started" title="Live in four simple steps." id="stepsTitle" tone="light">
              <p>We handle the setup, so you can keep running your {organisation} while we get you ready.</p>
            </SectionIntro>
            <ol className="feature-grid cols-4 steps-grid">
              {onboardingSteps.map((step, index) => (
                <li className="feature-card reveal" key={step.title}>
                  <span className="feature-top">
                    <span className="feature-icon"><Icon name={step.icon} size={26} /></span>
                    <span className="feature-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  </span>
                  <h3><span className="visually-hidden">Step {index + 1}: </span>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section id="faq" className="product-faq-section" aria-labelledby="faqTitle">
            <SectionIntro label="Questions" title="Good to know." id="faqTitle">
              <p>Can’t see your question? Ask it in the form and we’ll reply by email.</p>
            </SectionIntro>
            <div className="product-faq">
              {product.faqs.map((faq, index) => (
                <details className="faq-item reveal" key={faq.question} open={index === 0}>
                  <summary>
                    <span>{faq.question}</span>
                    <span className="faq-toggle" aria-hidden="true"><Icon name="plus" size={18} /></span>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="section-tight" aria-labelledby="ctaTitle">
        <div className="panel panel-cream cta-panel reveal">
          <h2 id="ctaTitle" className="display-l">Ready to see it working?</h2>
          <div className="cta-side">
            <p>Book a demo of {product.name}, or ask for pricing. It only takes a minute.</p>
            <a className="btn is-dark is-lg" href="#signup"><span>Get started</span><span className="btn-icon"><Icon name="arrow-up-right" size={20} /></span></a>
          </div>
        </div>
      </section>

      <section className="container section" aria-labelledby="moreTitle">
        <SectionIntro label="More products" title="Explore the rest." id="moreTitle" />
        <div className="bento case-related">
          {others.map(item => <ProductCard key={item.slug} product={item} className={others.length % 3 === 0 ? 'span-4' : 'span-6'} />)}
        </div>
      </section>
    </main>
  );
}
