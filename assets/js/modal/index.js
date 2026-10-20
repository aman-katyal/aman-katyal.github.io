/**
 * Project modal controller factory. One controller owns one state object and
 * one set of cached elements; nothing is shared through module-level state.
 */

import { cacheElements } from './dom.js';
import { bindControls } from './events.js';
import { focusDialogControl, setPageInert } from './focus.js';
import {
  pauseVideos,
  setProjectImage as setGalleryImage,
  stepImage as stepGalleryImage
} from './gallery.js';
import { bindProjectHash, updateProjectHash } from './history.js';
import {
  closeLightbox as closeLightboxView,
  openLightbox as openLightboxView
} from './lightbox.js';
import { bindKeyboard } from './keyboard.js';
import { renderProject } from './render.js';
import { createState, loadProjects } from './state.js';
import { bindTriggers } from './triggers.js';

export function createModalController(doc = document, win = null) {
  const state = createState(loadProjects(doc));
  const els = cacheElements(doc);
  let initialized = false;

  function openProjectModal(projectId, triggerEl) {
    if (state.isLightboxOpen) closeLightbox();

    const index = state.projects.findIndex((project) => project.id === projectId);
    if (index === -1) {
      console.warn('Project not found in loaded data:', projectId);
      return;
    }

    if (!state.isModalOpen) {
      state.lastActiveElement = triggerEl || doc.activeElement;
      setPageInert(doc, true);
    }

    state.currentProjectIndex = index;
    state.currentImageIndex = 0;
    renderProject(doc, els, state, state.projects[index]);

    if (els.backdropEl) {
      els.backdropEl.classList.add('is-active');
      els.backdropEl.setAttribute('aria-hidden', 'false');
    }
    if (els.modalEl) {
      els.modalEl.classList.add('is-active');
      els.modalEl.scrollTop = 0;
      const modalBody =
        typeof els.modalEl.querySelector === 'function'
          ? els.modalEl.querySelector('.modal-body')
          : null;
      if (modalBody) modalBody.scrollTop = 0;
    }

    doc.body.classList.add('modal-open');
    state.isModalOpen = true;
    updateProjectHash(win, projectId);
    // Stop retrying once the lightbox becomes the topmost dialog.
    focusDialogControl(
      doc,
      els.modalEl,
      els.closeBtnEl,
      () => state.isModalOpen && !state.isLightboxOpen
    );
  }

  function closeProjectModal() {
    if (state.isLightboxOpen) closeLightbox();

    if (els.backdropEl) {
      els.backdropEl.classList.remove('is-active');
      els.backdropEl.setAttribute('aria-hidden', 'true');
    }
    if (els.modalEl) els.modalEl.classList.remove('is-active');

    doc.body.classList.remove('modal-open');
    state.isModalOpen = false;
    updateProjectHash(win, null);
    pauseVideos(els);
    setPageInert(doc, false);

    if (state.lastActiveElement && typeof state.lastActiveElement.focus === 'function') {
      state.lastActiveElement.focus();
    }
  }

  function nextProject() {
    if (state.projects.length <= 1) return;
    const nextIndex = (state.currentProjectIndex + 1) % state.projects.length;
    openProjectModal(state.projects[nextIndex].id);
  }

  function prevProject() {
    if (state.projects.length <= 1) return;
    const prevIndex =
      (state.currentProjectIndex - 1 + state.projects.length) % state.projects.length;
    openProjectModal(state.projects[prevIndex].id);
  }

  function setProjectImage(index) {
    setGalleryImage(els, state, index);
  }

  function stepImage(delta) {
    stepGalleryImage(els, state, delta);
  }

  function openLightbox() {
    openLightboxView(doc, els, state);
  }

  function closeLightbox() {
    closeLightboxView(els, state);
  }

  const api = {
    openProjectModal,
    closeProjectModal,
    setProjectImage,
    stepImage,
    openLightbox,
    closeLightbox,
    nextProject,
    prevProject
  };

  function init() {
    if (initialized) return api;
    initialized = true;
    bindTriggers(doc, openProjectModal);
    bindKeyboard(doc, state, els, api);
    bindControls(els, api);
    bindProjectHash(win, {
      isOpen: () => state.isModalOpen,
      currentId: () => state.getCurrentProject()?.id,
      open: openProjectModal,
      close: closeProjectModal
    });
    return api;
  }

  return { init, api, state, els };
}
