import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How squaberry.co.uk handles personal information when you visit, use our enquiry forms or email us.',
  alternates: { canonical: '/privacy' },
};

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'visit', label: 'When you visit' },
  { id: 'form', label: 'Enquiry forms' },
  { id: 'email', label: 'When you email' },
  { id: 'sharing', label: 'Sharing & retention' },
  { id: 'rights', label: 'Your choices' },
  { id: 'changes', label: 'Updates' },
  { id: 'contact', label: 'Contact' },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="SQUABERRY.CO.UK / YOUR INFORMATION"
      title="Privacy policy."
      lead="A plain-language overview of the information involved when you visit this website, send a message through one of our enquiry forms or email Squaberry."
      sections={sections}
    >
      <section id="overview"><h2>Who is responsible?</h2><p>Squaberry is responsible for personal information described in this policy. For privacy questions, contact <a href="mailto:hello@squaberry.co.uk">hello@squaberry.co.uk</a>.</p><p className="note"><strong>Business identity to add:</strong> The full legal name and business address of the data controller were not included in the supplied materials. Confirm and add these details before launch, along with any applicable privacy contact details.</p></section>
      <section id="visit"><h2>When you visit this website</h2><p>This website has no public account sign-in, advertising pixels or analytics in the files currently provided. It does not set optional tracking cookies. The only information it collects directly is what you choose to send through an enquiry form, described below.</p><p>The company hosting the site may process technical information such as IP address, request time and browser details in server or security logs. What is collected, where it is stored and how long it is kept depends on the hosting provider and its configuration. Confirm those details with your host and update this policy if needed.</p></section>
      <section id="form"><h2>When you use an enquiry form</h2><p>If you send a message through the form on our contact page or a service page, we collect your name, email address and message, plus your company name and topic if you choose to add them, and which page you sent it from. If you sign up on one of our product pages, we collect your name, email address, business name and what you’d like (a demo, pricing or a question), plus your phone number and a message if you choose to add them, and which product you’re interested in. We use these details only to read and reply to your enquiry. When you send it, we also email you a confirmation with a copy of your message (at most twice a day to the same address). We do not add you to a mailing list or use your details for marketing.</p><p>Your enquiry is stored in our database, which is hosted by DigitalOcean in Singapore, and can be viewed only by our team through a password-protected admin area. A copy of each enquiry is also emailed to our team inbox (hello@squaberry.co.uk), which is hosted by Zoho Mail, so we can reply to you from there. We keep enquiries for as long as needed to respond and keep appropriate business records, then delete them. To limit spam, the web server briefly holds your IP address in memory to cap repeated submissions; it is not saved with your enquiry.</p></section>
      <section id="email"><h2>When you email us</h2><p>If you email hello@squaberry.co.uk, we receive the email address and any personal information you choose to include. We use it to read and respond to your enquiry and, where relevant, discuss or provide requested services.</p><p>Please avoid sending sensitive personal information unless it is necessary. Email is handled by the email service used for this mailbox, which may process and store messages on our behalf. We retain messages for as long as needed to respond, keep appropriate business records, or handle a follow-up, subject to applicable retention requirements.</p></section>
      <section id="sharing"><h2>Sharing and retention</h2><p>We do not sell personal information. Information may be handled by service providers needed to operate the website, its database (DigitalOcean) or our email service (Zoho Mail), and may be disclosed if required by law or to protect our rights. Our database provider stores enquiries outside the UK, in Singapore. Any other providers and international data transfers should be confirmed against the services actually used.</p><p>We keep personal information only for as long as needed for the purpose it was collected, including appropriate business and legal record-keeping.</p></section>
      <section id="rights"><h2>Your choices and rights</h2><p>You can contact us to ask about personal information you have sent us, request correction or deletion where appropriate, or raise a privacy concern. The rights available to you depend on the data protection laws that apply to your situation. You may also have the right to complain to your local data protection authority.</p><p>The site uses no optional tracking cookies, so there is no cookie preference panel. Our team’s admin area uses a strictly necessary sign-in cookie, which is never set for visitors. If that changes, this policy and the site controls should be updated before those technologies are added.</p></section>
      <section id="changes"><h2>Updates to this policy</h2><p>We may update this page when the site, services or data handling practices change. The current version will be published here.</p><p><strong>Last updated:</strong> 26 November 2026</p></section>
      <section id="contact"><h2>Contact us</h2><p>For a privacy question, email <a href="mailto:hello@squaberry.co.uk?subject=Privacy%20question">hello@squaberry.co.uk</a>.</p></section>
    </LegalPage>
  );
}
