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
- `npm test` — end-to-end suite (project data, modal JS, styles, print pages).
  and run with `PATH=/tmp/py:$PATH`.
- Push/PR runs Jekyll build + link check via `.github/workflows/site.yml`.
