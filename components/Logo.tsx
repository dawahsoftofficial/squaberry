import type { ImgHTMLAttributes } from 'react';
import { mediaUrl } from '@/lib/media-url';

// The Squaberry logo (or the mark alone). Like the icons it "boils": the -boil files flick between two
// hand-drawn frames with CSS inside the SVG (scripts/build-logo.mjs). An SVG in an <img> can't be relied
// on to see the visitor's reduced-motion setting, so <picture> swaps in the still (-hand) file then.
// `local` serves it from this site instead of the media CDN (the admin does this).
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { variant?: 'logo' | 'mark'; local?: boolean };

export default function Logo({ variant = 'logo', local = false, alt = 'Squaberry', ...img }: Props) {
  const url = (name: string) => (local ? `/assets/${name}` : mediaUrl(`/assets/${name}`));
  return (
    <picture className="logo-pic">
      <source media="(prefers-reduced-motion: reduce)" srcSet={url(`squaberry-${variant}-hand.svg`)} />
      <img src={url(`squaberry-${variant}-boil.svg`)} alt={alt} {...img} />
    </picture>
  );
}
