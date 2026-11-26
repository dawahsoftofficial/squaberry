// Shared by the image loader (lib/image-loader.ts), next.config.ts and scripts/upload-media.mjs, so the
// widths the site asks for are exactly the widths uploaded to Spaces. Changing them means re-running
// `npm run media:upload`.

/** next/image `imageSizes` (small, fixed-size images) and `deviceSizes` (full-width breakpoints). */
export const imageSizes = [96, 256, 384];
export const deviceSizes = [640, 828, 1080, 1440, 1920];
export const imageWidths = [...imageSizes, ...deviceSizes];
export const webpQuality = 78;

/** "/assets/portfolio/katori.png" at 640 -> "/assets/portfolio/katori.w640.webp" */
export function variantPath(sitePath, width) {
  return `${sitePath.replace(/\.[a-z0-9]+$/i, '')}.w${width}.webp`;
}
