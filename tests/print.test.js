/**
 * Print builder, print CSS, math gating, and printable case studies.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { readLayout, readRepoFile, readScss, repoPath } = require('./helpers/project-data');

describe('Print portfolio builder', () => {
  it('should keep a thin builder page composed from print includes', () => {
    const page = readRepoFile('print-portfolio.html');
    const builder = readRepoFile('_includes/print/builder.html');
    const document = readRepoFile('_includes/print/document.html');
    const section = readRepoFile('_includes/print/project-section.html');

    assert.ok(
      page.split('\n').length < 40,
      'print-portfolio.html is no longer a thin include page'
    );
    assert.ok(page.includes('permalink: /print-portfolio/'), 'Missing permalink');
    assert.ok(page.includes('layout: default'), 'Missing layout');
    assert.ok(
      page.includes('site.pages | where: "printable", true'),
      'Missing printable page query'
    );
    assert.ok(page.includes('include print/builder.html'), 'Missing builder include');
    assert.ok(page.includes('include print/document.html'), 'Missing print document include');
    assert.ok(page.includes('print-builder.js'), 'Missing builder script');
    assert.ok(builder.includes('pdf-builder-panel'), 'Missing control panel');
    assert.ok(builder.includes('window.print()'), 'Missing print trigger');
    assert.ok(
      document.includes('include print/project-section.html'),
      'Document does not include project sections'
    );
    assert.ok(
      section.includes('site.data.projects[proj_slug]'),
      'Section does not resolve project metadata'
    );
    assert.ok(section.includes('proj_data.title'), 'Section does not use the data title');
    assert.ok(section.includes('proj_data.role'), 'Section does not use the data role');
    assert.ok(
      section.includes('proj_data.skills.technologies'),
      'Section does not use data technologies'
    );
  });

  it('should keep Clear All and empty restore behavior fixed', () => {
    const content = readRepoFile('assets/js/print-builder.js');
    assert.ok(
      !content.includes('presetBtns.forEach'),
      'Clear All still references the undefined presetBtns variable'
    );
    assert.ok(
      content.includes("querySelectorAll('.preset-btn')"),
      'Clear All must clear preset buttons via a live query'
    );
    assert.ok(
      content.includes('Array.isArray(saved)'),
      'Saved selections must restore an intentionally empty array'
    );
    assert.ok(
      !content.includes('saved.length > 0'),
      'Empty selections must not be skipped on restore'
    );
  });

  it('should render the counter from the printable page set', () => {
    const content = readRepoFile('_includes/print/builder.html');
    assert.match(
      content,
      /\{\{-?\s*print_pages\.size\s*\}\}\s+of\s+\{\{\s*print_pages\.size\s*\}\}\s+Selected/,
      'PDF counter is still hardcoded'
    );
    assert.ok(!content.includes('3 of 3 Selected'), 'Stale hardcoded PDF counter remains');
  });

  it('should scope print URLs and hide overlays', () => {
    const css = readScss();
    assert.ok(
      css.includes('.markdown-body a[href^="http"]:after'),
      'Print URL expansion is not scoped to article links'
    );
    assert.ok(
      css.includes('.project-modal-backdrop'),
      'Print styles do not hide the project modal'
    );
    assert.ok(css.includes('.modal-lightbox'), 'Print styles do not hide the lightbox');
    assert.ok(
      css.includes('.print-instruction-box'),
      'Print styles reference the stale instruction selector'
    );
    assert.ok(
      !css.includes(':not(.is-excluded):first-of-type'),
      'Print CSS still relies on DOM-order first-of-type'
    );
  });

  it('should mark the first visible project so excluded projects do not leave a blank page', () => {
    const css = readScss();
    const builder = readRepoFile('assets/js/print-builder.js');
    assert.ok(
      css.includes('.print-project-section.is-first-visible'),
      'Print CSS lacks a first-visible rule'
    );
    assert.ok(
      builder.includes("classList.add('is-first-visible')"),
      'Builder JS does not mark the first visible section'
    );
  });

  it('should load KaTeX only when a page opts into math', () => {
    const layout = readLayout();
    const buoyancy = readRepoFile('rov-buoyancy-float.md');
    const builder = readRepoFile('print-portfolio.html');

    assert.ok(
      layout.includes('{% if page.math %}'),
      'Layout must gate math assets behind page.math'
    );
    assert.ok(layout.includes('katex.min.js'), 'Layout is missing the KaTeX runtime');
    assert.ok(layout.includes('renderMathInElement'), 'Layout is missing KaTeX auto-rendering');
    assert.ok(
      layout.includes("querySelectorAll('.markdown-body')"),
      'Math rendering must cover every project section'
    );
    assert.ok(buoyancy.includes('math: true'), 'Buoyancy case study must opt into math rendering');
    assert.ok(builder.includes('math: true'), 'PDF builder must load math rendering');
  });

  it('should keep the printable case studies intact', () => {
    [
      { file: 'rov-hil-testbench.md', permalink: '/projects/rov-hil-testbench/', order: 1 },
      { file: 'rov-buoyancy-float.md', permalink: '/projects/rov-buoyancy-float/', order: 2 },
      { file: 'ml-dueling.md', permalink: '/projects/ml-dueling/', order: 3 }
    ].forEach(({ file, permalink, order }) => {
      const filePath = repoPath(file);
      assert.ok(fs.existsSync(filePath), `Markdown report missing: ${file}`);

      const content = readRepoFile(file);
      assert.ok(content.includes('layout: default'), `${file} missing layout: default`);
      assert.ok(
        content.includes(`permalink: ${permalink}`),
        `${file} missing permalink: ${permalink}`
      );
      assert.ok(content.includes('printable: true'), `${file} missing printable: true`);
      assert.ok(content.includes(`order: ${order}`), `${file} missing order: ${order}`);
      assert.ok(!content.includes('title:'), `${file} still duplicates the data title`);
      assert.ok(!content.includes('role:'), `${file} still duplicates the data role`);
      assert.ok(!content.includes('technologies:'), `${file} still duplicates data technologies`);
      assert.ok(!content.includes('image:'), `${file} still duplicates the featured image`);
      assert.ok(
        content.length > 2500,
        `${file} content body appears truncated (${content.length} chars)`
      );
    });
  });
});
