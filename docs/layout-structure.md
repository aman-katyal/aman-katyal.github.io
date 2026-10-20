# Layout structure

`_layouts/default.html` is intentionally small. It resolves the project context,
then composes includes:

```
_layouts/default.html
├── _includes/head.html          meta, canonical, OG/Twitter, fonts, theme bootstrap
├── _includes/nav.html           skip link, navbar, theme toggle
├── _includes/project-detail.html  project sidebar, content, prev/next pagination
├── _includes/footer.html        footer, scroll-to-top, copy toast
├── _includes/project_modal.html modal and lightbox markup
└── _includes/scripts.html       deferred theme.js, site.js, KaTeX, modal module entry
```

Only the small theme bootstrap remains inline in `head.html`; it runs before
first paint to avoid a light/dark flash. All other behavior lives in cacheable
files:

- `assets/js/theme.js` — theme toggle state and persistence.
- `assets/js/site.js` — code copy, scroll-to-top, email copy, optional math.
- `assets/js/project-modal.js` — ES module entry; imports `modal/index.js` and exposes `window.PortfolioModal`.
- `assets/js/modal/*.js` — state, DOM, render, gallery, lightbox, focus, keyboard, triggers, and events (see `docs/modal-modules.md`).

`tests/layout.test.js` enforces the thin layout, include list, deferred scripts,
and the single inline bootstrap.
