// Adds Squaberry's showcase projects to the portfolio (matched by site address, so re-running
// updates them instead of duplicating), and removes the old placeholder "sample" projects.
// Also fills each project's case-study page (/work/[slug]).
//
//   npm run db:portfolio      (run `npm run db:migrate` first so the case-study columns exist)
//
// Copy is written from what each live site shows. It makes no claims about traffic, sales or
// donations: add real outcomes and client quotes in the admin once the client has agreed them.
import { readFileSync } from 'node:fs';
import mysql from 'mysql2/promise';

const gallery = (slug, name) =>
  [
    `/assets/work/${slug}-1.jpg | ${name} homepage on desktop and phone`,
    `/assets/work/${slug}-2.jpg | ${name} on a phone`,
    `/assets/work/${slug}-3.jpg | Another section of the ${name} website on desktop`,
  ].join('\n');

const projects = [
  {
    slug: 'muntada-aid',
    service: 'web-app-development',
    title: 'Muntada Aid',
    sector: 'Charity',
    headline: 'A giving platform that turns urgent appeals into donations',
    url: 'https://muntadaaid.org/',
    intro: 'A new website for a UK humanitarian charity, built so supporters can find an appeal, understand it and give in a few calm steps.',
    scope: 'Web design\nWeb development\nDonation journey\nGift Aid\nContent management',
    overview: `Muntada Aid is a UK registered charity supporting communities in crisis with emergency relief, food, clean water, healthcare, education and livelihood programmes.

The charity runs many appeals at once, and new emergencies can appear overnight. The website has to keep up: one place for every appeal, the charity’s events and its news, all managed by the team without a developer on call.`,
    challenge: `Donors arrive with different intentions. Some come for a specific emergency, some want to give where the need is greatest, and some are regular supporters returning to an appeal they already know. Each of them needs to reach a donation form quickly, without wading through pages.

The site also has to earn trust at a glance: who the charity is, that payments are secure, and that Gift Aid adds 25% to eligible gifts. And it has to work just as well on a phone, where most giving now happens.`,
    solution: `We designed the homepage around the appeal that matters most right now, with a clear choice between learning more and donating straight away. Featured appeals and themed categories (emergencies, food, water and sanitation, health, livelihoods, education and community centres) make the rest easy to browse.

Donations go into a basket, so a supporter can give to several appeals in one checkout, and Gift Aid is explained right where the decision is made. Trust signals sit beside the call to action: regulated payments, Gift Aid and the charity’s registration.

Behind it, the team manages appeals, events and news themselves, and an impact section shows supporters where their generosity went.`,
    results: `Muntada Aid now has a website that keeps pace with its work: new appeals go live as soon as they are needed, and every page leads naturally to giving.

Supporters can give to more than one cause in a single visit, on any device, with the reassurance they expect from a UK charity.`,
  },
  {
    slug: 'chips-n-chops',
    service: 'web-app-development',
    title: 'Chips n Chops',
    sector: 'Food delivery',
    headline: 'Ordering made as quick as the food it delivers',
    url: 'https://chipsnchops.com/',
    intro: 'Online ordering for a fast-food brand in Islamabad: loaded fries, burgers and wraps, from menu to doorstep in a few taps.',
    scope: 'Web app development\nOnline ordering\nMenu and deals\nBrand UI\nMobile-first design',
    overview: `Chips n Chops serves loaded fries, zinger burgers, wraps and deals, delivered hot across Islamabad, including G-13 and G-14.

Food delivery is won or lost in seconds. The brand needed its own ordering experience that felt as bold as its food and was faster than calling or messaging.`,
    challenge: `A fast-food menu changes often: new deals, combos for one or for two, and build-your-own options with many choices. All of that has to stay simple to browse on a phone, often with one hand and an empty stomach.

Customers also need to know straight away whether the kitchen delivers to them, how long it will take and how they can pay.`,
    solution: `We built a dark, appetite-first interface where the food photography does the selling. A sticky category bar jumps straight to solo deals, deals for two, family deals, burgers, wraps and sides, and the most-ordered items sit right at the top.

“Build your loaded fries” walks customers through their box step by step. Delivery areas, a 25 to 35 minute promise and cash on delivery are stated up front, with accounts, a basket and WhatsApp support one tap away.`,
    results: `Chips n Chops now takes orders through a site that matches its brand and moves at the speed of its kitchen.

The menu team can update deals and items as often as they like, and customers can go from craving to checkout in a few taps.`,
  },
  {
    slug: 'pure-half',
    service: 'design-digital-experiences',
    title: 'Pure Half',
    sector: 'Marriage app',
    headline: 'A private, respectful way to find your other half',
    url: 'https://purehalf.com/',
    intro: 'Product design and website for a Muslim marriage app built around privacy, reviewed profiles and families who want to be involved.',
    scope: 'Product design\nUI and UX design\nWebsite\nMultilingual content\nApp store presence',
    overview: `Pure Half is a private Muslim marriage app for people ready for nikah. It is free to join, every new profile is checked by a person, and women’s photos stay blurred until they agree to share them.

The app needed a website and an interface that explain those promises clearly to people who are wary of mainstream dating apps.`,
    challenge: `Trust is everything in this space. Many people have tried rishta apps and found fake profiles, pressure to pay or a tone that feels like dating rather than marriage.

Pure Half also serves a wide audience across many countries and languages, including families who want to take part in the process at their own pace.`,
    solution: `We led with what makes Pure Half different: profiles checked by people, photo privacy that the user controls, and no billing traps. Each promise is backed by a short, concrete explanation rather than marketing language.

The website is available in many languages, including Urdu, Roman Urdu and Arabic, with right-to-left layouts where needed. A two-minute quiz and links to Google Play and the App Store make the next step obvious, and the design stays warm, calm and modest throughout.`,
    results: `Pure Half launched with a clear, respectful identity that sets it apart from dating apps.

Visitors understand the app’s privacy and review promises before they sign up, in their own language.`,
  },
  {
    slug: 'fit-track-gym',
    service: 'web-app-development',
    title: 'Fit Track Gym',
    sector: 'Fitness',
    headline: 'A bold home for a women-only gym in Rawalpindi',
    url: 'https://fittrackgym.com/',
    intro: 'A bilingual website for a female-friendly gym in Rawalpindi, showing its programmes, equipment and all-female team.',
    scope: 'Web design\nWeb development\nEnglish and Urdu\nContent structure',
    overview: `Fit Track Gym is a safe, female-friendly gym in Rawalpindi with tailored fitness programmes, modern equipment and a dedicated female team.

The gym needed a website that would reassure women considering it for the first time, and their families, before they ever walked through the door.`,
    challenge: `For many women, the deciding questions are about the environment, not just the machines: who works there, what the space looks like and whether the programmes fit their life stage.

Visitors also needed to see pricing, read about the team and get in touch easily, in English or Urdu.`,
    solution: `We designed a confident, high-contrast site that puts the gym’s values first. Programmes such as weight management, pre-wedding fitness and post-natal health each get their own clear introduction.

The equipment, amenities and the female team are shown in real photographs, followed by pricing, testimonials and answers to common questions. A language switch offers the whole site in English and Urdu, and contact details stay within reach on every page.`,
    results: `Fit Track Gym now has a website that answers a new member’s questions before they ask them.

Women and their families can see the space, the team and the programmes in their preferred language, then get started in a couple of taps.`,
  },
  {
    slug: 'think-bambu',
    service: 'design-digital-experiences',
    title: 'Think Bambu',
    sector: 'Agency',
    headline: 'A playful, confident site for a growth marketing agency',
    url: 'https://www.think-bambu.com/',
    intro: 'A bold, characterful website for a Scottish growth marketing and design agency that wanted to stand out from a crowded field.',
    scope: 'Web design\nWeb development\nCMS\nCase study templates',
    overview: `Think Bambu is a growth marketing and design agency based in Scotland, helping ambitious brands grow their visibility, convert more leads and build sustainable revenue.

Agencies are judged on their own website first. Think Bambu wanted one with as much personality as the team behind it.`,
    challenge: `Most agency sites look alike. Think Bambu needed to feel distinctive while still making a serious case: what the agency does, how it thinks and the results it has delivered.

The site also had to be easy for the team to keep fresh, with new case studies and articles added without a developer.`,
    solution: `We built around the brand’s playful identity: an oversized “What’s your more?” headline, a bold plum and mint palette, hand-drawn textures and the Bambu panda.

Underneath the personality the structure is clear: services, case studies with headline results, the agency’s own growth framework and client testimonials. Case studies and articles use reusable templates, so the team can publish on their own.`,
    results: `Think Bambu’s website now sounds and looks like the agency itself, which is exactly what prospective clients are buying.

The team adds new work and thinking on their own, keeping the site current.`,
  },
  {
    slug: 'discover-islam',
    service: 'web-app-development',
    title: 'Discover Islam',
    sector: 'Education',
    headline: 'Outreach, exhibitions and learning in one welcoming place',
    url: 'https://discoverislam.co.uk/',
    intro: 'A website for a UK educational charity that brings exhibitions, school visits and free literature to people who want to learn about Islam.',
    scope: 'Web design\nWeb development\nBooking and request forms\nDonations',
    overview: `Discover Islam is a UK registered charity offering exhibitions, school and mosque visits, workshops and free literature, helping people understand Islam through knowledge and connection.

It works with schools, community groups and members of the public, and each of them comes to the site looking for something different.`,
    challenge: `Teachers need to know that a visit is suitable for the classroom. Event organisers want to host an exhibition. Others simply want to read and learn. The site had to serve all of them without becoming a maze.

It also needed to build confidence with schools in particular, and give supporters a simple way to volunteer or donate.`,
    solution: `We organised the site around three clear routes: host an exhibition, book a school or mosque visit, and request free literature, each with its own simple request form.

A dedicated section explains why schools trust Discover Islam, from alignment with the RE curriculum to scholar-reviewed materials that teachers can review before a visit. Volunteering and donations sit together under “Get involved”.`,
    results: `Discover Islam now has a welcoming front door that sends each visitor down the right path.

Schools, organisers and the public can request what they need in a few steps, and the team receives clear, complete requests.`,
  },
  {
    slug: 'audio-brochure',
    service: 'design-digital-experiences',
    title: 'Audio Brochure',
    sector: 'Audio platform',
    headline: 'Short narrated introductions, designed for listening',
    url: 'https://audio-brochure.com/',
    intro: 'A listening-first platform of short, narrated introductions to Islam, designed so people can press play wherever they are.',
    scope: 'Brand and UI design\nWeb development\nAudio player\nContent library',
    overview: `Audio Brochure, a Discover Islam initiative, turns the printed brochure into something you can listen to: short, beautifully narrated introductions to life’s bigger questions, made for curious minds and quiet moments.

The idea needed a home that felt as considered as the recordings themselves.`,
    challenge: `Audio is easy to skip on the web. The site had to make listening feel inviting rather than like a chore, and help people choose a topic that speaks to them without overwhelming them.

It also needed to feel calm and editorial, and work beautifully on phones, where most listening happens.`,
    solution: `We designed a warm, editorial interface with generous type, deep greens and soft coral accents. A library of brochures can be filtered by theme, and each one shows its length up front.

The journey is three simple steps: choose a question, press play, then reflect and share. A built-in player keeps the focus on listening.`,
    results: `Audio Brochure launched as a calm, inviting library that makes it easy to press play.

New recordings can be added to the collection as they are produced, and each one is easy to share.`,
  },
  {
    slug: 'new-muslim-stories',
    service: 'web-app-development',
    title: 'New Muslim Stories',
    sector: 'Searchable archive',
    headline: '2,700+ stories, searchable by country and background',
    url: 'https://newmuslimstories.com/',
    intro: 'A searchable archive of thousands of personal stories from people who embraced Islam, with careful credit to every original source.',
    scope: 'Web app development\nSearch and filters\nContent structure\nSEO',
    overview: `New Muslim Stories is the world’s largest collection of new Muslim stories: more than 2,700 accounts from over 110 countries, from people who embraced Islam, each credited to its original source.

The collection draws on videos, articles and interviews, so it needed a structure that could hold very different kinds of content.`,
    challenge: `A collection this size is only useful if people can find the stories that matter to them, whether that is someone from their own country, a similar faith background or the same profession.

Every story also had to credit its original creator clearly and respectfully.`,
    solution: `We built a fast, focused search with filters for country, gender, age, year, previous religion, profession and education, plus a quick “browse by” view of the largest countries and faith backgrounds.

Each story has a clean page with a clear credit and a link to the original source, and new additions appear on the homepage as soon as they are published. The structure is designed for search engines as well as people.`,
    results: `New Muslim Stories turns thousands of scattered accounts into one archive that anyone can search in seconds.

The collection keeps growing, and every addition can be found by country, background and more.`,
  },
  {
    slug: 'lareeza',
    service: 'web-app-development',
    title: 'Lareeza',
    sector: 'E-commerce',
    headline: 'A calm online shop for herbal massage oils',
    url: 'https://lareeza.com/',
    intro: 'A focused online shop for a range of herbal massage oils, with cash on delivery across Islamabad and Rawalpindi.',
    scope: 'E-commerce\nProduct pages\nCash on delivery checkout\nCopywriting',
    overview: `Lareeza makes herbal massage oils for active men, blended in Pakistan: Sensei’s Touch for warmth, Sensei’s Essence to wind down and Sensei’s Oud.

The brand sells directly to customers and needed a shop that explains the products simply and makes ordering effortless.`,
    challenge: `Massage oils are a considered purchase. Customers want to know what is inside, how to use it and whether it works before they order.

Most customers prefer to pay in cash on delivery, so the checkout had to be short and the delivery promise crystal clear.`,
    solution: `We designed a calm, natural shop that introduces each oil by when and why you would use it, with clear packs and savings for bundles.

Ingredients, a three-step guide to using the oils, quality and sourcing notes, reviews and answers to common questions sit on one well-ordered page. Free delivery and cash on delivery are stated at every step, and a sticky order bar keeps buying one tap away.`,
    results: `Lareeza has a shop that answers questions before customers ask them and makes ordering simple.

New packs and products can be added as the range grows.`,
  },
  {
    slug: 'katori',
    service: 'web-app-development',
    title: 'Katori',
    sector: 'Product launch',
    headline: 'A focused product page for a titanium cutting board',
    url: 'https://buykatori.com/',
    intro: 'A single-product launch page that explains why a titanium cutting board is worth switching to, then makes the offer easy to take up.',
    scope: 'Landing page\nCopy and structure\nComparison content\nWeb development',
    overview: `Katori is a titanium cutting board with two usable sides and a non-porous surface that rinses clean with soap and water.

It is a new kind of product, so the page has to explain the idea before it can sell it.`,
    challenge: `Most people have never considered what their cutting board is made of. The page needed to explain the everyday problems with wood, plastic and glass without lecturing, and make the case for titanium honestly.

Buyers also need the practical details up front: sizes, delivery, returns and how to look after it.`,
    solution: `We structured the page as a clear story: the problem with everyday boards, why titanium, the benefits, a side-by-side comparison of materials and three simple steps for daily use.

Specifications, the seller’s 30-day returns, delivery options and answers to common questions follow, with a package chooser and the current offer always within reach.`,
    results: `Katori launched with a page that turns curiosity into confidence, answering a buyer’s questions in the order they arise.

The page is easy to update as offers and packages change.`,
  },
];

