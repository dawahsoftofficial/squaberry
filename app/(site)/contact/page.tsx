import type { Metadata } from 'next';
import Link from 'next/link';
import EnquiryForm from '@/components/EnquiryForm';
import Icon from '@/components/Icon';

export const metadata: Metadata = {
  title: { absolute: 'Contact — Squaberry' },
  description: 'Talk to Squaberry about your next design, development, marketing or technology project.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <main id="main">
      <section className="container page-hero" aria-labelledby="pageTitle">
        <span className="pill rise">Contact</span>
        <h1 id="pageTitle" className="display-xl rise d1">Let’s make something work.</h1>
        <p className="lead rise d2">Tell us what you’re thinking about: a project, an opportunity, or a question you haven’t quite worked out yet. A perfect brief is not required.</p>
      </section>

      <section className="container section-tight" id="enquiry" aria-labelledby="formTitle">
        <div className="form-layout">
          <div className="form-intro">
            <span className="pill">Send a message</span>
            <h2 id="formTitle" className="display-m">Three quick steps.</h2>
            <p className="lead">Pick a topic, add a few lines, and tell us where to reply.</p>
            <div className="info-cards">
              <div className="info-card">
                <span className="info-icon"><Icon name="mail" size={22} /></span>
                <p><strong>Prefer email?</strong><span><a href="mailto:hello@squaberry.co.uk?subject=Hello%20Squaberry">hello@squaberry.co.uk</a></span></p>
              </div>
              <div className="info-card">
                <span className="info-icon"><Icon name="chat" size={22} /></span>
                <p><strong>What to include</strong><span>Your goals, questions or a rough idea</span></p>
              </div>
              <div className="info-card">
                <span className="info-icon"><Icon name="check" size={22} /></span>
                <p><strong>What happens next</strong><span>We read every message and reply by email</span></p>
              </div>
            </div>
            <p className="muted" style={{ fontSize: 15 }}>Messages are stored securely for our team and used only to reply to you. See our <Link className="text-link" href="/privacy">privacy policy</Link>.</p>
          </div>
          <EnquiryForm source="Contact page" />
        </div>
      </section>
    </main>
  );
}
