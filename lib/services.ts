// The six services: homepage accordion copy, service-page content, and the enquiry form's topics.

export type Service = {
  slug: string;
  number: string;
  /** Full name, also the enquiry form topic. */
  name: string;
  /** Short name for links ("Let's talk web & apps"). */
  shortName: string;
  /** Homepage accordion paragraph. */
  summary: string;
  tags: string[];
  /** Service page hero: two short lines, the second shown in the accent style. */
  headline: [string, string];
  intro: string;
  deliverables: { title: string; text: string }[];
  fit: string[];
};

export const services: Service[] = [
  {
    slug: 'web-app-development',
    number: '01',
    name: 'Web & app development',
    shortName: 'web & apps',
    summary: 'Fast websites, intuitive apps and custom software, thoughtfully designed around the people who use them.',
    tags: ['Websites', 'E-commerce', 'Custom software'],
    headline: ['Websites and apps', 'that pull their weight.'],
    intro: 'From a sharp marketing site to the custom software running your operations, we design and build digital products that are quick to load, easy to use and simple to keep improving.',
    deliverables: [
      { title: 'Marketing websites', text: 'Clear, fast sites that explain what you do and turn visits into conversations.' },
      { title: 'E-commerce', text: 'Online stores with smooth checkout, sensible product management and the integrations you rely on.' },
      { title: 'Web applications', text: 'Portals, dashboards and booking tools built around the way your people actually work.' },
      { title: 'Custom software', text: 'Bespoke systems and integrations that replace spreadsheets and stitched-together tools.' },
      { title: 'Content management', text: 'Editing that your team can use confidently, without calling a developer for every change.' },
      { title: 'Performance & accessibility', text: 'Quick pages, solid foundations and inclusive design built in from the first line of code.' },
    ],
    fit: ['You need a new website, or your current one no longer reflects the business', 'You want to sell online or simplify how orders are handled', 'A spreadsheet or manual process has outgrown itself'],
  },
  {
    slug: 'design-digital-experiences',
    number: '02',
    name: 'Design & digital experiences',
    shortName: 'design',
    summary: 'From a brand with personality to a product that feels natural, we connect how it looks with how it works.',
    tags: ['Brand identity', 'UI & UX', 'Product design'],
    headline: ['Design with character,', 'built to be used.'],
    intro: 'Good design is more than a nice surface. We shape brands, interfaces and journeys so that the way something looks and the way it works tell the same story.',
    deliverables: [
      { title: 'Brand identity', text: 'Logos, colour, type and tone that give your business a recognisable personality.' },
      { title: 'UI design', text: 'Interfaces that are clear at a glance and consistent from screen to screen.' },
      { title: 'UX & user journeys', text: 'Mapping how people move through your product and removing the friction along the way.' },
      { title: 'Product design', text: 'Turning an idea into flows, prototypes and designs ready for development.' },
      { title: 'Design systems', text: 'Reusable components and guidelines that keep everything on-brand as you grow.' },
      { title: 'Prototyping & testing', text: 'Clickable prototypes to test ideas with real people before anything is built.' },
    ],
    fit: ['Your brand feels dated or doesn’t match the business you’ve become', 'People struggle to find their way around your site or product', 'You have an idea that needs shaping before development starts'],
  },
  {
    slug: 'cloud-infrastructure',
    number: '03',
    name: 'Cloud & infrastructure',
    shortName: 'cloud',
    summary: 'A reliable foundation for your next move. Bring systems together, simplify deployments and make room to grow.',
    tags: ['Cloud migration', 'DevOps', 'Hosting'],
    headline: ['A solid foundation', 'for what comes next.'],
    intro: 'Your technology should be dependable and easy to change. We plan, migrate and manage cloud infrastructure so your systems stay fast, secure and ready to grow.',
    deliverables: [
      { title: 'Cloud migration', text: 'Moving servers, sites and data to the cloud with a careful plan and minimal disruption.' },
      { title: 'Hosting & servers', text: 'Reliable, right-sized hosting for websites, apps and internal tools.' },
      { title: 'DevOps & deployments', text: 'Automated builds and releases, so shipping changes is routine rather than risky.' },
      { title: 'Monitoring & backups', text: 'Knowing when something needs attention, and having a way back if it goes wrong.' },
      { title: 'Cost optimisation', text: 'Reviewing what you run and what you pay for, then trimming what you don’t need.' },
      { title: 'Systems integration', text: 'Connecting the platforms you already use so data flows where it should.' },
    ],
    fit: ['Your servers or hosting feel fragile, slow or expensive', 'Releasing updates is manual and nerve-racking', 'You’re planning a move to the cloud and want it done properly'],
  },
  {
    slug: 'ai-workflow-automation',
    number: '04',
    name: 'AI & workflow automation',
    shortName: 'automation',
    summary: 'Connect your tools and take repetitive tasks off your plate with practical automation shaped around your business.',
    tags: ['AI solutions', 'Automation', 'Integrations'],
    headline: ['Less busywork.', 'More possibility.'],
    intro: 'We find the repetitive, error-prone tasks slowing your team down and automate them, using practical AI where it genuinely helps and simple integrations where it doesn’t need to be clever.',
    deliverables: [
      { title: 'Workflow automation', text: 'Turning repeated manual steps into reliable processes that run on their own.' },
      { title: 'AI assistants', text: 'Practical AI tools for drafting, summarising, sorting and answering, shaped to your business.' },
      { title: 'Tool integrations', text: 'Connecting CRMs, inboxes, spreadsheets and apps so information moves without copy and paste.' },
      { title: 'Document processing', text: 'Extracting and organising information from forms, invoices and emails automatically.' },
      { title: 'Reporting', text: 'Dashboards and scheduled reports that pull together the numbers you check every week.' },
      { title: 'Process review', text: 'Mapping how work gets done today and spotting what is worth automating first.' },
    ],
    fit: ['Your team spends hours copying information between systems', 'You’re curious about AI but want something practical, not a gimmick', 'Important tasks depend on someone remembering to do them'],
  },
  {
    slug: 'it-support-security',
    number: '05',
    name: 'IT support & security',
    shortName: 'IT',
    summary: 'Keep your technology moving with sensible security, ongoing maintenance and people you can talk to.',
    tags: ['IT support', 'Maintenance', 'Cybersecurity'],
    headline: ['Technology that keeps', 'moving with you.'],
    intro: 'Dependable IT shouldn’t need constant attention from you. We look after devices, accounts and systems, keep things secure and up to date, and are on hand when you need help.',
    deliverables: [
      { title: 'Helpdesk support', text: 'Friendly, practical help for everyday technology problems, explained in plain language.' },
      { title: 'Devices & accounts', text: 'Setting up and managing laptops, phones, email and user access as your team changes.' },
      { title: 'Security essentials', text: 'Sensible protections such as multi-factor sign-in, updates and secure configurations.' },
      { title: 'Website maintenance', text: 'Updates, backups and checks that keep your website healthy and secure.' },
      { title: 'Backups & recovery', text: 'Making sure important data is backed up and can be restored when it matters.' },
      { title: 'Security reviews', text: 'Checking for weak spots and giving you a clear, prioritised list of what to fix.' },
    ],
    fit: ['Nobody clearly owns IT in your business', 'You’re unsure how well protected your systems and data are', 'Your website or software hasn’t been maintained for a while'],
  },
  {
    slug: 'strategy-consulting',
    number: '06',
    name: 'Strategy & consulting',
    shortName: 'strategy',
    summary: 'Start with a clear picture. Find the right tools, set useful priorities and map a sensible path forward.',
    tags: ['Tech advisory', 'Roadmaps', 'Digital strategy'],
    headline: ['Start with', 'a clear picture.'],
    intro: 'Before spending on technology, it helps to know what will make the biggest difference. We help you understand where you are, choose the right tools and plan the next steps with confidence.',
    deliverables: [
      { title: 'Technology audit', text: 'An honest look at your current systems, costs and risks, with clear recommendations.' },
      { title: 'Digital roadmaps', text: 'A prioritised plan for what to do next, and what can wait.' },
      { title: 'Tool selection', text: 'Independent advice on choosing software and platforms that suit your business.' },
      { title: 'Project scoping', text: 'Turning a rough idea into a clear brief, budget range and plan.' },
      { title: 'Tech advisory', text: 'An experienced sounding board for technology decisions, when you need one.' },
      { title: 'Digital strategy', text: 'Aligning your website, tools and processes with where the business is heading.' },
    ],
    fit: ['You know things could work better but aren’t sure where to start', 'You’re about to choose new software or start a big project', 'You want a second opinion before committing budget'],
  },
];

export const otherTopic = 'Something else';
export const topics = [...services.map(service => service.name), otherTopic];

export function getService(slug: string): Service | undefined {
  return services.find(service => service.slug === slug);
}
