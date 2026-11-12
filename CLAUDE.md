# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Project rules (brand kit, accessibility requirements, site-structure constraints) live in `agents.md` and apply here too:

@agents.md

## Commands

There is no build step, package manager, linter, or test suite. The site is plain HTML/CSS/JS served as-is, plus one dependency-free PHP file for the contact form.

```bash
node preview-server.cjs            # serves the repo root at http://127.0.0.1:4173/
PORT=8080 node preview-server.cjs  # override the port
php -l contact-submit.php          # syntax-check the form handler
```

The Node preview server cannot run PHP, so the contact form shows its error message there. To exercise the form end to end, serve the repo with PHP's built-in server and point it at a local mail config (never the real one):

```bash
SQUABERRY_MAIL_CONFIG=/path/to/test-mail.ini SQUABERRY_FORM_HOLD=/tmp/held.jsonl php -S 127.0.0.1:8000
```

A test config can use `host = 127.0.0.1`, a local port, `secure = none` and an empty `username` to send to a local fake SMTP listener.

`preview-server.cjs` binds to `127.0.0.1` only, sends `Cache-Control: no-store`, and blocks path traversal outside the repo root. It only maps `.html`, `.css`, `.js` and `.svg` to content types; anything else is served as `application/octet-stream`, so add an entry to `contentTypes` if you introduce new asset types (PNG, WOFF2, etc.).

Verification is manual: load each page in the preview at desktop and narrow phone widths (the CSS has breakpoints at 900px, 720px and 370px) and check for horizontal overflow, keyboard focus, and reduced-motion behaviour.

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
- **Footer year:** any element with `[data-year]` gets the current year.

The services accordion uses native `<details>/<summary>` and needs no JS.

### `styles.css`

Hand-written, densely formatted (one long line per block). Design tokens are CSS custom properties on `:root` (`--acid`, `--ink`, `--paper`, `--white`, `--muted`, `--line`, `--pad`, `--ease`); use them instead of raw colour values. Typography is system fonts only (Arial Black for headings, Courier New for the `.mono` label style) — no web fonts are loaded. Page-specific styles are grouped by prefix: homepage sections (`.hero`, `.ticker`, `.services`, `.manifesto`, `.process`, `.contact`), `.legal-*` for terms/privacy, and `.contact-page-*`/`.contact-card`/`.contact-detail*` for the contact page. The `prefers-reduced-motion` block disables all animations and transitions globally. The homepage ticker repeats its `.ticker-group` twice so the `marquee` animation loops seamlessly — keep both copies in sync.

- **Contact form (`contact.html` only):** `#contactForm` posts to `contact-submit.php`. The script stamps the hidden `started` field, submits with `fetch` (`Accept: application/json`), shows the JSON `message` in `#formStatus`, and marks fields named in `errors` with `aria-invalid` and a `.field-error` note. Without JS the form still posts normally and the handler redirects back to `contact.html?sent=1` or `?error=<code>`.

### Contact form handler and deployment

`contact-submit.php` validates the enquiry, drops spam quietly (the `website` honeypot field, or a submission less than 3s after `started`), allows 5 submissions per hashed IP per hour, and sends a plain-text email over authenticated SMTP using its own small SMTP client (SSL on 465 or STARTTLS on 587). The visitor's address goes in `Reply-To`; `From` is always the authenticated mailbox, because Zoho rejects anything else. The `<select name="topic">` options must match the `TOPICS` list in the PHP file exactly.

SMTP credentials live in an INI file outside the web root. Its path comes from the `SQUABERRY_MAIL_CONFIG` FastCGI/env parameter, falling back to `../.squaberry/mail.ini`. If the settings are missing or SMTP fails, the enquiry is appended to `../.squaberry/held-enquiries.jsonl` (override with `SQUABERRY_FORM_HOLD`) and the visitor still sees success. Only a failed save returns an error. The privacy policy describes this, so keep the two in step. The template is `deploy/mail.ini.example`. Filled-in configs are gitignored and must never be committed.

The site is deployed on Ploi as a static site. `deploy/nginx-ploi.conf` is the full site config pasted into Ploi. It serves files directly from the deploy folder (`root`, no proxy), and it runs only `/contact-submit.php` through PHP-FPM (POST only), return 404 for every other `.php` file, and hide dotfiles (except `/.well-known/`) plus `deploy/`, the docs and the dev server. Because the repo root is the web root, any new tooling or doc file needs to be added to that deny list.

### Content constraints

The privacy policy states the site sets no cookies and runs no analytics. Its `#form` section describes exactly what the contact form collects and the one-hour hashed-IP rate limit. Changing the form fields, the rate limiting, or adding analytics, cookies or embeds requires updating `privacy.html` (and the note on `contact.html`) to match.
