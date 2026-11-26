import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import ProductCard from '@/components/ProductCard';
import ProductSignupForm from '@/components/ProductSignupForm';
import SectionIntro from '@/components/SectionIntro';
import { getProduct, onboardingSteps, products, type ProductImage } from '@/lib/products';

type Props = { params: Promise<{ slug: string }> };

// Only the products in lib/products.ts exist; any other address is a plain 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return products.map(product => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.name,
    description: product.intro,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: `${product.name}: ${product.tagline}`, description: product.intro, images: [{ url: product.cover.src }] },
  };
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

  return (
    <main id="main" className="product-page" style={style}>
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
          <ProductSignupForm product={product.slug} productName={product.name} />
        </div>
      </section>

      <div className="container product-cover reveal">
        <div className="product-cover-media">
          <Image src={product.cover.src} alt={product.cover.alt} fill sizes="(max-width: 1400px) 100vw, 1320px" priority />
        </div>
      </div>

      <section className="container section" aria-labelledby="featuresTitle">
        <SectionIntro label="What’s included" title="Everything you need, ready on day one." id="featuresTitle">
          <p>{product.name} comes set up for your business, with the features below and room to grow.</p>
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
        <section className="container section-tight" aria-labelledby="galleryTitle">
          <SectionIntro label="See it in action" title={product.liveExample ? 'Already running for real customers.' : 'A closer look.'} id="galleryTitle">
            {product.liveExample ? (
              <p>These screens are from <a className="text-link" href={product.liveExample.url} target="_blank" rel="noopener noreferrer">{product.liveExample.label}</a>, built on {product.name}.</p>
            ) : (
              <p>Illustrations of how {product.name} looks and works.</p>
            )}
          </SectionIntro>
          <div className="product-gallery">
            <Shot image={wide} sizes="(max-width: 1400px) 100vw, 1320px" />
            {(tall || side) && (
              <div className={`case-pair${tall && side ? '' : ' is-single'}`}>
                {tall && <Shot image={tall} sizes="(max-width: 640px) 100vw, 520px" />}
                {side && <Shot image={side} sizes="(max-width: 640px) 100vw, 780px" />}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="panel panel-lav section" aria-labelledby="stepsTitle">
        <div className="container">
          <SectionIntro label="Getting started" title="Live in four simple steps." id="stepsTitle" tone="light">
            <p>We handle the setup, so you can keep running your business while we get you ready.</p>
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
        </div>
      </section>

      <section className="container section product-faq-section" aria-labelledby="faqTitle">
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
          {others.map(item => <ProductCard key={item.slug} product={item} className="span-4" />)}
        </div>
      </section>
    </main>
  );
}
