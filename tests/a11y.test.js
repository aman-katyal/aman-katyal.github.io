/**
 * Accessibility regressions: focus visibility, names, theme state, and motion.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readRepoFile } = require('./helpers/project-data');

describe('Accessibility regressions', () => {
  it('should provide a skip link and a focusable main target', () => {
    const layout = readRepoFile('_layouts/default.html');
    assert.ok(layout.includes('class="skip-link'), 'Layout is missing the skip link');
    assert.ok(layout.includes('id="main-content"'), 'Layout is missing the skip target');
    assert.ok(layout.includes('tabindex="-1"'), 'Main content must be programmatically focusable');
  });

  it('should expose theme state and honor reduced motion', () => {
    const layout = readRepoFile('_layouts/default.html');
    assert.ok(layout.includes('aria-pressed="false"'), 'Theme toggle does not expose pressed state');
    assert.ok(layout.includes("setAttribute('aria-pressed'"), 'Theme toggle never updates pressed state');
    assert.ok(layout.includes('prefers-reduced-motion: reduce'), 'Scroll-to-top ignores reduced motion');
  });

  it('should reveal keyboard and touch affordances', () => {
    const css = readRepoFile('assets/css/style.scss');
    assert.ok(css.includes('.code-container-wrapper:focus-within .copy-code-btn'), 'Copy buttons are not revealed on keyboard focus');
    assert.ok(css.includes('@media (hover: none)'), 'Copy buttons are not discoverable on touch devices');
    assert.ok(css.includes('.project-toggle-checkbox:focus-visible + .custom-checkmark'), 'Print checkboxes lack a focus ring');
    assert.ok(css.includes('font-size: 100%'), 'Root font size must respect browser preferences');
  });

  it('should give modal navigation accessible names', () => {
    const modal = readRepoFile('_includes/project_modal.html');
    assert.ok(modal.includes('aria-label="Previous project"'), 'Previous project button has no accessible name');
    assert.ok(modal.includes('aria-label="Next project"'), 'Next project button has no accessible name');
    assert.match(modal, /id="modal-lightbox"[^>]*aria-modal="true"/, 'Lightbox is missing aria-modal="true"');
  });

  it('should not label a non-interactive project card as a control', () => {
    const home = readRepoFile('index.md');
    assert.ok(!home.includes('class="project-card" data-project-trigger="{{ project.id }}" aria-label='), 'Project card still has a misleading aria-label');
  });
});
