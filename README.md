# aman-katyal.github.io

Personal portfolio — Jekyll site, deployed on GitHub Pages from `main`.

## Local preview

Requires Ruby 3.x:

```sh
bundle install
bundle exec jekyll serve --livereload   # http://localhost:4000
```

## Checks

- `npm test` — end-to-end suite (project data, modal JS, styles, print pages).
  Needs Python 3 with `pyyaml`; if only `python3` exists, the suite shells
  out to `python`, so shim it: `ln -sf $(which python3) /tmp/py/python`
  and run with `PATH=/tmp/py:$PATH`.
- Push/PR runs Jekyll build + link check via `.github/workflows/site.yml`.
