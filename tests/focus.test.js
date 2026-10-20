/**
 * Focus restoration, inert backgrounds, and keyboard behavior for the modal.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadProjects } = require('./helpers/project-data');
const { createDOMSandbox } = require('./helpers/mock-dom');

const projects = loadProjects();

describe('Modal focus and keyboard behavior', () => {
  it('should restore focus to the originating trigger after project navigation', async () => {
    const { doc, sandbox } = await createDOMSandbox(projects);

    const navbar = doc.createElement('nav');
    navbar.className = 'navbar';
    doc.body.appendChild(navbar);

    const wrapper = doc.createElement('div');
    wrapper.className = 'content-wrapper';
    doc.body.appendChild(wrapper);

    const trigger = doc.createElement('button');
    trigger.setAttribute('data-project-trigger', projects[0].id);
    wrapper.appendChild(trigger);
    trigger.focus();

    sandbox.window.openProjectModal(projects[0].id, trigger);
    assert.strictEqual(navbar.getAttribute('inert'), '');
    assert.strictEqual(wrapper.getAttribute('inert'), '');

    sandbox.window.nextProject();
    sandbox.window.closeProjectModal();

    assert.strictEqual(doc.activeElement, trigger, 'Focus must return to the originating button');
    assert.strictEqual(navbar.getAttribute('inert'), null);
    assert.strictEqual(wrapper.getAttribute('inert'), null);
  });

  it('should handle Escape, arrows, project switching, and the Tab trap', async () => {
    const { doc, sandbox } = await createDOMSandbox(projects);

    const dummyTrigger = doc.createElement('div');
    dummyTrigger.setAttribute('data-project-trigger', 'ml-dueling');
    dummyTrigger.setAttribute('tabindex', '0');
    doc.body.appendChild(dummyTrigger);
    dummyTrigger.focus();

    doc.dispatchEvent({
      type: 'keydown',
      key: 'Enter',
      target: dummyTrigger,
      preventDefault: () => {}
    });
    assert.ok(doc.getElementById('project-modal').classList.contains('is-active'));

    doc.dispatchEvent({
      type: 'keydown',
      key: 'ArrowRight',
      shiftKey: false,
      target: doc.getElementById('modal-close-btn'),
      preventDefault: () => {}
    });
    assert.strictEqual(doc.getElementById('modal-main-img').src, '/assets/images/wand_pcb_2.webp');

    doc.dispatchEvent({
      type: 'keydown',
      key: 'ArrowLeft',
      shiftKey: false,
      target: doc.getElementById('modal-close-btn'),
      preventDefault: () => {}
    });
    assert.strictEqual(doc.getElementById('modal-main-img').src, '/assets/images/wand_pcb_1.webp');

    doc.dispatchEvent({
      type: 'keydown',
      key: 'ArrowRight',
      shiftKey: true,
      target: doc.getElementById('modal-close-btn'),
      preventDefault: () => {}
    });
    assert.strictEqual(
      doc.getElementById('modal-project-title').textContent,
      'ROV HIL Testbench & Control Board'
    );

    sandbox.window.openLightbox();
    assert.ok(doc.getElementById('modal-lightbox').classList.contains('is-active'));

    const escapeEvent = {
      type: 'keydown',
      key: 'Escape',
      target: doc.getElementById('lightbox-close-btn'),
      preventDefault: () => {}
    };
    doc.dispatchEvent(escapeEvent);
    assert.ok(!doc.getElementById('modal-lightbox').classList.contains('is-active'));
    assert.ok(doc.getElementById('project-modal').classList.contains('is-active'));

    doc.dispatchEvent(escapeEvent);
    assert.ok(!doc.getElementById('project-modal').classList.contains('is-active'));
    assert.ok(!doc.body.classList.contains('modal-open'));
    assert.strictEqual(
      doc.activeElement,
      dummyTrigger,
      'Focus must return to the originating trigger'
    );

    sandbox.window.openProjectModal('rov-hil-testbench');
    const focusables = doc
      .getElementById('project-modal')
      .querySelectorAll('button:not([disabled]), [href]');
    assert.ok(focusables.length >= 2, 'Modal should contain multiple focusable elements');

    const firstElement = focusables[0];
    const lastElement = focusables[focusables.length - 1];

    lastElement.focus();
    doc.dispatchEvent({
      type: 'keydown',
      key: 'Tab',
      shiftKey: false,
      target: lastElement,
      preventDefault: () => {}
    });
    assert.strictEqual(doc.activeElement, firstElement);

    firstElement.focus();
    doc.dispatchEvent({
      type: 'keydown',
      key: 'Tab',
      shiftKey: true,
      target: firstElement,
      preventDefault: () => {}
    });
    assert.strictEqual(doc.activeElement, lastElement);
  });
});
