import type { Metadata } from 'next';
import Link from 'next/link';
import ProcessTabs from '@/components/ProcessTabs';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { services } from '@/lib/services';

export const metadata: Metadata = {
  title: 'About us',
  description: 'Squaberry brings structure and character to technology: thoughtful design, careful engineering and a human touch, from the first conversation.',
  alternates: { canonical: '/about' },
};

const beliefs = [
  { title: 'Make the complicated feel simple.', text: 'Technology should make work easier, not add another layer to manage. We explain things plainly and design for the people who use them every day.' },
  { title: 'Care about the small things.', text: 'The details are where good work shows: a page that loads fast, a form that makes sense, a system that quietly does its job.' },
  { title: 'Build for what comes next.', text: 'We make choices that leave room to grow, so today’s project becomes a solid foundation for tomorrow’s ideas.' },
];

const promises = [
  { label: 'PLAIN LANGUAGE', text: 'No jargon for the sake of it. You’ll always know what we’re doing and why.' },
  { label: 'ONE PARTNER', text: 'Design, development, cloud, automation and IT under one roof, joined up.' },
  { label: 'SHARED DECISIONS', text: 'A clear path, agreed together, with progress you can see along the way.' },
  { label: 'IN IT FOR THE LONG RUN', text: 'Launch is a beginning. We stay on hand to support and improve what we build.' },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader current="about" />
      <main id="main">
        <div className="top">
          <section className="wrap about-hero" aria-labelledby="aboutTitle">
            <div className="about-hero-copy">
              <p className="mono eyebrow"><span className="dot" aria-hidden="true"></span> ABOUT SQUABERRY</p>
              <h1 id="aboutTitle"><span>A little square.</span><span>A lot of possibility.</span></h1>
              <p>We’re a technology partner for businesses that want things to work better. From the first sketch to the systems behind it, we bring design, development, cloud, automation and IT together, with clear thinking and a human touch.</p>
              <div className="actions">
                <Link className="button" href="/contact">Start a conversation <span className="arrow" aria-hidden="true">↗</span></Link>
                <a className="text-link" href="#story">Our story <span className="arrow" aria-hidden="true">↓</span></a>
              </div>
            </div>
            <div className="manifesto-art about-art" aria-hidden="true">
              <span className="mono coordinate top">SQUARE + BERRY = SQUABERRY</span>
              <img className="hero-mark" src="/assets/squaberry-mark.svg" alt="" />
              <span className="mono coordinate bottom">STRUCTURE / CHARACTER / POSSIBILITY</span>
            </div>
          </section>
        </div>

        <section className="wrap section about-story" id="story" aria-labelledby="storyTitle">
          <div className="about-story-head">
            <p className="mono">01 / OUR STORY</p>
            <h2 id="storyTitle">Square roots.<br /><span className="acid">Fresh thinking.</span></h2>
          </div>
          <div className="about-story-body">
            <p className="about-lead">Square gives us structure. Berry gives us character. Together, they’re a reminder that good technology takes clear thinking and a bit of imagination.</p>
            <p>The square stands for the logic underneath everything we build: sound engineering, sensible security and systems that hold up. The berry is the part people actually feel: design with personality, experiences that are easy to use and ideas that make work a little more enjoyable.</p>
            <p>That’s the way we work: thoughtful design, careful engineering and a human touch from the first conversation. Whether it’s a new website, a move to the cloud or an automation that saves your team hours each week, we treat it as part of a bigger picture: your business, and where it’s heading.</p>
          </div>
        </section>

        <section className="fit-band about-beliefs" aria-labelledby="beliefsTitle">
          <div className="wrap">
            <p className="mono">02 / WHAT WE BELIEVE</p>
            <h2 id="beliefsTitle">Three things<br /><span className="acid-text">we live by.</span></h2>
            <ol className="belief-list">
              {beliefs.map((belief, index) => (
                <li key={belief.title}>
                  <span className="mono">0{index + 1}</span>
                  <h3>{belief.title}</h3>
                  <p>{belief.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="wrap section about-promises" aria-labelledby="promisesTitle">
          <div className="section-heading is-split">
            <div><p className="mono">03 / WORKING WITH US</p><h2 id="promisesTitle">What you can expect.</h2></div>
            <p>However big or small the project, this is how it feels to work with Squaberry.</p>
          </div>
          <ul className="deliverables promise-grid">
            {promises.map(promise => (
              <li className="deliverable" key={promise.label}>
                <span className="mono">{promise.label}</span>
                <p>{promise.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="wrap process about-process" aria-labelledby="processTitle">
          <div className="process-intro">
            <div><p className="mono">04 / HOW WE WORK</p><h2 id="processTitle">From “what if”<br />to “it works.”</h2></div>
            <p>A clear path, shared decisions and a team that stays connected to the detail.</p>
          </div>
          <ProcessTabs />
        </section>

        <nav className="wrap section other-services about-services" aria-labelledby="servicesTitle">
          <p className="mono">05 / WHAT WE DO</p>
          <h2 id="servicesTitle">One partner. Every piece.</h2>
          <ul>
            {services.map(service => (
              <li key={service.slug}>
                <Link href={`/services/${service.slug}`}>
                  <span className="mono service-num">{service.number}</span>
                  <span className="other-name">{service.name}</span>
                  <span className="arrow" aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section className="contact" aria-labelledby="aboutContactTitle">
          <div className="wrap">
            <div className="contact-top">
              <p className="mono eyebrow"><span className="dot" aria-hidden="true"></span> YOUR NEXT GOOD IDEA STARTS HERE.</p>
              <p>A project, a question, a tricky challenge.<br />We’re all ears.</p>
            </div>
            <div className="contact-main">
              <h2 id="aboutContactTitle">Let’s make<br />IT happen.</h2>
              <Link className="button" href="/contact" aria-label="Contact Squaberry"><span aria-hidden="true">↗</span></Link>
            </div>
            <div className="contact-bottom">
              <a className="contact-email" href="mailto:hello@squaberry.co.uk">hello@squaberry.co.uk <span className="arrow" aria-hidden="true">↗</span></a>
              <p>You don’t need a perfect brief.<br />A little curiosity is a great start.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
