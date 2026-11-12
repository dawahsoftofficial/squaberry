# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Project rules (brand kit, accessibility requirements, site-structure constraints) live in `agents.md` and apply here too:

@agents.md

## Commands

There is no build step, package manager, linter, or test suite. The site is plain HTML/CSS/JS served as-is.

```bash
node preview-server.cjs            # serves the repo root at http://127.0.0.1:4173/
PORT=8080 node preview-server.cjs  # override the port
node --check script.js             # syntax-check the script
```

`preview-server.cjs` binds to `127.0.0.1` only, sends `Cache-Control: no-store`, and blocks path traversal outside the repo root. It only maps `.html`, `.css`, `.js` and `.svg` to content types; anything else is served as `application/octet-stream`, so add an entry to `contentTypes` if you introduce new asset types (PNG, WOFF2, etc.).

Verification is manual: load each page in the preview at desktop and narrow phone widths (the CSS has breakpoints at 900px, 720px and 370px) and check for horizontal overflow, keyboard focus, and reduced-motion behaviour. Submitting the contact form sends a real email through FormSubmit, so test form states by stubbing `fetch` in the browser rather than submitting.

## Architecture

Four pages — `index.html`, `contact.html`, `terms.html`, `privacy.html` — share one stylesheet (`styles.css`) and one script (`script.js`, loaded with `defer`). There is no templating, so **the header, nav and footer markup is duplicated in every page**; a change to shared chrome must be made in all four files. The copies differ deliberately:

- On `index.html` the nav uses in-page anchors (`#services`, `#about`, `#process`); other pages link to `index.html#services` etc.
- The current page's nav link carries `aria-current="page"` (e.g. Contact on `contact.html`).
- On `contact.html` the "Let's talk" nav CTA is a `mailto:` link rather than a link to `contact.html`.
- The homepage footer ends with "Back to top ↑" (`#top`, the wrapper around header + hero); the other pages end with "Home".
- Each page has its own `<title>`, meta description and `canonical` URL under `https://squaberry.co.uk/`. Pages use `lang="en-GB"` and UK spelling.

### `script.js` hooks

A single IIFE that progressively enhances markup by ID/class/attribute. Keep these hooks intact when editing HTML:

- **Mobile menu:** `#menuButton` toggles `#navigation` via `aria-expanded` and the `.is-open` class, swaps the `<b>` glyph between `+` and `−`, closes on nav-link click and on Escape (returning focus to the button).
- **Process tabs (homepage only):** `.process-tab` buttons follow the WAI-ARIA tabs pattern — each tab's `aria-controls` must name an existing `.process-panel` id; the script manages `aria-selected`, roving `tabindex`, the panels' `hidden` attribute, and Arrow/Home/End keys. The initial state is also hard-coded in the HTML so the page works without JS.
- **Contact form (`contact.html` only):** see below.
- **Footer year:** any element with `[data-year]` gets the current year.

The services accordion uses native `<details>/<summary>` and needs no JS.

### Contact form (FormSubmit)

The site has no server-side code. `#contactForm` posts to FormSubmit (formsubmit.co), which emails each submission to the address in the form's `action`. The hidden fields are FormSubmit options: `_honey` (honeypot), `_subject`, `_template` and `_next` (where FormSubmit redirects after a non-JS post: `contact.html?sent=1#enquiry`). With JS, the script posts the same fields as JSON to the form's `data-ajax-action` (the `/ajax/` endpoint), treats `success: "true"` as sent, and shows the result in `#formStatus`. The `action` and `data-ajax-action` must always name the same address; if FormSubmit's random alias replaces the email, update both.

### `styles.css`

Hand-written, densely formatted (one long line per block). Design tokens are CSS custom properties on `:root` (`--acid`, `--ink`, `--paper`, `--white`, `--muted`, `--line`, `--pad`, `--ease`); use them instead of raw colour values. Typography is system fonts only (Arial Black for headings, Courier New for the `.mono` label style) — no web fonts are loaded. Page-specific styles are grouped by prefix: homepage sections (`.hero`, `.ticker`, `.services`, `.manifesto`, `.process`, `.contact`), `.legal-*` for terms/privacy, and `.contact-page-*`/`.contact-card`/`.contact-detail*`/`.contact-form*`/`.field*` for the contact page. The `prefers-reduced-motion` block disables all animations and transitions globally. The homepage ticker repeats its `.ticker-group` twice so the `marquee` animation loops seamlessly — keep both copies in sync.

### Deployment

The site is deployed on Ploi. `deploy/nginx-ploi.conf` is the full site config pasted into Ploi. It serves files straight from the repo root (no `/public`), returns 404 for any `.php` file, and hides dotfiles (except `/.well-known/`) plus `deploy/`, the docs and the dev server. Because the repo root is the web root, any new tooling or doc file needs to be added to that deny list.

### Content constraints

The privacy policy states the site sets no cookies and runs no analytics. Its `#form` section names FormSubmit and describes exactly what the contact form collects. Changing the form fields or the form service, or adding analytics, cookies or embeds, requires updating `privacy.html` (and the note on `contact.html`) to match.
