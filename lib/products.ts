// Squaberry's products: the /products page and one onboarding page each (/products/[slug]).
// Signups on those pages are saved as product enquiries (enquiries.product = slug).
//
// DRAFT COPY: the Fast Food system's features come from the Chips n Chops platform's code; Amanah AI's
// come from its own specification (checked against the platform in October 2026); the gym, WhatsApp AI
// and chatbot features are a first draft. Confirm every claim before relying on it.

export type ProductFeature = { icon: string; title: string; text: string };
export type ProductImage = { src: string; alt: string };

export type Product = {
  slug: string;
  name: string;
  /** Card headline on /products. */
  headline: string;
  /** Short category tag. */
  category: string;
  /** Page title on the product page. */
  tagline: string;
  intro: string;
  icon: string;
  accent: string;
  cover: ProductImage;
  /** Three short selling points beside the signup form. */
  highlights: string[];
  features: ProductFeature[];
  /** Screenshots: the first full width, the next two side by side (4:5 then 6:5). */
  gallery: ProductImage[];
  /** A live site running this product, if there is one. */
  liveExample?: { label: string; url: string };
  /** Who it suits (shown as tags). */
  audience: string[];
  /** What the buyer is called in the page title and signup form (“for your charity”). Defaults to “business”. */
  organisation?: string;
  /** The service this product belongs to: linked from the product page, and the product is listed on that service page. */
  service?: string;
  /** The case study of a live site built on this product (cross-linked both ways). */
  caseStudy?: { slug: string; title: string };
  faqs: { question: string; answer: string }[];
};

export const signupInterests = ['Book a demo', 'Get pricing', 'Ask a question'] as const;

