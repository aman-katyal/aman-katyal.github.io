/**
 * Print builder, print CSS, math gating, and printable case studies.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { readRepoFile, repoPath } = require('./helpers/project-data');

describe('Print portfolio builder', () => {
  it('should keep the builder page and printable query intact', () => {
    const content = readRepoFile('print-portfolio.html');
    assert.ok(content.includes('permalink: /print-portfolio/'), 'Missing permalink');
    assert.ok(content.includes('layout: default'), 'Missing layout');
    assert.ok(content.includes('site.pages | where: "printable", true'), 'Missing printable page query');
    assert.ok(content.includes('pdf-builder-panel'), 'Missing control panel');
    assert.ok(content.includes('window.print()'), 'Missing print trigger');
  });

  it('should keep Clear All and empty restore behavior fixed', () => {
    const content = readRepoFile('print-portfolio.html');
    assert.ok(!content.includes('presetBtns.forEach'), 'Clear All still references the undefined presetBtns variable');
    assert.ok(content.includes("document.querySelectorAll('.preset-btn')"), 'Clear All must clear preset buttons via a live query');
    assert.ok(content.includes('Array.isArray(saved)'), 'Saved selections must restore an intentionally empty array');
    assert.ok(!content.includes('saved.length > 0'), 'Empty selections must not be skipped on restore');
  });

  it('should render the counter from the printable page set', () => {
    const content = readRepoFile('print-portfolio.html');
    assert.ok(content.includes('{{ print_pages.size }} of {{ print_pages.size }} Selected'), 'PDF counter is still hardcoded');
    assert.ok(!content.includes('3 of 3 Selected'), 'Stale hardcoded PDF counter remains');
  });

  it('should scope print URLs and hide overlays', () => {
    const css = readRepoFile('assets/css/style.scss');
    assert.ok(css.includes('.markdown-body a[href^="http"]:after'), 'Print URL expansion is not scoped to article links');
    assert.ok(css.includes('.project-modal-backdrop'), 'Print styles do not hide the project modal');
    assert.ok(css.includes('.modal-lightbox'), 'Print styles do not hide the lightbox');
    assert.ok(css.includes('.print-instruction-box'), 'Print styles reference the stale instruction selector');
    assert.ok(!css.includes(':not(.is-excluded):first-of-type'), 'Print CSS still relies on DOM-order first-of-type');
  });

  it('should mark the first visible project so excluded projects do not leave a blank page', () => {
    const css = readRepoFile('assets/css/style.scss');
    const builder = readRepoFile('print-portfolio.html');
    assert.ok(css.includes('.print-project-section.is-first-visible'), 'Print CSS lacks a first-visible rule');
    assert.ok(builder.includes("classList.add('is-first-visible')"), 'Builder JS does not mark the first visible section');
  });

  it('should load KaTeX only when a page opts into math', () => {
    const layout = readRepoFile('_layouts/default.html');
    const buoyancy = readRepoFile('rov-buoyancy-float.md');
    const builder = readRepoFile('print-portfolio.html');

    assert.ok(layout.includes('{% if page.math %}'), 'Layout must gate math assets behind page.math');
    assert.ok(layout.includes('katex.min.js'), 'Layout is missing the KaTeX runtime');
    assert.ok(layout.includes('renderMathInElement'), 'Layout is missing KaTeX auto-rendering');
    assert.ok(layout.includes("querySelectorAll('.markdown-body')"), 'Math rendering must cover every project section');
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
      assert.ok(content.includes(`permalink: ${permalink}`), `${file} missing permalink: ${permalink}`);
      assert.ok(content.includes('printable: true'), `${file} missing printable: true`);
      assert.ok(content.includes(`order: ${order}`), `${file} missing order: ${order}`);
      assert.ok(content.includes('role:'), `${file} missing role`);
      assert.ok(content.includes('technologies:'), `${file} missing technologies`);
      assert.ok(content.includes('image:'), `${file} missing image`);
      assert.ok(content.length > 2500, `${file} content body appears truncated (${content.length} chars)`);
    });
  });
});
