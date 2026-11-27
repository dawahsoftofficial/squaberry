# Squaberry project guide

## Site structure
- The site is a Next.js app (App Router, TypeScript). Keep dependencies minimal: no CSS or UI frameworks; the hand-written stylesheets carry the design. The only front-end libraries are Lenis (smooth scrolling) and Lucide (`lucide-react`) for the small utility glyphs only; on the server, `mysql2` talks to the database and `nodemailer` sends enquiry emails. `sharp` (dev only) makes the resized images uploaded to DigitalOcean Spaces, which serves all media. Brand and content icons are Squaberry's own hand-drawn set, drawn in `scripts/build-icons.mjs` and served as the sprite `public/icons.svg` through `components/Icon.tsx`; add or change one there (then `npm run icons:build`), and never paste SVG paths into components. Lucide is only for utility glyphs such as arrows, chevrons, menu, close and check.
- Enquiries are stored in MySQL and managed in the password-protected admin panel at `/admin`. Never commit credentials; they live in `.env.local` / `.env` (see `.env.example`).
- Keep the homepage, services, projects, about, contact, terms and privacy pages linked through the shared header and footer.
- Put brand artwork in `public/assets/`, then run `npm run media:upload` so it is on the Spaces CDN, and use the supplied Squaberry logo artwork without altering its proportions (on dark backgrounds it is shown in white via a CSS filter).

## Visual system (public site)
- Soft, dark and rounded, inspired by i3media.net (mood only: don't copy its layouts, components or wording): charcoal background `#1C1C1C` with `#272727`/`#303030` cards, off-white text `#FFFFFD`, lavender `#B3A8FF` (violet `#6A5BB5`), an accent gradient from the brand reference (blue `#3D72F5` → violet `#7C55F7` → pink `#D4479C` → orange `#F58A3D`, `--grad`; white text on it, `--spark` `#C49BFF` for small accent text and icons; no lime/yellow), and cream `#F9F8F3` light panels with pastel lilac, mint and peach cards. Tokens live on `:root` in `app/globals.css`.
- Headings use Fraunces with its soft, slightly wonky forms (SOFT 100, WONK 1), body text uses Figtree (both via `next/font`). Use soft-square buttons and navigation (14px radius: the "square" in Squaberry), pill tags, 24px card radius, generous spacing and the section-intro pattern (eyebrow label with a small square, then a large heading; no rule line).
- Motion is gentle: Lenis inertia scrolling, page fade-ins, staggered scroll reveals and soft hover effects, all disabled under `prefers-reduced-motion`. Content must never stay hidden if scripts fail.
- The admin panel uses the same visual system as the public site (`app/admin/admin-base.css` + `admin.css`, built on the tokens in `globals.css`).
- Check desktop and mobile rendering after layout changes. Prevent horizontal overflow and keep interactive targets comfortable to use.

## Accessibility and behavior
- Use semantic HTML, descriptive page titles and metadata, a skip link, visible keyboard focus, and accessible names for controls.
- Keep navigation, the mobile menu, filters and the step-by-step form keyboard-accessible. Respect `prefers-reduced-motion`.
- Preserve readable contrast, useful heading order, and working links across all pages.

## Local preview
- Start the dev server from the project root with `npm run dev` and open http://127.0.0.1:3000.
- Keep the dev server bound to loopback; do not expose it to the local network.
