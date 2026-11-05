# Squaberry project guide

## Site structure
- Keep the site static and dependency-free: HTML pages, shared `styles.css`, and small progressive enhancements in `script.js`.
- Keep the homepage, contact page, terms page, and privacy page linked through the shared navigation and footer.
- Put brand artwork in `assets/` and use the supplied Squaberry logo artwork without altering its proportions.

## Visual system
- Follow the supplied brand kit: Acid Yellow `#E6FF00`, Ink `#101010`, Paper `#F4F3EC`, White `#FFFFFF`, and Muted `#55554F`.
- Use bold, compact headlines, generous spacing, clear section hierarchy, and a responsive layout that works at narrow phone widths.
- Check desktop and mobile rendering after layout changes. Prevent horizontal overflow and keep interactive targets comfortable to use.

## Accessibility and behavior
- Use semantic HTML, descriptive page titles and metadata, a skip link, visible keyboard focus, and accessible names for controls.
- Keep navigation, accordions, and process tabs keyboard-accessible. Respect `prefers-reduced-motion`.
- Preserve readable contrast, useful heading order, and working links across all pages.

## Local preview
- Start the preview from the project root with `node preview-server.cjs` and open the URL printed by the script.
- Keep the preview server bound to loopback; do not expose it to the local network.
