# Squaberry project guide

## Site structure
- The site is a Next.js app (App Router, TypeScript). Keep dependencies minimal: no CSS or UI frameworks; the hand-written stylesheets in `app/` carry the design.
- Enquiries are stored in MySQL and managed in the password-protected admin panel at `/admin`. Never commit credentials; they live in `.env.local` / `.env` (see `.env.example`).
- Keep the homepage, service pages, contact page, terms page, and privacy page linked through the shared navigation and footer.
- Put brand artwork in `public/assets/` and use the supplied Squaberry logo artwork without altering its proportions.

## Visual system
- Follow the supplied brand kit: Acid Yellow `#E6FF00`, Ink `#101010`, Paper `#F4F3EC`, White `#FFFFFF`, and Muted `#55554F`.
- Use bold, compact headlines, generous spacing, clear section hierarchy, and a responsive layout that works at narrow phone widths.
- Check desktop and mobile rendering after layout changes. Prevent horizontal overflow and keep interactive targets comfortable to use.

## Accessibility and behavior
- Use semantic HTML, descriptive page titles and metadata, a skip link, visible keyboard focus, and accessible names for controls.
- Keep navigation, accordions, and process tabs keyboard-accessible. Respect `prefers-reduced-motion`.
- Preserve readable contrast, useful heading order, and working links across all pages.

## Local preview
- Start the dev server from the project root with `npm run dev` and open http://127.0.0.1:3000.
- Keep the dev server bound to loopback; do not expose it to the local network.
