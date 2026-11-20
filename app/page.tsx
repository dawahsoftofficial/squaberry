import type { Metadata } from 'next';
import Link from 'next/link';
import ProcessTabs from '@/components/ProcessTabs';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { services } from '@/lib/services';

export const metadata: Metadata = {
  title: { absolute: 'Squaberry — Fresh ideas. Solid tech. | squaberry.co.uk' },
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Squaberry — Fresh ideas. Solid tech.',
    description: 'Thoughtful design and connected technology for what comes next.',
    url: '/',
  },
};

const tickerItems = ['DESIGN WITH CHARACTER', 'CODE WITH PURPOSE', 'CLOUD WITH CONFIDENCE', 'LESS BUSYWORK. MORE POSSIBILITY.'];

function TickerGroup() {
  return (
    <div className="ticker-group">
      {tickerItems.map(item => (
        <span key={item} style={{ display: 'contents' }}>
          <span>{item}</span>
          <b>✳</b>
        </span>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <div id="top"><SiteHeader home /></div>
      <main id="main">
        <div className="top">
          <section className="wrap hero" aria-labelledby="heroTitle">
            <div className="hero-copy">
              <p className="mono eyebrow"><span className="dot" aria-hidden="true"></span> INDEPENDENT THINKING. CONNECTED TECHNOLOGY.</p>
              <h1 id="heroTitle"><span>Fresh ideas.</span><span className="accent">Solid tech.</span></h1>
              <p>From the first sketch to the systems behind it, we make technology feel clear, useful and full of possibility.</p>
              <div className="actions">
                <Link className="button" href="/contact">Tell us what you’re building <span className="arrow" aria-hidden="true">↗</span></Link>
                <a className="text-link" href="#services">Explore what we do <span className="arrow" aria-hidden="true">↓</span></a>
              </div>
              <p className="mono hero-note">DESIGN / DEVELOPMENT / CLOUD / AUTOMATION / IT</p>
            </div>
            <div className="hero-art" aria-label="The geometric Squaberry SB berry mark">
              <div className="art-grid" aria-hidden="true"></div>
              <div className="orbit" aria-hidden="true"></div>
              <span className="mono art-label tl">SQ—01 / THE SQUARE BERRY</span>
              <span className="mono art-label tr">[ SB ]</span>
              <div className="mark-frame"><img className="hero-mark" src="/assets/squaberry-mark.svg" alt="Fused S and B initials form a square berry with angled leaves" /></div>
              <span className="mono art-label bl">ROOTED IN LOGIC.</span>
              <span className="mono art-label br">GROWN WITH IMAGINATION.</span>
            </div>
          </section>
          <div className="wrap baseline mono"><span>INDEPENDENT THINKING. CONNECTED TECHNOLOGY.</span><a href="#services">TAKE A LOOK <b aria-hidden="true">↓</b></a></div>
        </div>

      <div className="ticker" aria-label="Design, development, cloud, automation and IT support">
        <div className="ticker-track" aria-hidden="true"><TickerGroup /><TickerGroup /></div>
      </div>

      <section className="wrap section services" id="services" aria-labelledby="servicesTitle">
        <div className="section-heading">
          <div><p className="mono">01 / WHAT WE DO</p><h2 id="servicesTitle">One partner.<br />Every piece.</h2></div>
          <p>Your website, your workflows, the systems behind the scenes. Let’s make the whole thing work better, together.</p>
        </div>
        <div className="service-list">
          {services.map((service, index) => (
            <details className="service" open={index === 0} key={service.slug}>
              <summary>
                <span className="mono service-num">{service.number}</span>
                <h3>{service.name}</h3>
                <span className="expand" aria-hidden="true">+</span>
              </summary>
              <div className="service-body">
                <p>{service.summary}</p>
                <div className="mono tags">{service.tags.join(' / ').toUpperCase()}</div>
                <div className="service-links">
                  <Link href={`/services/${service.slug}`}>Explore {service.name.toLowerCase()} <span aria-hidden="true">↗</span></Link>
                  <Link href={`/services/${service.slug}#enquiry`}>Let’s talk {service.shortName} <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="manifesto" id="about">
        <div className="wrap manifesto-inner">
          <div className="manifesto-art" aria-hidden="true">
            <span className="mono coordinate top">SQUARE + BERRY = SQUABERRY</span>
            <img className="hero-mark" src="/assets/squaberry-mark.svg" alt="" />
            <span className="mono coordinate bottom">STRUCTURE / CHARACTER / POSSIBILITY</span>
          </div>
          <div className="manifesto-copy">
            <p className="mono">02 / OUR DNA</p>
            <h2>Square roots.<br /><span className="acid">Fresh thinking.</span></h2>
            <p>Square gives us structure. Berry gives us character. Together, they’re a reminder that good technology takes clear thinking and a bit of imagination.</p>
            <p>That’s the way we work: thoughtful design, careful engineering and a human touch from the first conversation.</p>
            <div className="principles">
              <div><span aria-hidden="true">↳</span>Make the complicated feel simple.</div>
              <div><span aria-hidden="true">↳</span>Care about the small things.</div>
              <div><span aria-hidden="true">↳</span>Build for what comes next.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap process" id="process" aria-labelledby="processTitle">
        <div className="process-intro">
          <div><p className="mono">03 / HOW WE WORK</p><h2 id="processTitle">From “what if”<br />to “it works.”</h2></div>
          <p>A clear path, shared decisions and a team that stays connected to the detail.</p>
        </div>
        <ProcessTabs />
      </section>

      <section className="contact" id="contact">
        <div className="wrap">
          <div className="contact-top">
            <p className="mono eyebrow"><span className="dot" aria-hidden="true"></span> YOUR NEXT GOOD IDEA STARTS HERE.</p>
            <p>A project, a question, a tricky challenge.<br />We’re all ears.</p>
          </div>
          <div className="contact-main">
            <h2>Let’s make<br />IT happen.</h2>
            <Link className="button" href="/contact" aria-label="Contact Squaberry"><span aria-hidden="true">↗</span></Link>
          </div>
          <div className="contact-bottom">
            <a className="contact-email" href="mailto:hello@squaberry.co.uk">hello@squaberry.co.uk <span className="arrow" aria-hidden="true">↗</span></a>
            <p>You don’t need a perfect brief.<br />A little curiosity is a great start.</p>
          </div>
        </div>
      </section>
      </main>

      <SiteFooter home />
    </>
  );
}