export const products: Product[] = [
  {
    slug: 'gym-management-system',
    name: 'Gym Management System',
    headline: 'Members, plans and payments for your gym, in one place',
    category: 'Fitness',
    tagline: 'Run your gym, not spreadsheets.',
    intro: 'A website and management system for gyms and fitness studios: show off your programmes, sign up members and keep plans, payments and attendance organised.',
    icon: 'dumbbell',
    accent: '#b3a8ff',
    cover: { src: '/assets/products/gym-management-system.jpg', alt: 'Gym management dashboard on a laptop and tablet' },
    highlights: ['Your own branded gym website', 'Members, plans and renewals in one dashboard', 'Set up and supported by our team'],
    features: [
      { icon: 'web', title: 'A website that sells memberships', text: 'Programmes, trainers, equipment, pricing and FAQs on a fast, mobile-friendly site in your brand.' },
      { icon: 'members', title: 'Member records', text: 'Every member’s details, plan, start date and history in one searchable list.' },
      { icon: 'calendar', title: 'Plans and renewals', text: 'Set up monthly, quarterly or programme plans and see who is due to renew.' },
      { icon: 'payments', title: 'Payments', text: 'Record payments and see what has been paid and what is outstanding at a glance.' },
      { icon: 'attendance', title: 'Attendance', text: 'Track check-ins to see how often members train and spot who has gone quiet.' },
      { icon: 'language', title: 'More than one language', text: 'Offer your site in more than one language, such as English and Urdu.' },
    ],
    gallery: [
      { src: '/assets/work/fit-track-gym-1.jpg', alt: 'Fit Track Gym website on desktop and phone' },
      { src: '/assets/work/fit-track-gym-2.jpg', alt: 'Fit Track Gym website on a phone' },
      { src: '/assets/work/fit-track-gym-3.jpg', alt: 'Fit Track Gym equipment section on desktop' },
    ],
    liveExample: { label: 'fittrackgym.com', url: 'https://fittrackgym.com/' },
    service: 'web-app-development',
    caseStudy: { slug: 'fit-track-gym', title: 'Fit Track Gym' },
    audience: ['Gyms', 'Fitness studios', 'Women-only gyms', 'Personal trainers'],
    faqs: [
      { question: 'Can I use my own domain and branding?', answer: 'Yes. The site is set up in your brand, on your own domain, with your photos, programmes and pricing.' },
      { question: 'Do I need technical knowledge?', answer: 'No. We set everything up and show you how to manage members, plans and content yourself.' },
      { question: 'Can you bring over my existing members?', answer: 'Usually, yes. Send us your current list (for example a spreadsheet) and we’ll help import it during setup.' },
      { question: 'How much does it cost?', answer: 'It depends on the size of your gym and what you need. Choose “Get pricing” in the form and we’ll send you a quote.' },
    ],
  },
  {
    slug: 'fast-food-system',
    name: 'Fast Food Management System',
    headline: 'Online ordering, kitchen and delivery management for food brands',
    category: 'Food & delivery',
    tagline: 'Take orders. Cook. Deliver. Repeat.',
    intro: 'The platform behind Chips n Chops: a branded ordering website and mobile apps for your customers, and an admin panel for your team to manage orders, menu, stock, staff and customers.',
    icon: 'food',
    accent: '#ffb38a',
    cover: { src: '/assets/products/fast-food-system.jpg', alt: 'Order queue on a tablet and a food ordering app on a phone' },
    highlights: ['Ordering website plus iOS and Android apps', 'Live order board from new to delivered', 'The same platform that runs Chips n Chops'],
    features: [
      { icon: 'web', title: 'Ordering website and apps', text: 'Customers browse your menu, build their order and check out on the web, iPhone or Android.' },
      { icon: 'orders', title: 'Live order management', text: 'Move each order from new to in review, preparing, out for delivery and delivered, with cancellations and refunds handled.' },
      { icon: 'menu_items', title: 'Menu and options', text: 'Categories, items, deals and build-your-own options, published when you are ready.' },
      { icon: 'inventory', title: 'Stock control', text: 'Mark items available, out of stock or discontinued so customers only order what you can make.' },
      { icon: 'payments', title: 'Online payments and cash', text: 'Take card payments online or cash on delivery, with every payment linked to its order.' },
      { icon: 'members', title: 'Customers, staff and roles', text: 'Customer records, sign-in codes over WhatsApp or SMS, and staff roles for admins, managers and order handlers.' },
      { icon: 'bell', title: 'Push notifications', text: 'Send offers and updates straight to customers’ phones.' },
      { icon: 'chart', title: 'Dashboard and audit log', text: 'See today’s orders and sales at a glance, with a log of who changed what.' },
    ],
    gallery: [
      { src: '/assets/work/chips-n-chops-1.jpg', alt: 'Chips n Chops ordering website on desktop and phone' },
      { src: '/assets/work/chips-n-chops-2.jpg', alt: 'Chips n Chops ordering app on a phone' },
      { src: '/assets/work/chips-n-chops-3.jpg', alt: 'Chips n Chops menu and deals on desktop' },
    ],
    liveExample: { label: 'chipsnchops.com', url: 'https://chipsnchops.com/' },
    service: 'web-app-development',
    caseStudy: { slug: 'chips-n-chops', title: 'Chips n Chops' },
    audience: ['Fast food brands', 'Takeaways', 'Cloud kitchens', 'Cafés'],
    faqs: [
      { question: 'Do my customers get an app?', answer: 'Yes. Along with the ordering website there are customer apps for iPhone and Android, published under your brand.' },
      { question: 'Can I take card payments?', answer: 'Yes, through an online payment gateway, alongside cash on delivery. We’ll help connect the gateway you use.' },
      { question: 'Can several staff use it?', answer: 'Yes. Give each person their own sign-in with the right role: admin, manager or order handler.' },
      { question: 'How much does it cost?', answer: 'It depends on your menu, locations and which apps you need. Choose “Get pricing” in the form and we’ll send you a quote.' },
    ],
  },
  {
    // Copy follows Amanah's own rules: one charity uses it, no AI features are live, no mobile apps,
    // it never submits Gift Aid to HMRC and sends no emailed donor receipts. Don't name the charity
    // running it until they agree in writing. Images are Amanah's own product views with sample data.
    slug: 'amanah-ai',
    name: 'Amanah AI',
    headline: 'Donor website, back office and Gift Aid for UK Islamic charities',
    category: 'Charities',
    tagline: 'Donations, donors and Gift Aid, in one system.',
    intro: 'A donor website and back office for UK Islamic charities: appeals and checkout on your own domain, the fund type recorded on every gift, from Zakat and Sadaqah to Fidyah and Qurbani, and Gift Aid tracked on each donation.',
    icon: 'charity',
    accent: '#ff8fc8',
    organisation: 'charity',
    service: 'web-app-development',
    cover: { src: '/assets/products/amanah-ai.jpg', alt: 'Amanah AI back office showing a Zakat donation record, beside the donor checkout on a phone, with sample data' },
    highlights: ['Your own donor website, on your own domain', 'Zakat, Sadaqah and every other fund recorded on each gift', 'Donations go straight into your own Stripe and GoCardless accounts'],
    features: [
      { icon: 'web', title: 'Donor website and checkout', text: 'Appeals, events, news and pages on your domain, with a basket that pays for several appeals at once by card, Apple Pay, Google Pay or Direct Debit.' },
      { icon: 'calculator', title: 'Zakat where you allow it', text: 'Donors choose General, Sadaqah or Zakat on projects you mark Zakat-eligible, and a Zakat calculator adds what they owe to the basket.' },
      { icon: 'funds', title: 'A fund on every gift', text: '13 fund types, from Zakat al-Maal and Zakat al-Fitr to Fidyah, Qurbani and Aqiqah, recorded on every donation wherever it came from.' },
      { icon: 'members', title: 'Donor records', text: 'Each donor’s gifts, Direct Debit mandates, contact preferences and change history in one place, with duplicates merged safely.' },
      { icon: 'payments', title: 'Regular and phone giving', text: 'Monthly card and Direct Debit gifts, and phone gifts your staff take on your own site, tagged by how they came in.' },
      { icon: 'import', title: 'Imports with an undo', text: 'Bring in JustGiving and LaunchGood payouts, collections and cheques by spreadsheet, with a preview first and an undo afterwards.' },
      { icon: 'gift-aid', title: 'Gift Aid on every donation', text: 'Declarations and claim status on each gift, and claim files your team checks and submits through HMRC Charities Online.' },
      { icon: 'security', title: 'Roles and secure sign-in', text: 'Three staff roles, an authenticator code at every back-office sign-in and a record of who changed what.' },
    ],
    gallery: [
      { src: '/assets/products/amanah-ai-1.jpg', alt: 'Amanah AI analytics: donation totals, Gift Aid claimed and claimable, and income by fund type, with sample data' },
      { src: '/assets/products/amanah-ai-2.jpg', alt: 'Donation box on a phone with General, Sadaqah and Zakat options, with sample data' },
      { src: '/assets/products/amanah-ai-3.jpg', alt: 'Gift Aid export screen choosing a date range and claim options, with sample data' },
    ],
    audience: ['UK Islamic charities', 'Relief and development charities', 'Zakat and Sadaqah appeals'],
    faqs: [
      { question: 'Can we keep our current website?', answer: 'No. Amanah AI replaces your donor website, on your own domain: appeals, news, events and pages as well as the checkout. Redirects send your old web addresses to the new pages.' },
      { question: 'Does it submit our Gift Aid claim to HMRC?', answer: 'No. It records Gift Aid on every donation and builds claim files. Your team checks them, submits the claim through HMRC Charities Online and records what HMRC pays.' },
      { question: 'Can we bring our donors and their giving history?', answer: 'Yes, by spreadsheet import, with a preview before it runs and an undo afterwards. Whether your Direct Debit mandates can move depends on who holds them today, and you’ll know before you sign.' },
      { question: 'Is there AI in Amanah AI?', answer: 'Not yet. The name is where the product is going. No AI features are live today, and no AI touches your donor data.' },
      { question: 'How much does it cost?', answer: 'A one-off setup fee and a monthly fee, quoted in writing for your charity. Donations go straight into your own Stripe and GoCardless accounts. Choose “Get pricing” in the form and we’ll send you a quote.' },
    ],
  },
  {
    slug: 'whatsapp-ai',
    name: 'WhatsApp AI Assistant',
    headline: 'An AI assistant that answers your customers on WhatsApp, day and night',
    category: 'AI & messaging',
    tagline: 'Reply on WhatsApp in seconds, around the clock.',
    intro: 'An AI assistant on your WhatsApp Business number that answers common questions, takes bookings and order enquiries, and hands over to your team when a person is needed.',
    icon: 'whatsapp',
    accent: '#9fe6b8',
    cover: { src: '/assets/products/whatsapp-ai.jpg', alt: 'AI assistant chatting with a customer on a phone' },
    highlights: ['Answers instantly, 24/7', 'Trained on your own services and FAQs', 'Hands over to your team when needed'],
    features: [
      { icon: 'chat', title: 'Instant answers', text: 'Replies to common questions about prices, opening hours, services and delivery straight away.' },
      { icon: 'calendar', title: 'Bookings and enquiries', text: 'Collects the details you need for an appointment, order or quote and passes them to your team.' },
      { icon: 'sparkle', title: 'Trained on your business', text: 'Learns from your website, menus, price lists and FAQs, so answers match how you work.' },
      { icon: 'handover', title: 'Human handover', text: 'Passes the conversation to a team member when a customer asks or the question needs a person.' },
      { icon: 'language', title: 'Speaks your customers’ language', text: 'Understands and replies in the languages your customers use.' },
      { icon: 'chart', title: 'Conversation insights', text: 'See what customers ask most, so you can improve your services and answers.' },
    ],
    gallery: [
      { src: '/assets/products/whatsapp-ai-1.jpg', alt: 'AI assistant answering a customer on a phone, with an inbox on a laptop behind' },
      { src: '/assets/products/whatsapp-ai-2.jpg', alt: 'AI assistant confirming an appointment booking on a phone' },
      { src: '/assets/products/whatsapp-ai-3.jpg', alt: 'Conversation analytics dashboard on a monitor' },
    ],
    audience: ['Clinics and salons', 'Restaurants', 'Online shops', 'Service businesses'],
    faqs: [
      { question: 'Does it use my existing WhatsApp number?', answer: 'It runs on a WhatsApp Business number. We’ll advise on using your current number or a new one during setup.' },
      { question: 'What if the AI doesn’t know the answer?', answer: 'It says so politely and hands the conversation to your team, rather than guessing.' },
      { question: 'Can I change what it knows?', answer: 'Yes. Send us updated information or edit it with us, and the assistant’s answers change to match.' },
      { question: 'How much does it cost?', answer: 'It depends on how many conversations you expect and what the assistant should handle. Choose “Get pricing” and we’ll send you a quote.' },
    ],
  },
  {
    slug: 'chatbot-integration',
    name: 'AI Chatbot Integration',
    headline: 'A smart chat assistant for your website that answers and converts',
    category: 'AI & websites',
    tagline: 'Turn website visitors into conversations.',
    intro: 'An AI chatbot added to your website, trained on your content, that answers visitors’ questions, recommends the right service or product, and collects leads for your team.',
    icon: 'bot',
    accent: '#86b4ff',
    cover: { src: '/assets/products/chatbot-integration.jpg', alt: 'Website with an AI chat widget open on a laptop' },
    highlights: ['Added to your existing website', 'Answers from your own content', 'Captures leads while you sleep'],
    features: [
      { icon: 'web', title: 'Works with your site', text: 'Added to your existing website with a chat window styled to match your brand.' },
      { icon: 'sparkle', title: 'Trained on your content', text: 'Answers from your pages, documents and FAQs, so visitors get accurate, on-brand replies.' },
      { icon: 'shop', title: 'Recommends what fits', text: 'Points visitors to the right service, product or page based on what they ask.' },
      { icon: 'mail', title: 'Lead capture', text: 'Collects names, emails and requirements, and sends them straight to your inbox.' },
      { icon: 'handover', title: 'Hand over to a person', text: 'Offers to connect visitors with your team for anything the assistant can’t handle.' },
      { icon: 'chart', title: 'Learn from questions', text: 'See the questions visitors ask most and improve your site and answers over time.' },
    ],
    gallery: [
      { src: '/assets/products/chatbot-integration-1.jpg', alt: 'Online shop on a laptop with an AI chat widget recommending products' },
      { src: '/assets/products/chatbot-integration-2.jpg', alt: 'AI chat assistant answering questions on a phone' },
      { src: '/assets/products/chatbot-integration-3.jpg', alt: 'Chatbot training screen with documents and a test chat' },
    ],
    audience: ['Service businesses', 'Online shops', 'Agencies', 'Education'],
    service: 'web-app-development',
    faqs: [
      { question: 'Will it work with my website?', answer: 'In most cases, yes: it’s added with a small snippet that works on WordPress, Shopify, custom sites and more.' },
      { question: 'Where do its answers come from?', answer: 'From the content you approve: your website pages, documents and FAQs. You can update this at any time.' },
      { question: 'Can it book calls or collect leads?', answer: 'Yes. It can collect contact details and requirements, and send them to your inbox or system.' },
      { question: 'How much does it cost?', answer: 'It depends on your site and how much the chatbot should handle. Choose “Get pricing” and we’ll send you a quote.' },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find(product => product.slug === slug);
}

/** Products that belong to a service (listed on that service page). */
export const productsForService = (serviceSlug: string) => products.filter(product => product.service === serviceSlug);

/** The product a case study's live site is built on, if any. */
export const productForCaseStudy = (projectSlug: string) => products.find(product => product.caseStudy?.slug === projectSlug);

/** The four steps from signup to launch, shown on every product page. */
export const onboardingSteps = [
  { icon: 'mail', title: 'Sign up', text: 'Tell us about your business with the form. It takes a minute.' },
  { icon: 'calendar', title: 'Demo and plan', text: 'We walk you through the product and agree the setup and price.' },
  { icon: 'build', title: 'Set up for you', text: 'We add your branding, content and data, and test everything with you.' },
  { icon: 'evolve', title: 'Go live', text: 'Launch with training for your team, and support whenever you need it.' },
];
