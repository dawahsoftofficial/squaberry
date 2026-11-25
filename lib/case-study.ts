// Helpers for the project (case-study) pages. The admin stores long text as plain paragraphs
// separated by blank lines, lists one item per line, and gallery images as "src | alt" lines.

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? '')
    .split(/\r?\n\s*\r?\n/)
    .map(part => part.replace(/\s*\r?\n\s*/g, ' ').trim())
    .filter(Boolean);
}

export function lines(text: string | null | undefined): string[] {
  return (text ?? '')
    .split(/\r?\n|,(?![^(]*\))/)
    .map(line => line.trim())
    .filter(Boolean);
}

export type GalleryImage = { src: string; alt: string };

export function galleryImages(text: string | null | undefined): GalleryImage[] {
  return (text ?? '')
    .split(/\r?\n/)
    .map(line => {
      const [src, ...alt] = line.split('|');
      return { src: src.trim(), alt: alt.join('|').trim() };
    })
    .filter(image => isImageSource(image.src));
}

/** A site path into /public or a full http(s) address. */
export function isImageSource(value: string): boolean {
  if (/^\/(?!\/)[\w\-./]+$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** "https://www.example.com/" → "example.com" */
export function displayDomain(url: string | null | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Where a project card should go: its case-study page if it has one, otherwise the live site. */
export function projectHref(project: { slug: string | null; site_url: string | null }): { href: string; external: boolean } | null {
  if (project.slug) return { href: `/work/${project.slug}`, external: false };
  if (project.site_url) return { href: project.site_url, external: true };
  return null;
}

/** Just the fields a project card needs (keeps long case-study text out of client payloads). */
export type CardProject = {
  id: number;
  service_slug: string;
  title: string;
  client: string | null;
  summary: string | null;
  site_url: string | null;
  image_url: string | null;
  slug: string | null;
};

export function toCardProject({ id, service_slug, title, client, summary, site_url, image_url, slug }: CardProject): CardProject {
  return { id, service_slug, title, client, summary, site_url, image_url, slug };
}
