# SCSS structure

`assets/css/style.scss` is the only Jekyll front-matter entry point. It contains
the front matter plus ordered `@import` declarations; every rule lives in a
partial under `_sass/`. GitHub Pages' Sass converter only searches `_sass`,
so the partials live there while the public entry point stays in `assets/css/`.

## Partial order

| Partial                  | Responsibility                                            |
| ------------------------ | --------------------------------------------------------- |
| `_tokens.scss`           | Theme custom properties for light/dark.                   |
| `_base.scss`             | Reset, typography, focus, skip link, reduced motion.      |
| `_nav.scss`              | Navbar, logo, links, theme toggle.                        |
| `_layout.scss`           | Content wrapper, standard layout, fade-in.                |
| `_home.scss`             | Hero, education card, skills, experience, email controls. |
| `_cards.scss`            | Project grid, cards, terminal badges, actions.            |
| `_project.scss`          | Project detail grid, sidebar, pagination.                 |
| `_markdown.scss`         | Long-form case-study typography and tables.               |
| `_code.scss`             | Code blocks and copy buttons.                             |
| `_feedback.scss`         | Scroll-to-top and copy toast.                             |
| `_footer.scss`           | Footer and social links.                                  |
| `_pdf-builder.scss`      | Screen-only PDF builder panel and controls.               |
| `_pdf-checklist.scss`    | Project checklist, counter, instructions.                 |
| `_print.scss`            | Print-only cover/sections, URL expansion, page breaks.    |
| `_responsive.scss`       | Small cross-component mobile overrides.                   |
| `_modal.scss`            | Modal shell, header, body, gallery, thumbnails.           |
| `_modal-details.scss`    | Highlights, skill groups, modal footer.                   |
| `_lightbox.scss`         | Full-screen image lightbox.                               |
| `_modal-responsive.scss` | Mobile modal adaptations (after modal base).              |
| `_syntax.scss`           | Rouge token colors for light/dark.                        |

## Cascade rules

- Tokens load before every component.
- `_print.scss` loads before modal base rules, matching the previous order.
- `_modal-responsive.scss` loads after all modal base/detail rules so mobile
  overrides still win.
- `_syntax.scss` remains last.
- Component-specific `@media` rules stay with their component. The small
  `_responsive.scss` file only contains cross-component layout overrides.

`tests/scss-structure.test.js` enforces the thin entry point, the 400-line
partial limit, the cascade-critical order, and the removal of legacy selectors.
`npm run lint` runs stylelint with `postcss-scss`, ESLint for `assets/js/**` and
`tests/**`, and a Prettier check; the Site workflow runs the same command.
