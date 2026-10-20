# aman-katyal.github.io

Personal portfolio — Jekyll site, deployed on GitHub Pages from `main`.

## Local preview

Requires Ruby 3.x:

```sh
bundle install
bundle exec jekyll serve --livereload   # http://localhost:4000
```

## Checks

- `npm install` — install the test-only Node dependencies.
- `npm test` — run the focused suites in `tests/*.test.js` (data, modal, focus,
  accessibility, styles, print, and site metadata). Shared fixtures live in
  `tests/helpers/`.
  and run with `PATH=/tmp/py:$PATH`.
- Push/PR runs Jekyll build + link check via `.github/workflows/site.yml`.
