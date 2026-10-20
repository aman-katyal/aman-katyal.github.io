# Resume PDF

The hosted resume is `assets/Aman_Katyal_Resume.pdf`. The homepage link uses:

```liquid
{{ site.resume | relative_url }}?v={{ site.resume_version }}
```

`resume_version` lives in `_config.yml`. Bump it whenever the PDF changes so
returning visitors and the CDN fetch the new file instead of a cached copy.

## Source status

The PDF was exported from a private LaTeX source named
`Aman_Katyal_Firmware_Embedded_Resume.tex`. That source is not currently in
this repository, so the hosted PDF is not reproducible from the repo alone.
To make it recoverable, commit the `.tex` file (and any local class/style
dependencies) under `docs/resume/` or another non-published directory, then
record the export command here.

## Updating

1. Edit the private LaTeX source.
2. Export the PDF over `assets/Aman_Katyal_Resume.pdf`.
3. Bump `resume_version` in `_config.yml`.
4. Verify the homepage link resolves to the new PDF.

Content nits still tracked by #29: replace vague "defined grammar" wording with
the actual Lark/EBNF description, add Linux to the skills section, and decide
whether to add the HIL testbench project.
