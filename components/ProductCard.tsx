import Image from 'next/image';
import Link from 'next/link';
import Icon from './Icon';
import type { Product } from '@/lib/products';

type Props = { product: Product; className?: string; priority?: boolean };

/** Framed product card (same look as project cards): cover, name, headline, tags and arrow. */
export default function ProductCard({ product, className = '', priority = false }: Props) {
  return (
    <article className={`project-card product-card tilt-in ${className}`} style={{ ['--accent' as string]: product.accent }}>
      <Link href={`/products/${product.slug}`} aria-label={`${product.name}: ${product.headline}. Learn more`}>
        <div className="project-media">
          <Image src={product.cover.src} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 640px" priority={priority} />
        </div>
        <div className="project-meta">
          <div className="project-text">
            <p className="project-name product-name"><span className="product-icon"><Icon name={product.icon} size={16} /></span>{product.name}</p>
            <h3>{product.headline}</h3>
          </div>
          <div className="project-foot">
            <ul className="tag-row" aria-label="Product details">
              <li className="tag is-service">{product.category}</li>
              {product.liveExample && <li className="tag">Live at {product.liveExample.label}</li>}
            </ul>
            <span className="project-go" aria-hidden="true"><Icon name="arrow-up-right" size={20} /></span>
          </div>
        </div>
      </Link>
    </article>
  );
}
