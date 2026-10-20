/**
 * Layout composition: thin default layout, extracted includes, deferred scripts.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const fs = require('fs');
const { readRepoFile, repoPath } = require('./helpers/project-data');

describe('Layout composition', () => {
  it('should keep default.html as a thin composition layer', () => {
    const layout = readRepoFile('_layouts/default.html');
    const lineCount = layout.split('\n').length;

    assert.ok(lineCount < 80, `default.html is ${lineCount} lines; expected <80`);
    ['head.html', 'nav.html', 'footer.html', 'project-detail.html', 'scripts.html'].forEach((include) => {
      assert.ok(layout.includes(`include ${include}`), `default.html does not include ${include}`);
    });
    assert.ok(layout.includes('<main class="standard-layout" id="main-content" tabindex="-1">'), 'Generic pages lost their focusable main target');
  });

  it('should ship the extracted includes and cacheable scripts', () => {
    ['_includes/head.html', '_includes/nav.html', '_includes/footer.html', '_includes/project-detail.html', '_includes/scripts.html', 'assets/js/theme.js', 'assets/js/site.js'].forEach((file) => {
      assert.ok(fs.existsSync(repoPath(file)), `${file} is missing`);
    });
  });

  it('should defer every non-critical script', () => {
    const scripts = readRepoFile('_includes/scripts.html');
    ['theme.js', 'site.js', 'project-modal.js'].forEach((file) => {
      assert.match(scripts, new RegExp(`<script(?: type="module")? defer src="\\{\\{ '/assets/js/${file.replace('.', '\\.')}' \\| relative_url }}"></script>`), `${file} is not deferred`);
    });
  });

  it('should keep only the critical theme bootstrap inline', () => {
    const defaultLayout = readRepoFile('_layouts/default.html');
    const head = readRepoFile('_includes/head.html');
    const scripts = readRepoFile('_includes/scripts.html');

    assert.ok(head.includes("localStorage.getItem('theme')"), 'Theme bootstrap is missing from the head');
    assert.ok(head.includes("setAttribute('data-theme'"), 'Theme bootstrap never sets the root theme');
    assert.ok(!defaultLayout.includes('DOMContentLoaded'), 'default.html still contains inline interaction logic');
    assert.ok(!scripts.includes('DOMContentLoaded'), 'scripts.html still contains inline interaction logic');
  });

  it('should keep extracted browser scripts syntactically valid', () => {
    ['assets/js/theme.js', 'assets/js/site.js', 'assets/js/project-modal.js'].forEach((file) => {
      assert.doesNotThrow(() => {
        execFileSync(process.execPath, ['--check', repoPath(file)], { stdio: 'pipe' });
      }, `${file} has a syntax error`);
    });
  });

  it('should move interaction logic into theme.js and site.js', () => {
    const theme = readRepoFile('assets/js/theme.js');
    const site = readRepoFile('assets/js/site.js');

    assert.ok(theme.includes("setAttribute('aria-pressed'"), 'theme.js does not synchronize the toggle state');
    assert.ok(theme.includes("localStorage.setItem('theme'"), 'theme.js does not persist the selected theme');
    ['copy-code-btn', 'scroll-to-top', 'data-copy-email', 'renderMathInElement'].forEach((feature) => {
      assert.ok(site.includes(feature), `site.js is missing ${feature}`);
    });
  });
});
