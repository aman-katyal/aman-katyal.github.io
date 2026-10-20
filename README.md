# aman-katyal.github.io

Personal portfolio — Jekyll site, deployed on GitHub Pages from `main`.

## Local preview

Requires Ruby 3.x:

```sh
bundle install
bundle exec jekyll serve --livereload   # http://localhost:4000
```

## Checks

- `npm install` — install the test and lint dependencies.
- `npm test` — run the focused suites in `tests/*.test.js` (data, modal, focus,
  accessibility, styles, print, and site metadata). Shared fixtures live in
  `tests/helpers/`.
- `npm run lint` — run stylelint, ESLint, and the Prettier check used by CI.
- `npm run lint:css`, `npm run lint:js`, `npm run format:check` — run one check
  at a time.
- `npm run format` — apply Prettier to JS, SCSS, Liquid HTML, YAML, JSON, and
  Markdown.
- Push/PR runs tests, lint, Jekyll build + link check via
  `.github/workflows/site.yml`.
