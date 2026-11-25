# Squaberry project guide

## Site structure
- The site is a Next.js app (App Router, TypeScript). Keep dependencies minimal: no CSS or UI frameworks; the hand-written stylesheets carry the design. Lenis (smooth scrolling) is the only front-end library.
- Enquiries are stored in MySQL and managed in the password-protected admin panel at `/admin`. Never commit credentials; they live in `.env.local` / `.env` (see `.env.example`).
- Keep the homepage, services, projects, about, contact, terms and privacy pages linked through the shared header and footer.
- Put brand artwork in `public/assets/` and use the supplied Squaberry logo artwork without altering its proportions (on dark backgrounds it is shown in white via a CSS filter).

## Visual system (public site)
- Soft, dark and rounded, modelled on i3media.net: charcoal background `#1C1C1C` with `#272727`/`#303030` cards, off-white text `#FFFFFD`, lavender `#B3A8FF` (violet `#6A5BB5`), soft lime accent `#ECFF95`, and cream `#F9F8F3` light panels with pastel lilac, mint and peach cards. Tokens live on `:root` in `app/globals.css`.
- Headings use Bricolage Grotesque, body text uses Figtree (both via `next/font`). Use pill buttons and tags, 24px card radius, generous spacing and the section-intro pattern (rule with tick, pill label, large heading).
- Motion is gentle: Lenis inertia scrolling, scroll-driven reveals and marquees, all disabled under `prefers-reduced-motion`.
- The admin panel keeps its own original style (`app/admin/admin-base.css` + `admin.css`).
- Check desktop and mobile rendering after layout changes. Prevent horizontal overflow and keep interactive targets comfortable to use.

## Accessibility and behavior
- Use semantic HTML, descriptive page titles and metadata, a skip link, visible keyboard focus, and accessible names for controls.
- Keep navigation, the mobile menu, filters and the step-by-step form keyboard-accessible. Respect `prefers-reduced-motion`.
- Preserve readable contrast, useful heading order, and working links across all pages.

## Local preview
- Start the dev server from the project root with `npm run dev` and open http://127.0.0.1:3000.
- Keep the dev server bound to loopback; do not expose it to the local network.
