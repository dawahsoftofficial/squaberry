import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import ProductCard from '@/components/ProductCard';
import SectionIntro from '@/components/SectionIntro';
import { products } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Ready-made software from Squaberry: gym management, fast food ordering, a WhatsApp AI assistant and website chatbots, set up in your brand and supported by our team.',
  alternates: { canonical: '/products' },
};

const reasons = [
  { icon: 'build', title: 'Set up for you', text: 'We configure everything, bring over your data and test it with you before launch.', accent: '#b3a8ff' },
  { icon: 'design', title: 'In your brand', text: 'Your name, colours, logo and domain, so it feels like your own product from day one.', accent: '#ffb38a' },
  { icon: 'support', title: 'Supported after launch', text: 'Training for your team, updates and a real person to talk to when you need help.', accent: '#9fe6b8' },
];

export default function ProductsPage() {
  return (
    <main id="main">
      <PageHero
        label="Products"
        title={<>Software that’s<br />ready to go.</>}
        lead="Proven products we’ve built and run for real businesses. Pick one, and we’ll set it up in your brand and support you after launch."
        aside={(
          <ul className="hero-services" aria-label="Our products">
            {products.map(product => (
              <li key={product.slug}>
                <Link href={`/products/${product.slug}`} style={{ ['--accent' as string]: product.accent }}>
                  <span className="hero-svc-icon"><Icon name={product.icon} size={18} /></span>
                  {product.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      />

      <section className="container section-tight" aria-label="All products">
        <div className="bento">
          {products.map((product, index) => <ProductCard key={product.slug} product={product} className="span-6" priority={index < 2} />)}
        </div>
      </section>

      <section className="container section" aria-labelledby="whyTitle">
        <SectionIntro label="Why our products" title="Ready-made, never off-the-shelf." id="whyTitle">
          <p>You get software that’s already proven, without the generic feel of a template.</p>
        </SectionIntro>
        <ul className="feature-grid">
          {reasons.map(reason => (
            <li className="feature-card reveal" key={reason.title} style={{ ['--accent' as string]: reason.accent }}>
              <span className="feature-icon"><Icon name={reason.icon} size={26} /></span>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-tight" aria-labelledby="customTitle">
        <div className="panel panel-cream cta-panel reveal">
          <h2 id="customTitle" className="display-l">Need something built from scratch?</h2>
          <div className="cta-side">
            <p>If none of these fit, we design and build custom websites, apps and systems around how you work.</p>
            <Link className="btn is-dark is-lg" href="/contact#enquiry"><span>Start a project</span><span className="btn-icon"><Icon name="arrow-up-right" size={20} /></span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
