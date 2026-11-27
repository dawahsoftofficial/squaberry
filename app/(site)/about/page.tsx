import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import Icon from '@/components/Icon';
import ProcessSteps from '@/components/ProcessSteps';
import PageHero from '@/components/PageHero';
import JsonLd from '@/components/JsonLd';
import { breadcrumbSchema } from '@/lib/schema';
import SectionIntro from '@/components/SectionIntro';
import TeamGrid from '@/components/TeamGrid';
import { services, serviceStyle } from '@/lib/services';
import { teamGroups } from '@/lib/team';

export const metadata: Metadata = pageMetadata({
  title: 'About us: a digital studio for web, apps and IT',
  description: 'Meet Squaberry: a digital studio that brings structure and character to technology, with thoughtful design, careful engineering and a human touch.',
  path: '/about',
  og: 'about',
});

const beliefs = [
  { title: 'Make the complicated feel simple.', text: 'Technology should make work easier, not add another layer to manage. We explain things plainly and design for the people who use them every day.' },
  { title: 'Care about the small things.', text: 'The details are where good work shows: a page that loads fast, a form that makes sense, a system that quietly does its job.' },
  { title: 'Build for what comes next.', text: 'We make choices that leave room to grow, so today’s project becomes a solid foundation for tomorrow’s ideas.' },
];

const promises = [
  { label: 'Plain language', icon: 'chat', accent: '#b3a8ff', text: 'No jargon for the sake of it. You’ll always know what we’re doing and why.' },
  { label: 'One partner', icon: 'web', accent: '#8fd3e8', text: 'Design, development, marketing and IT support under one roof, joined up.' },
  { label: 'Shared decisions', icon: 'strategy', accent: '#ff9ed2', text: 'A clear path, agreed together, with progress you can see along the way.' },
  { label: 'In it for the long run', icon: 'evolve', accent: '#ffb38a', text: 'Launch is a beginning. We stay on hand to support and improve what we build.' },
];

// The journey, told simply (no meaning read into the logo).
const journey = [
  { when: '15 years ago', title: 'It started with a few clients', text: 'A small team with a simple aim: make technology feel clear and useful for the people who rely on it.' },
  { when: 'The hard years', title: 'Trying, failing, learning', text: 'Not every idea worked. Each setback taught us something, and every project made the next one better.' },
  { when: 'Finding our feet', title: 'Doing what we do best', text: 'We brought design, development, digital marketing and IT support under one roof, so clients have one team to talk to.' },
  { when: 'Today', title: '500+ projects around the globe', text: 'More than 500 projects delivered for organisations around the world, and still curious about the next one.', now: true },
];

export default function AboutPage() {
  return (
    <main id="main">
      <JsonLd data={breadcrumbSchema([{ name: 'About us', path: '/about' }])} />
      <PageHero
        label="About Squaberry"
        title={<>A little square.<br />A lot of possibility.</>}
        lead="We’re a technology partner for organisations that want things to work better. From the first sketch to the systems behind it, we bring design, development, digital marketing and IT support together."
        actions={(
          <>
            <Link className="btn is-lg" href="/contact#enquiry"><span>Start a conversation</span><span className="btn-icon"><Icon name="arrow-up-right" size={20} /></span></Link>
            <Link className="text-link" href="/work">See our work</Link>
          </>
        )}
      />

      <section className="container section story" aria-labelledby="storyTitle">
        <div className="story-main">
          <SectionIntro label="Our story" title="Fifteen years in the making." id="storyTitle" />
          <p className="story-statement text-reveal">We didn’t get it right first time. We tried, we failed, we learned, and we kept going.</p>
          <p className="story-text reveal">Whether it’s a new website, a campaign that brings in new customers or support that keeps your team running, we treat it as part of a bigger picture: your organisation, and where it’s heading.</p>
        </div>
        <ol className="story-timeline">
          {journey.map(step => (
            <li className={`story-step reveal${step.now ? ' is-now' : ''}`} key={step.title}>
              <span className="mono story-when">{step.when}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container section team" aria-labelledby="teamTitle">
        <SectionIntro label="Our team" title="The people behind the work." id="teamTitle">
          <p>A small, close-knit team: the people you talk to are the people who plan, design and build your project.</p>
        </SectionIntro>
        {teamGroups.map(group => <TeamGrid key={group.id} group={group} />)}
      </section>

      <section className="panel panel-cream section" aria-labelledby="beliefsTitle">
        <div className="container">
          <SectionIntro label="What we believe" title="Three things we live by." id="beliefsTitle" tone="light" />
          <ol className="pastel-grid">
            {beliefs.map((belief, index) => (
              <li className="pastel-card reveal" key={belief.title}>
                <span className="num">0{index + 1}</span>
                <h3>{belief.title}</h3>
                <p>{belief.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container section" aria-labelledby="promisesTitle">
        <SectionIntro label="Working with us" title="What you can expect." id="promisesTitle">
          <p>However big or small the project, this is how it feels to work with Squaberry.</p>
        </SectionIntro>
        <ul className="feature-grid cols-4">
          {promises.map(promise => (
            <li className="feature-card reveal" key={promise.label} style={{ ['--accent' as string]: promise.accent }}>
              <span className="feature-icon"><Icon name={promise.icon} size={40} /></span>
              <h3>{promise.label}</h3>
              <p>{promise.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel panel-lav section" aria-labelledby="processTitle">
        <div className="container">
          <SectionIntro label="How we work" title="From “what if” to “it works.”" id="processTitle" tone="light">
            <p>A clear path, shared decisions and a team that stays connected to the detail.</p>
          </SectionIntro>
          <ProcessSteps />
        </div>
      </section>

      <nav className="container section" aria-labelledby="servicesTitle">
        <SectionIntro label="What we do" title="One partner. Every piece." id="servicesTitle" />
        <ul className="link-list">
          {services.map(service => (
            <li key={service.slug}>
              <Link href={`/services/${service.slug}`} style={{ ['--accent' as string]: serviceStyle[service.slug].accent }}>
                <span className="link-icon"><Icon name={serviceStyle[service.slug].icon} size={32} /></span>
                <span className="link-name">{service.name}</span>
                <span className="link-go" aria-hidden="true"><Icon name="arrow-up-right" size={18} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="section-tight">
        <div className="panel panel-cream cta-panel reveal">
          <h2 className="display-l">Let’s make IT happen.</h2>
          <div className="cta-side">
            <p>You don’t need a perfect brief. A little curiosity is a great start.</p>
            <Link className="btn is-dark is-lg" href="/contact#enquiry"><span>Start a project</span><span className="btn-icon"><Icon name="arrow-up-right" size={20} /></span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
