/**
 * Keyboard handling: trigger activation, Escape/arrow navigation, and the
 * dialog focus trap.
 */

import { isWithin } from './focus.js';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function bindKeyboard(doc, state, els, api) {
  doc.addEventListener('keydown', (event) => handleKeyDown(doc, state, els, api, event));
}

export function handleKeyDown(doc, state, els, api, event) {
  if (!state.isModalOpen && !state.isLightboxOpen) {
    handleClosedKey(event, api);
    return;
  }

  if (event.key === 'Tab') {
    trapFocus(doc, state, els, event);
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    if (state.isLightboxOpen) {
      api.closeLightbox();
    } else {
      api.closeProjectModal();
    }
    return;
  }

  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    handleArrowKey(state, api, event);
  }
}

function handleClosedKey(event, api) {
  if (event.key !== 'Enter' && event.key !== ' ') return;

  // Native buttons/links already synthesize a click; handling keydown as well
  // would open the modal twice.
  if (event.target.closest && event.target.closest('button, a')) return;
  if (!event.target.closest) return;

  const trigger = event.target.closest('[data-project-trigger], [data-project-id]');
  if (!trigger || event.target.closest('a:not([data-project-trigger])')) return;

  event.preventDefault();
  const projectId =
    trigger.getAttribute('data-project-trigger') || trigger.getAttribute('data-project-id');
  if (!projectId) return;

  const focusTarget = trigger.matches('button, a, [tabindex]')
    ? trigger
    : trigger.querySelector('[data-project-trigger]') || trigger;
  api.openProjectModal(projectId, focusTarget);
}

function trapFocus(doc, state, els, event) {
  const container = state.isLightboxOpen ? els.lightboxEl : els.modalEl;
  if (!container) return;

  const focusable = container.querySelectorAll(FOCUSABLE);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (!isWithin(container, doc.activeElement)) {
    event.preventDefault();
    first.focus();
    return;
  }

  if (event.shiftKey && doc.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && doc.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function handleArrowKey(state, api, event) {
  event.preventDefault();
  const project = state.getCurrentProject();
  if (!project) return;

  const delta = event.key === 'ArrowRight' ? 1 : -1;
  const hasMultipleImages = project.images && project.images.length > 1;

  if (event.shiftKey || !hasMultipleImages) {
    if (delta > 0) {
      api.nextProject();
    } else {
      api.prevProject();
    }
    return;
  }

  const nextImageIndex =
    (state.currentImageIndex + delta + project.images.length) % project.images.length;
  api.setProjectImage(nextImageIndex);
}
