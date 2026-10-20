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

## Assets

Source rasters live in `_source/images/` and are not published (Jekyll excludes
directories beginning with `_`). Regenerate the published assets with:

```sh
npm run assets:optimize
```

The script:

- optimizes every schematic SVG in `assets/images/` with SVGO;
- writes capped 1600px WebP renditions, 400/800px responsive variants, and
  200px gallery thumbnails under `assets/images/`;
- leaves `og-portfolio.jpg` as JPEG for social crawlers.

Case-study images include intrinsic `width`/`height`, `srcset`, lazy loading,
and async decoding; project cards use responsive sources; videos use
`preload="none"`, a WebP poster, and a captions track in `assets/captions/`.
Keep every WebP under the 500KB budget enforced by `tests/assets.test.js`.
