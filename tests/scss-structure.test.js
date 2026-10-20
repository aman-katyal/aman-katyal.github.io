/**
 * SCSS modularization: thin entry, bounded partials, and cascade order.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { readRepoFile, readScss, repoPath } = require('./helpers/project-data');

const PARTIALS = [
  '_tokens.scss',
  '_base.scss',
  '_nav.scss',
  '_layout.scss',
  '_home.scss',
  '_cards.scss',
  '_project.scss',
  '_markdown.scss',
  '_code.scss',
  '_feedback.scss',
  '_footer.scss',
  '_pdf-builder.scss',
  '_pdf-checklist.scss',
  '_print.scss',
  '_responsive.scss',
  '_modal.scss',
  '_modal-details.scss',
  '_lightbox.scss',
  '_modal-responsive.scss',
  '_syntax.scss'
];

describe('SCSS structure', () => {
  it('should keep style.scss as a thin import entry point', () => {
    const entry = readRepoFile('assets/css/style.scss');
    const lines = entry.split('\n').length;

    assert.ok(lines < 50, `style.scss is ${lines} lines; expected <50`);
    assert.ok(!entry.includes('{'), 'style.scss still contains CSS rules');
    PARTIALS.forEach((partial) => {
      const name = partial.replace(/^_/, '').replace(/\.scss$/, '');
      assert.ok(entry.includes(`@use "${name}";`), `style.scss does not import ${partial}`);
    });
  });

  it('should keep every partial under 400 lines', () => {
    PARTIALS.forEach((partial) => {
      const file = repoPath('assets', 'css', partial);
      assert.ok(fs.existsSync(file), `${partial} is missing`);
      const lines = readRepoFile(`assets/css/${partial}`).split('\n').length;
      assert.ok(lines <= 400, `${partial} is ${lines} lines; expected <=400`);
    });
  });

  it('should keep the cascade-critical partial order explicit', () => {
    const entry = readRepoFile('assets/css/style.scss');

    assert.ok(entry.indexOf('@use "tokens";') < entry.indexOf('@use "base";'), 'Tokens must load before base rules');
    assert.ok(entry.indexOf('@use "modal";') < entry.indexOf('@use "modal-responsive";'), 'Modal mobile rules must load after modal base rules');
    assert.ok(entry.indexOf('@use "print";') < entry.indexOf('@use "modal";'), 'Print rules must load before modal base rules');
    assert.ok(entry.indexOf('@use "syntax";') > entry.indexOf('@use "lightbox";'), 'Syntax highlighting must remain last');
  });

  it('should keep print and mobile-modal rules co-located with their components', () => {
    const modalResponsive = readRepoFile('assets/css/_modal-responsive.scss');
    const print = readRepoFile('assets/css/_print.scss');

    assert.ok(modalResponsive.includes('.project-modal'), 'Mobile modal rules are not in the modal responsive partial');
    assert.ok(modalResponsive.includes('max-height: 94dvh'), 'Mobile modal viewport fallback is missing');
    assert.ok(print.includes('@media print'), 'Print rules are not in the print partial');
    assert.ok(print.includes('.project-modal-backdrop'), 'Print rules do not hide the modal backdrop');
    assert.ok(print.includes('.markdown-body a[href^="http"]:after'), 'Print URL expansion is not scoped to article links');
  });

  it('should remove the documented unused selectors', () => {
    const scss = readScss();
    ['.project-card-image', '.project-card-header', '.project-card-tag', '.project-card-title', '.filter-label', '.preset-btn'].forEach((selector) => {
      assert.ok(!scss.includes(selector), `Unused selector remains: ${selector}`);
    });
  });

  it('should ship a stylelint config and CI command', () => {
    const config = readRepoFile('.stylelintrc.json');
    const packageJson = JSON.parse(readRepoFile('package.json'));
    const workflow = readRepoFile('.github/workflows/site.yml');

    assert.ok(config.includes('postcss-scss'), 'Stylelint is not configured for SCSS');
    assert.ok(packageJson.scripts['lint:css']?.includes('stylelint'), 'Missing lint:css script');
    assert.ok(workflow.includes('npm run lint:css'), 'CI does not run stylelint');
  });
});
