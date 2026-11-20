# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Project rules (brand kit, accessibility requirements, site-structure constraints) live in `agents.md` and apply here too:

@agents.md

## Commands

```bash
npm install
npm run dev          # http://127.0.0.1:3000 (loopback only)
npm run build        # production build; also type-checks
npm run start        # serve the build on 127.0.0.1:${PORT:-3090} (production, behind nginx)
npm run typecheck    # tsc --noEmit
npm run db:migrate   # apply db/schema.sql (CREATE TABLE IF NOT EXISTS; safe to re-run)
npm run db:samples          # add 12 labelled sample portfolio projects (skips existing)
npm run db:samples:remove   # delete every sample project
```

There is no test suite or linter. Verify by running the dev server and checking pages at desktop and narrow phone widths (CSS breakpoints are 900px, 720px and 370px) for horizontal overflow, keyboard focus and reduced motion.

Configuration comes from `.env.local` (development) or `.env` (Ploi production); `.env.example` lists every variable. Both env files are gitignored and must never be committed. The local env points at the **real** DigitalOcean database, so anything you submit locally lands in production data: clean up test enquiries and portfolio items afterwards.

## Architecture

Next.js 16 App Router, TypeScript, React 19, MySQL via `mysql2`. No CSS framework: the original hand-written stylesheet is kept.

- **Pages:** `app/page.tsx` (home), `app/about`, `app/contact`, `app/terms`, `app/privacy` (both via `components/LegalPage.tsx`), `app/services/[slug]` (six service pages), `app/not-found.tsx`, plus `sitemap.ts`/`robots.ts`. Old `*.html` URLs redirect permanently in `next.config.ts`.
- **Service content** lives in `lib/services.ts`: names, slugs, homepage accordion copy, service-page copy, and `topics` (the enquiry form's topic options and the server-side allowlist). Service hero images are `public/assets/services/<slug>.png` (generated with Higgsfield to match the brand).
- **Shared chrome:** `components/SiteHeader.tsx` (client: mobile menu toggle, Escape to close; `home` switches the section links to in-page anchors, `current` marks About/Contact, `ctaHref` makes the contact page's CTA an email link). The menu has six items; `site.css` tightens header spacing between 721px and 900px so they stay on one line. and `components/SiteFooter.tsx` (`home` swaps "Home" for "Back to top"). The homepage wraps the header in `#top`, and `.top` (acid background) wraps the hero.
- **Interactive bits:** `components/ProcessTabs.tsx` (WAI-ARIA tabs with arrow/Home/End keys) and `components/EnquiryForm.tsx`. Services accordion is native `<details>`.

### Enquiries and admin

- `components/EnquiryForm.tsx` is a three-step form (topic → message → contact details), used on the homepage hero (`variant="compact"`, id `start`), the contact page and every service page (`defaultTopic` pre-selects the service and starts on step 2). Until it hydrates (or with no JS) all three steps render at once with native validation and post straight to the server action. After hydration it sets `is-enhanced`, shows one `<fieldset>` at a time with a progress bar, validates each step before moving on, moves focus to the new step, and shows a success panel. Values are controlled state, and submit calls the action inside `startTransition`, so React 19 never resets the fields. Server errors send the user back to the step with the first error.
- The form posts to the server action `app/actions/enquiry.ts` via `useActionState`. The action validates, drops spam quietly (`website` honeypot, or submitted < 3s after the `started` stamp), rate-limits 5/hour per IP **in memory** (nginx overwrites `X-Forwarded-For`), and inserts into `enquiries`. IPs are never stored.
- `lib/db.ts` is a pooled `mysql2` connection (TLS always on; `DB_CA_CERT_PATH` adds certificate verification). `lib/data.ts` holds all SQL. Both import `server-only`.
- Admin (`/admin`) is a single shared password (`ADMIN_PASSWORD`). `lib/auth.ts` issues an HMAC-signed, expiring, httpOnly cookie (`ADMIN_SESSION_SECRET`) scoped to `/admin`. **Every admin page and server action calls `requireAdmin()` itself**; there is no proxy/middleware, so a new admin page or action must do the same. Admin actions live in `app/admin/actions.ts`; panel pages are in the `app/admin/(panel)` route group, whose layout adds the admin bar. Admin pages are `noindex` (metadata, `X-Robots-Tag` header, robots.txt).
- Portfolio items (`portfolio_items`) are managed in the admin and shown on their service page (`listPublishedPortfolio`). `image_url` is either a site path into `public/` (rendered with `next/image`, so it's resized and compressed) or a full external URL (plain `<img>`). Sample projects (from `scripts/seed-sample-portfolio.mjs`) are labelled "Sample project · …" and use images in `public/assets/portfolio/samples/`; that path is how the remove command finds them. Service pages call `connection()` so they render per request and show new items immediately; they fall back to an empty state if the database is unreachable.

### Styles

- `app/globals.css` is the original site stylesheet: dense, one rule block per line, tokens on `:root` (`--acid`, `--ink`, `--paper`, `--white`, `--muted`, `--line`, `--pad`, `--ease`). Keep class names in JSX identical to it so the layout stays pixel-identical to the original static site.
- `app/site.css` adds service pages, the homepage's `.service-links` and the 404 page. `app/admin/admin.css` is imported only by admin pages. Use the tokens, not raw colours.

### Content constraints

The privacy policy (`app/privacy/page.tsx`, `#form` section) states exactly what the enquiry form collects, that enquiries are stored in a DigitalOcean database in Singapore, and that IPs are only held in memory. It also says the site sets no tracking cookies (only the admin sign-in cookie). Changing form fields, storage, rate limiting, or adding analytics/cookies/embeds requires updating it to match.

## Deployment

Ploi: a daemon runs `npm run start` on 127.0.0.1:3090 and nginx proxies to it. Full steps are in `deploy/ploi-deploy.md`; the nginx config is `deploy/nginx-ploi.conf`.
