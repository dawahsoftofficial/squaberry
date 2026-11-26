// next/image loader (next.config.ts `images.loaderFile`). Site images under /assets are served from
// Spaces as the pre-resized WebP copy for the requested width (see scripts/upload-media.mjs), so the
// browser downloads a right-sized file from the CDN and the server does no image work.
import { imageWidths, variantPath } from './media.mjs';
import { mediaBase } from './media-url';

type LoaderProps = { src: string; width: number; quality?: number };

export default function spacesImageLoader({ src, width }: LoaderProps): string {
  if (!src.startsWith('/assets/')) return `${src}#w=${width}`; // external image (e.g. a URL set in the admin): as is
  if (!mediaBase) return `${src}?w=${width}`; // no Spaces configured (local development): the original file
  if (src.endsWith('.svg')) return `${mediaBase}${src}`;
  const size = imageWidths.find(candidate => candidate >= width) ?? imageWidths[imageWidths.length - 1];
  return `${mediaBase}${variantPath(src, size)}`;
}
