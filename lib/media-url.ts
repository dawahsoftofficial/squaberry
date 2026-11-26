// Media (everything under public/assets and public/og) is served from DigitalOcean Spaces when
// NEXT_PUBLIC_MEDIA_URL is set (e.g. https://sbsi-cdn.sgp1.cdn.digitaloceanspaces.com/squaberry), and from
// the site itself otherwise. Upload new files with `npm run media:upload`.

export const mediaBase = (process.env.NEXT_PUBLIC_MEDIA_URL ?? '').trim().replace(/\/+$/, '');

/** URL for a site media path such as "/assets/squaberry-logo.svg". Other URLs are returned unchanged. */
export function mediaUrl(src: string): string {
  return mediaBase && (src.startsWith('/assets/') || src.startsWith('/og/')) ? `${mediaBase}${src}` : src;
}
