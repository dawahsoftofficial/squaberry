import 'server-only';
import { lines, paragraphs, projectHref } from './case-study';
import type { PortfolioItem } from './data';
import { safeAllProjects } from './portfolio';
import { processSteps } from './process';
import { onboardingSteps, products, type Product } from './products';
import { absoluteUrl, siteDescription, siteEmail, siteName } from './seo';
import { services } from './services';

// /llms.txt and /llms-full.txt (https://llmstxt.org): a Markdown guide to the site for language models,
// built from the same service, product and portfolio data as the pages so it never goes stale.
// llms.txt is the short index of links; llms-full.txt adds each page's main copy.

const intro =
  'We’re a technology partner for organisations that want things to work better. From the first sketch to the systems behind it, we bring design, development, digital marketing and IT support together.';

// Facts a model should not get wrong, shown under the product. Amanah AI's follow its own rules
// (see CLAUDE.md): no AI features are live, it never submits Gift Aid to HMRC, and the charity using it isn't named.
const productNotes: Record<string, string> = {
  'amanah-ai': 'Despite the name, no AI features are live today. It records Gift Aid and builds claim files, but the charity submits claims to HMRC itself. It does not send emailed donor receipts and has no mobile apps.',
};

/** One line of plain text: collapses whitespace so database copy can't break the Markdown list. */
const oneLine = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim();
/** Link text with square brackets escaped. */
const linkText = (text: string) => oneLine(text).replace(/[[\]]/g, match => `\\${match}`);
const link = (text: string, href: string, note?: string | null) => `- [${linkText(text)}](${href})${oneLine(note) ? `: ${oneLine(note)}` : ''}`;

/** Projects that can be linked: their case-study page, or the live site if they have none. */
function linkedProjects(projects: PortfolioItem[]) {
  return projects.flatMap(project => {
    const target = projectHref(project);
    if (!target) return [];
    return [{ project, href: target.external ? target.href : absoluteUrl(target.href) }];
  });
}

const projectNote = (project: PortfolioItem) => [project.summary, project.client && `(${project.client})`].filter(Boolean).join(' ');
const productNote = (product: Product) => [product.headline, productNotes[product.slug]].filter(Boolean).join('. ');

function header(): string[] {
  return [`# ${siteName}`, '', `> ${siteDescription}`, '', intro, '', `To start a project or ask a question, use the enquiry form on the contact page or email ${siteEmail}.`, ''];
}

export async function llmsTxt(): Promise<string> {
  const projects = linkedProjects(await safeAllProjects());
  return [
    ...header(),
    '## Services',
    '',
    link('All services', absoluteUrl('/services'), 'Overview of what we do and how we work'),
    ...services.map(service => link(service.name, absoluteUrl(`/services/${service.slug}`), service.summary)),
    '',
    '## Products',
    '',
    'Ready-made systems we set up, brand and support for each customer.',
    '',
    link('All products', absoluteUrl('/products')),
    ...products.map(product => link(product.name, absoluteUrl(`/products/${product.slug}`), productNote(product))),
    '',
    '## Work',
    '',
    link('All projects', absoluteUrl('/work'), 'Websites, apps and systems we have built, filterable by service'),
    ...projects.map(({ project, href }) => link(project.title, href, projectNote(project))),
    '',
    '## Company',
    '',
    link('About Squaberry', absoluteUrl('/about'), 'Who we are, how we work and the team'),
    link('Contact', absoluteUrl('/contact'), `Enquiry form for new projects and questions; email ${siteEmail}`),
    '',
    '## Optional',
    '',
    link('Full text', absoluteUrl('/llms-full.txt'), 'Every service, product and project with its main copy, in one file'),
    link('Privacy policy', absoluteUrl('/privacy')),
    link('Terms of use', absoluteUrl('/terms')),
    '',
  ].join('\n');
}

export async function llmsFullTxt(): Promise<string> {
  const projects = linkedProjects(await safeAllProjects());
  const out: string[] = [...header()];
  const push = (...items: (string | false | null | undefined)[]) => out.push(...items.filter((item): item is string => typeof item === 'string'));

  push('## How we work', '', ...processSteps.map(step => `- **${step.name}**: ${step.text}`), '');

  push('## Services', '', `Overview: ${absoluteUrl('/services')}`, '');
  for (const service of services) {
    push(`### ${service.name}`, '', `URL: ${absoluteUrl(`/services/${service.slug}`)}`, '', service.intro, '');
    push(...service.deliverables.map(item => `- **${item.title}**: ${item.text}`), '');
    push('A good fit when:', '', ...service.fit.map(item => `- ${item}`), '');
  }

  push('## Products', '', `Overview: ${absoluteUrl('/products')}`, '');
  push('Getting started with any product:', '', ...onboardingSteps.map((step, index) => `${index + 1}. **${step.title}**: ${step.text}`), '');
  for (const product of products) {
    push(`### ${product.name}`, '', `URL: ${absoluteUrl(`/products/${product.slug}`)}`, '', `${product.tagline} ${product.intro}`, '');
    if (productNotes[product.slug]) push(`Note: ${productNotes[product.slug]}`, '');
    push(`Made for: ${product.audience.join(', ')}.`, '');
    if (product.liveExample) push(`Live example: ${product.liveExample.url}`, '');
    push('Features:', '', ...product.features.map(feature => `- **${feature.title}**: ${feature.text}`), '');
    push('Questions:', '', ...product.faqs.map(faq => `- **${faq.question}** ${faq.answer}`), '');
  }

  push('## Work', '', `All projects: ${absoluteUrl('/work')}`, '');
  for (const { project, href } of projects) {
    push(`### ${oneLine(project.title)}`, '', `URL: ${href}`);
    if (project.client) push(`Sector: ${oneLine(project.client)}`);
    if (project.slug && project.site_url) push(`Live site: ${project.site_url}`);
    push('');
    for (const text of [project.summary, project.intro]) if (oneLine(text)) push(oneLine(text), '');
    const scope = lines(project.scope);
    if (scope.length) push(`Scope: ${scope.join(', ')}.`, '');
    for (const [label, text] of [['Overview', project.overview], ['Challenge', project.challenge], ['Solution', project.solution], ['Results', project.results]] as const) {
      const parts = paragraphs(text);
      if (parts.length) push(`${label}:`, '', ...parts.flatMap(part => [part, '']));
    }
    if (oneLine(project.quote)) push(`> ${oneLine(project.quote)}${project.quote_name ? ` (${[project.quote_name, project.quote_role].filter(Boolean).map(oneLine).join(', ')})` : ''}`, '');
  }

  push('## Company', '', `- About: ${absoluteUrl('/about')}`, `- Contact: ${absoluteUrl('/contact')} or ${siteEmail}`, `- Privacy policy: ${absoluteUrl('/privacy')}`, `- Terms of use: ${absoluteUrl('/terms')}`, '');
  return out.join('\n');
}
