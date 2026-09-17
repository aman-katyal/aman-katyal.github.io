# Interactive Project Showcase Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the project presentation into a concise, interactive, visual showcase combining `snadol.com` (image gallery, lightbox, punchy highlights, categorized skills clusters) and `thavlik.dev` (terminal bar headers, clean media frames, and direct action links).

**Architecture:** Project metadata and media are defined in `_data/projects.yml`. The homepage renders terminal-style project cards (`thavlik.dev`-inspired). Clicking any card opens a lightweight, responsive in-page modal dialog (`snadol.com`-inspired) featuring an interactive image carousel, lightbox zoom, quantitative bullet highlights, and colored skills pill clusters. Detailed `.md` files remain intact for the PDF portfolio generator.

**Tech Stack:** Jekyll / Liquid, SCSS, Vanilla JavaScript, HTML5 `<dialog>` / accessible modal pattern.

**Spec:** [`docs/superpowers/specs/2026-09-17-project-showcase-viewer-design.md`](file:///C:/Users/aman/Documents/Programming/aman-katyal.github.io/docs/superpowers/specs/2026-09-17-project-showcase-viewer-design.md)

## Global Constraints

- Zero external JS/CSS runtime dependencies; strictly vanilla JS and SCSS.
- Full compatibility with existing dark / light theme toggle (`data-theme="dark"` / `data-theme="light"`).
- Existing markdown files (`asic-design.md`, `rov-buoyancy-float.md`, etc.) and `print-portfolio.html` must remain fully intact for the PDF portfolio.
- Seamless keyboard navigation (<kbd>Esc</kbd> to close, <kbd>→</kbd> / <kbd>←</kbd> to navigate).

---

### Task 1: Asset Preparation & Project Data (`_data/projects.yml`)

**Files:**
- Create: `assets/images/wand_pcb_1.jpg` (copied from `C:\Users\aman\Downloads\PXL_20251213_200656652.jpg`)
- Create: `assets/images/wand_pcb_2.jpg` (copied from `C:\Users\aman\Downloads\PXL_20251213_200640646.jpg`)
- Create: `_data/projects.yml`

**Interfaces:**
- Produces: `site.data.projects` available in Jekyll Liquid templates containing 6 complete project definitions.

- [ ] **Step 1: Copy wand photos to `assets/images/`**

Copy the two user-provided images:
- Source: `C:\Users\aman\Downloads\PXL_20251213_200656652.jpg` -> Target: `assets/images/wand_pcb_1.jpg`
- Source: `C:\Users\aman\Downloads\PXL_20251213_200640646.jpg` -> Target: `assets/images/wand_pcb_2.jpg`

- [ ] **Step 2: Create `_data/projects.yml` with all 6 projects**

Create `_data/projects.yml` with detailed entries for:
1. `asic-design` (ASIC & Digital Design Portfolio)
2. `risc-v-verification` (RISC-V FPU Verification UVM/DPI-C)
3. `rov-hil-testbench` (ROV HIL Testbench & Control Board)
4. `rov-buoyancy-float` (Autonomous Buoyancy Float)
5. `ml-dueling` (ML Gesture Dueling System - including the wand PCB photos)
6. `esp32-bridge` (ESP32 Game Controller Bridge)

Include `id`, `title`, `subtitle`, `category`, `badge_type`, `role`, `year`, `github`, `live`, `summary`, `highlights`, `skills` (languages, technologies, protocols), and `images` (with `src`, `label`, and `featured`).

- [ ] **Step 3: Validate YAML syntax and asset paths**

Run a quick script to verify that `_data/projects.yml` parses with zero errors and all referenced images exist on disk.

- [ ] **Step 4: Commit Task 1**

```bash
git add assets/images/wand_pcb_1.jpg assets/images/wand_pcb_2.jpg _data/projects.yml
git commit -m "feat(data): add wand images and create _data/projects.yml"
```

---

### Task 2: Modal Markup & Client-Side Controller (`_includes/project_modal.html` & `assets/js/project-modal.js`)

**Files:**
- Create: `_includes/project_modal.html`
- Create: `assets/js/project-modal.js`

**Interfaces:**
- Consumes: `site.data.projects` passed as JSON via Liquid.
- Produces: `window.openProjectModal(id)`, `window.closeProjectModal()`, keyboard handlers, and lightbox zoom.

- [ ] **Step 1: Create `_includes/project_modal.html`**

Construct the accessible modal DOM structure:
- Backdrop `.project-modal-backdrop`
- Modal container `.project-modal` with ARIA role `dialog`
- Header: Category eyebrow, project title, metadata line (year, role), source/live buttons, close button (`✕`)
- Gallery section: `.modal-gallery-viewport` with featured image and caption, plus `.modal-thumbnails` strip
- Overview section: `.modal-overview`
- Highlights section: `.modal-highlights` with `▹` bullet markers
- Skills clusters: Distinct groups for Languages, Technologies, and Protocols
- Footer controls: Prev project, Next project buttons
- Lightbox overlay container for full-resolution view

- [ ] **Step 2: Create `assets/js/project-modal.js`**

Implement the interactive logic:
- Parse `projectsData` from `#portfolio-projects-data`.
- Maintain state: `currentProjectId`, `currentImageIndex`, `lightboxOpen`.
- `openProjectModal(projectId)`: sets state, populates DOM elements, enables body scroll lock, sets focus.
- `closeProjectModal()`: hides modal and lightbox, removes scroll lock.
- `setProjectImage(index)`: updates active main image and active ring on thumbnail.
- `openLightbox()` / `closeLightbox()`: handles full-viewport image view.
- Keyboard listeners: <kbd>Escape</kbd> (closes lightbox if open, else closes modal), <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> (swaps images or projects).
- Event delegation for `[data-project-trigger]` elements.

- [ ] **Step 3: Verify JS module syntax**

Verify no syntax errors or undeclared identifiers.

- [ ] **Step 4: Commit Task 2**

```bash
git add _includes/project_modal.html assets/js/project-modal.js
git commit -m "feat(modal): create project modal markup and interactive JS controller"
```

---

### Task 3: SCSS Styling for Terminal Cards & Modal Viewer (`assets/css/style.scss`)

**Files:**
- Modify: `assets/css/style.scss`

**Interfaces:**
- Consumes: Existing CSS custom variables (`--bg-color`, `--card-bg`, `--text-color`, `--accent-color`, `--border-color`).
- Produces: Styles for `.termbar`, updated `.project-card`, `.project-modal`, `.modal-gallery`, `.skills-cluster`, and `.modal-lightbox`.

- [ ] **Step 1: Add Terminal Card (`thavlik.dev` style) styling**

Add styles for:
- `.termbar`: Flexbox bar at the top of cards with monospace font, border-bottom, subtle contrasting background.
- `.termbar-title`: Monospace bold title.
- `.termbar-badge`: Capsule pill badge (e.g. `open-source`, `embedded hardware`) with distinctive tint.
- `.project-card-media`: 16:9 container, smooth hover brightness/zoom effect.
- `.project-card-actions`: Primary "Gallery & Specs ↗" and secondary "GitHub" buttons.

- [ ] **Step 2: Add Modal & Gallery (`snadol.com` style) styling**

Add styles for:
- `.project-modal-backdrop`: Fixed, full-bleed, blurred backdrop (`backdrop-filter: blur(8px)`).
- `.project-modal`: Centered card, max-width 880px, max-height 90vh, overflow-y auto, smooth entry animation.
- `.modal-gallery`: Responsive layout with main image frame (`aspect-ratio: 16/10` or `16/9`), caption badge, and horizontal thumbnail strip with active border indicator.
- `.modal-highlights`: Clean unordered list with custom `▹` bullets and comfortable line spacing.
- `.skills-cluster`: Grouped tags with subtle tinted borders and backgrounds (purple/indigo for languages, cyan/blue for technologies, green/teal for protocols).
- `.modal-lightbox`: Fixed overlay, high z-index, centered full-res image with close button.
- Mobile responsiveness: Full-bleed bottom-sheet on small screens, touch scrolling.

- [ ] **Step 3: Verify dark and light theme styles**

Ensure all new classes utilize CSS variables so dark and light modes both render with high contrast and proper legibility.

- [ ] **Step 4: Commit Task 3**

```bash
git add assets/css/style.scss
git commit -m "style: add terminal cards, modal gallery, and skills cluster styling"
```

---

### Task 4: Homepage & Layout Integration (`index.md` & `_layouts/default.html`)

**Files:**
- Modify: `index.md`
- Modify: `_layouts/default.html`

**Interfaces:**
- Consumes: `site.data.projects`, `_includes/project_modal.html`, and `assets/js/project-modal.js`.
- Produces: Rendered homepage with terminal cards and integrated modal viewer.

- [ ] **Step 1: Update `index.md` to render from `site.data.projects`**

Refactor the projects section in `index.md`:
- Loop through `site.data.projects`.
- Render `.termbar` with title and badge.
- Render `.project-card-media` with preview image.
- Render subtitle and 2-sentence summary.
- Render top technology pills.
- Add `data-project-trigger="{{ project.id }}"` to trigger the modal.
- Render direct action buttons ("Preview & Gallery ↗", "GitHub").

- [ ] **Step 2: Update `_layouts/default.html`**

- Include `{% include project_modal.html %}` before closing `</body>`.
- Include `<script src="{{ '/assets/js/project-modal.js' | relative_url }}"></script>`.

- [ ] **Step 3: Verify build and HTML output**

Run a local verification script or build check to confirm clean rendering without Liquid syntax errors.

- [ ] **Step 4: Commit Task 4**

```bash
git add index.md _layouts/default.html
git commit -m "feat: integrate projects data, terminal cards, and modal into homepage and layout"
```

---

### Task 5: End-to-End Verification

**Files:**
- Verify: `index.md`, `_layouts/default.html`, `assets/css/style.scss`, `_data/projects.yml`, `print-portfolio.html`.

- [ ] **Step 1: Verify all 6 project entries load in the modal**
- [ ] **Step 2: Verify multi-image switching and wand photos in `ml-dueling`**
- [ ] **Step 3: Verify keyboard navigation (<kbd>Esc</kbd>, <kbd>→</kbd>, <kbd>←</kbd>)**
- [ ] **Step 4: Verify dark/light mode toggle behavior**
- [ ] **Step 5: Verify `/print-portfolio/` continues functioning for PDF generation**
- [ ] **Step 6: Final clean commit and review**
