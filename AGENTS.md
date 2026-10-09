# AGENTS.md

Jekyll portfolio (GitHub Pages, `jekyll-theme-cayman`). No Gemfile, no local build step — Pages builds `main` directly. Styling is hand-rolled SCSS, interactivity is vanilla JS. No framework, no bundler.

## Source of truth

- `_data/projects.yml` drives everything: homepage cards (`index.md`), the modal JSON payload (`_includes/project_modal.html`), and `assets/js/project-modal.js`.
- 7 projects in YAML but only 6 local pages — `posture-pet` is external-only (DevPost `live` URL, no `.md` file). Every other project needs a matching printable `.md` (`permalink: /projects/<id>`, `printable: true`, `order`, `role`, `technologies`, `image`, body > 2500 chars).
- Page wiring: `index.md` (hero + Liquid project grid) → `_layouts/default.html` (shell; renders project-detail sidebar layout only when `page.role` is set) → `_includes/project_modal.html` (modal + lightbox + JSON payload) → `assets/js/project-modal.js` (IIFE controller, public API on `window`: `openProjectModal`, `closeProjectModal`, `setProjectImage`, `openLightbox`, `closeLightbox`, `nextProject`, `prevProject`).
- `print-portfolio.html` (`/print-portfolio/`) queries `site.pages | where: "printable", true`, so a missing `printable` flag silently drops a project from PDF export.
- `assets/css/style.scss` must keep its leading `---` front-matter (Jekyll strips it before Sass). Theme is CSS vars on `:root` + `[data-theme="dark"]` overrides; keep both in sync.

## Test (read before touching projects, styles, or modal JS)

- `npm test` → `node --test tests/e2e-project-viewer.test.js`. No browser: JS is exercised via `vm` + a hand-rolled MockDOM.
- Gotchas that fail the suite for non-obvious reasons:
  - The suite shells out to **`python`** (line 377) for YAML parsing — breaks on machines with only `python3`. Workaround: `mkdir -p /tmp/py && ln -sf $(which python3) /tmp/py/python && PATH=/tmp/py:$PATH npm test`. Needs `pyyaml`.
  - SCSS check strips front-matter then runs `npx --yes sass --stdin` — needs network on first run.
  - Strict assertions: exact project-ID order, ≥3 highlights each, exactly **1** `featured: true` image per project, every `src` exists under `assets/images/` (>1KB), `wand_pcb_*.jpg` >1MB with JPEG magic bytes, all 6 local `.md` reports intact. Adding/removing a project or image means updating the test's expected lists.
- Quick focused checks: `node -c assets/js/project-modal.js`; SCSS: strip the first `---...---` block, then `npx --yes sass --stdin --no-source-map`.

## Automation quirks

- Issue/PR/label bots live in `.agents/tools/gh_tool` — always run from that dir as `python -m gh_tool <issue|pr|label> ...`. CI installs `scikit-learn` for the classifier; label taxonomy in `config.py` drives `label-sync.yml` (re-syncs on push to that file).
- Branch convention: `pwsh ./scripts/issue-start.ps1 <IssueId>` → `issue-<id>-<slug>` (needs `gh` auth + PowerShell; fails on Linux without `pwsh`).
