/**
 * SCSS compilation, design tokens, responsive rules, and component styles.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { compileScss } = require('./helpers/sass');
const { readRepoFile } = require('./helpers/project-data');

const compiledCss = compileScss();

describe('Compiled stylesheet', () => {
  it('should compile cleanly with non-zero output', () => {
    assert.ok(compiledCss.length > 20000, `Compiled CSS length too short: ${compiledCss.length}`);
  });

  it('should define light and dark theme tokens', () => {
    assert.ok(compiledCss.includes(':root'), 'Missing :root CSS rule');
    assert.ok(compiledCss.includes('--bg-primary: #ffffff'), 'Missing light mode --bg-primary');
    assert.ok(compiledCss.includes('--text-primary: #0f172a'), 'Missing light mode --text-primary');
    assert.ok(compiledCss.includes('--accent: #1e3a8a'), 'Missing light mode --accent');

    const hasDarkSelector = compiledCss.includes('[data-theme=dark]') || compiledCss.includes('[data-theme="dark"]');
    assert.ok(hasDarkSelector, 'Missing [data-theme="dark"] rule');
    assert.ok(compiledCss.includes('--bg-primary: #0f172a'), 'Missing dark mode --bg-primary');
    assert.ok(compiledCss.includes('--text-primary: #f8fafc'), 'Missing dark mode --text-primary');
    assert.ok(compiledCss.includes('--accent: #38bdf8'), 'Missing dark mode --accent');
  });

  it('should keep dark CTA overrides at root level and reset tokens for print', () => {
    assert.ok(compiledCss.includes('[data-theme=dark] .card-btn-primary'), 'Card CTA dark override is not root-level');
    assert.ok(compiledCss.includes('[data-theme=dark] .modal-btn-primary'), 'Modal CTA dark override is not root-level');
    assert.ok(!compiledCss.includes('.project-card-actions [data-theme=dark] .card-btn-primary'), 'Dead nested card CTA override remains');
    assert.ok(!compiledCss.includes('.modal-header-actions [data-theme=dark] .modal-btn-primary'), 'Dead nested modal CTA override remains');

    const printCss = compiledCss.slice(compiledCss.indexOf('@media print'));
    assert.ok(printCss.includes('--bg-primary: #ffffff'), 'Print tokens do not force a light background');
    assert.ok(printCss.includes('--bg-secondary: #ffffff'), 'Print tokens do not reset the secondary background');
    assert.ok(printCss.includes('.figure-caption'), 'Print CSS does not reset figure captions');
  });

  it('should keep mobile modal rules after the base modal rules and allow touch panning', () => {
    const baseModalIndex = compiledCss.indexOf('.project-modal {');
    assert.ok(baseModalIndex !== -1, 'Missing base .project-modal rule');
    const mobileIndex = compiledCss.indexOf('@media (max-width: 768px)', baseModalIndex);
    assert.ok(mobileIndex > baseModalIndex, 'Mobile modal rules must come after the base modal rules');

    const nextMediaIndex = compiledCss.indexOf('@media', mobileIndex + 10);
    const mobileBlock = compiledCss.slice(mobileIndex, nextMediaIndex === -1 ? undefined : nextMediaIndex);
    assert.ok(mobileBlock.includes('touch-action: pan-y'), 'Mobile modal body must allow touch panning');
    assert.ok(!compiledCss.includes('touch-action: none'), 'touch-action:none must not remain on the body');
  });

  it('should keep wide project content from stretching the page', () => {
    assert.ok(compiledCss.includes('grid-template-columns: 280px minmax(0, 1fr)'), 'Project grid must let the content column shrink');
    assert.ok(compiledCss.includes('.project-content'), 'Missing .project-content rule');
    assert.ok(compiledCss.includes('grid-template-columns: minmax(0, 1fr)'), 'Single-column project grid must be shrinkable');
    assert.ok(compiledCss.includes('repeat(2, minmax(0, 1fr))'), 'Image grid columns must be shrinkable');
    assert.ok(compiledCss.includes('table-layout: fixed'), 'Narrow-screen tables must use fixed layout');
  });

  it('should stack education labels and compact the PDF builder on phones', () => {
    assert.match(compiledCss, /@media \(max-width: 480px\) \{[\s\S]*?\.edu-row \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\);/, 'Education rows must stack on phones');
    assert.match(compiledCss, /@media \(max-width: 480px\) \{[\s\S]*?\.pdf-builder-title \{[\s\S]*?display: block;/, 'PDF builder title must wrap naturally on phones');
    assert.ok(compiledCss.includes('padding: 1.25rem'), 'PDF builder panel should use compact phone padding');
  });

  it('should normalize project card action buttons', () => {
    assert.ok(compiledCss.includes('font: inherit'), 'Form controls must inherit the page typeface');
    assert.ok(compiledCss.includes('line-height: 1.2'), 'Action buttons must share the same line height');
    assert.ok(compiledCss.includes('flex: 1 1 100%'), 'The primary action should span its row');
    assert.ok(compiledCss.includes('flex: 1 1 calc(50% - 0.3rem)'), 'Secondary actions should share a row evenly');
  });

  it('should contain all required modal and terminal card classes', () => {
    [
      '.project-modal',
      '.project-modal-backdrop',
      '.modal-gallery',
      '.modal-thumbnails',
      '.modal-thumb',
      '.modal-lightbox',
      '.termbar',
      '.project-card',
      '.skills-cluster'
    ].forEach((selector) => {
      assert.ok(compiledCss.includes(selector), `Missing selector in compiled CSS: ${selector}`);
    });
  });

  it('should keep technical modal media uncropped', () => {
    assert.ok(!readRepoFile('_includes/project_modal.html').includes('src=""'), 'Modal still contains an empty image src attribute');
    assert.match(compiledCss, /\.modal-main-img\s*\{[\s\S]*?object-fit: contain;/, 'Modal images must use object-fit: contain');
  });

  it('should meet the documented contrast token targets', () => {
    const source = readRepoFile('assets/css/style.scss');
    assert.ok(source.includes('--text-muted: #5b6b7f'), 'Light muted text was not darkened');
    assert.ok(source.includes('--text-muted: #a8b6c9'), 'Dark muted text was not lightened');
    assert.ok(source.includes('[data-theme="dark"] .termbar-badge'), 'Dark terminal badge override is missing');
    assert.ok(source.includes('[data-theme="dark"] .selected-badge.none-selected'), 'Dark empty-selection badge override is missing');
  });
});
