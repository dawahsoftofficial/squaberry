import type { Metadata } from 'next';
import Link from 'next/link';
import EnquiryForm from '@/components/EnquiryForm';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: { absolute: 'Contact Squaberry — squaberry.co.uk' },
  description: 'Talk to Squaberry about your next design, development, cloud or technology project.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader current="contact" ctaHref="mailto:hello@squaberry.co.uk" />
      <main id="main">
        <section className="wrap contact-page-hero">
          <div className="contact-page-grid">
            <div>
              <p className="mono">A GOOD CONVERSATION STARTS HERE</p>
              <h1>Let’s make<br />something work.</h1>
              <p>Tell us what you’re thinking about. It can be a project, an opportunity, or a question you haven’t quite worked out yet. A perfect brief is not required.</p>
            </div>
            <div className="contact-card">
              <p className="mono">THE QUICKEST WAY TO REACH US</p>
              <h2>Send us a message.</h2>
              <p>Use the form below and your message lands straight in our inbox. Prefer email? That works too.</p>
              <a href="#enquiry">Go to the form <span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </section>
        <section className="contact-form-section" id="enquiry" aria-labelledby="formTitle">
          <div className="wrap contact-form-layout">
            <div className="contact-form-intro">
              <p className="mono">SEND A MESSAGE</p>
              <h2 id="formTitle">Tell us what<br />you need.</h2>
              <p>A few lines is plenty. Share your goals, a question or a rough idea, and we’ll reply by email.</p>
              <p className="form-required-note">Fields marked <span aria-hidden="true">*</span><span className="visually-hidden">with an asterisk</span> are required.</p>
            </div>
            <EnquiryForm source="Contact page" />
          </div>
        </section>
        <section className="wrap contact-more" aria-label="Other ways to get in touch">
          <div className="contact-details">
            <div className="contact-detail"><p className="mono">01 / PREFER EMAIL?</p><p><a href="mailto:hello@squaberry.co.uk?subject=Hello%20Squaberry">hello@squaberry.co.uk</a></p></div>
            <div className="contact-detail"><p className="mono">02 / WHAT TO INCLUDE</p><p>Your goals, questions, or rough idea</p></div>
            <div className="contact-detail"><p className="mono">03 / WHAT HAPPENS NEXT</p><p>We’ll reply by email</p></div>
          </div>
          <p className="contact-note">Messages sent through the form are stored securely for our team and used only to reply to you. Read how we handle them in our <Link href="/privacy">privacy policy</Link>.</p>
        </section>
      </main>
      <SiteFooter current="contact" />
    </>
  );
}