const caPath = process.env.DB_CA_CERT_PATH;
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: caPath ? { ca: readFileSync(caPath, 'utf8') } : { rejectUnauthorized: false },
  connectTimeout: 15000,
});

const [removed] = await connection.execute("DELETE FROM portfolio_items WHERE image_url LIKE '/assets/portfolio/samples/%'");

const columns = [
  'service_slug', 'title', 'client', 'summary', 'image_url', 'sort_order',
  'slug', 'intro', 'scope', 'overview', 'challenge', 'solution', 'results', 'gallery',
];

let added = 0;
let updated = 0;
for (const [index, project] of projects.entries()) {
  const values = [
    project.service, project.title, project.sector, project.headline, `/assets/portfolio/${project.slug}.png`, index + 1,
    project.slug, project.intro, project.scope, project.overview, project.challenge, project.solution, project.results,
    gallery(project.slug, project.title),
  ];
  const [existing] = await connection.execute('SELECT id FROM portfolio_items WHERE site_url = ?', [project.url]);
  if (existing.length) {
    await connection.execute(`UPDATE portfolio_items SET ${columns.map(column => `${column} = ?`).join(', ')} WHERE id = ?`, [...values, existing[0].id]);
    updated += 1;
  } else {
    await connection.execute(
      `INSERT INTO portfolio_items (${columns.join(', ')}, site_url, published) VALUES (${columns.map(() => '?').join(', ')}, ?, 1)`,
      [...values, project.url],
    );
    added += 1;
  }
}
console.log(`Removed ${removed.affectedRows} sample projects. Added ${added}, updated ${updated} showcase projects.`);
await connection.end();
