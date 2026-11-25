import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms & conditions',
  description: 'Terms for using the Squaberry website at squaberry.co.uk.',
  alternates: { canonical: '/terms' },
};

const sections = [
  { id: 'using', label: 'Using this site' },
  { id: 'content', label: 'Site content' },
  { id: 'services', label: 'Our services' },
  { id: 'links', label: 'External links' },
  { id: 'liability', label: 'Liability' },
  { id: 'changes', label: 'Changes' },
  { id: 'contact', label: 'Contact' },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="SQUABERRY.CO.UK / THE PRACTICAL DETAILS"
      title="Terms & conditions."
      lead="These terms explain the basic rules for using this website. Any services we provide will be covered by a separate written agreement."
      sections={sections}
    >
      <section id="using"><h2>Using this site</h2><p>By using squaberry.co.uk, you agree to use it lawfully and in a way that does not damage, disable or interfere with the site or other people’s use of it. Do not attempt to gain unauthorised access to the site, its hosting environment or related systems.</p></section>
      <section id="content"><h2>Website content</h2><p>We aim to keep the information on this site clear and current. It is general information about Squaberry and the kinds of work we may offer; it is not professional, technical, security or business advice for your particular situation.</p><p>Unless we agree otherwise in writing, the site’s text, visual identity and original design are owned by or licensed to Squaberry. You may view and share links to the site for personal or business reference. Please ask before copying substantial parts or reusing our branding.</p></section>
      <section id="services"><h2>Services and project work</h2><p>Descriptions on this site are illustrative. They are not an offer to provide a particular service, a quote, or a guarantee of an outcome. We will agree scope, fees, timing, responsibilities and any other project terms separately in writing before work begins.</p></section>
      <section id="links"><h2>Links to other sites</h2><p>This site may link to third-party websites for convenience. We do not control those sites and are not responsible for their content, availability or privacy practices. Visiting an external site is your choice.</p></section>
      <section id="liability"><h2>Availability and liability</h2><p>We may update, suspend or remove parts of the site. We work to keep it available and secure, but cannot promise uninterrupted access or that every item will always be error-free.</p><p>Nothing in these terms excludes or limits liability where the law does not allow it, including liability for fraud, or for death or personal injury caused by negligence. To the extent permitted by law, we are not responsible for indirect losses arising from relying on general website information or temporary site unavailability.</p></section>
      <section id="changes"><h2>Changes to these terms</h2><p>We may revise these terms when the site or our practices change. The version published on this page applies while you use the site. Please check back for updates.</p><p><strong>Last updated:</strong> 5 November 2026</p></section>
      <section id="contact"><h2>Contact</h2><p>Questions about these terms? Email <a href="mailto:hello@squaberry.co.uk">hello@squaberry.co.uk</a>.</p><p className="note"><strong>Site owner details:</strong> The business’s full legal name and registered or business address were not supplied with the website materials. Add the verified details here before publishing.</p></section>
    </LegalPage>
  );
}
