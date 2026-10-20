/**
 * Full-screen lightbox open/close behavior and focus handling.
 */

import { focusDialogControl, setInert } from './focus.js';
import { pauseVideos, showMedia } from './gallery.js';

export function openLightbox(doc, els, state) {
  const project = state.getCurrentProject();
  if (!project || !project.images || !project.images[state.currentImageIndex]) return;

  const item = project.images[state.currentImageIndex];
  showMedia(els.lightboxImgEl, els.lightboxVideoEl, item, project);
  if (els.lightboxCaptionEl) els.lightboxCaptionEl.textContent = item.label || '';

  if (els.lightboxEl) {
    els.lightboxEl.classList.add('is-active');
    els.lightboxEl.setAttribute('aria-hidden', 'false');
  }

  state.isLightboxOpen = true;
  setInert(els.modalEl, true);
  focusDialogControl(doc, els.lightboxEl, els.lightboxCloseBtnEl, () => state.isLightboxOpen);
}

export function closeLightbox(els, state) {
  pauseVideos(els);

  if (els.lightboxEl) {
    els.lightboxEl.classList.remove('is-active');
    els.lightboxEl.setAttribute('aria-hidden', 'true');
  }

  state.isLightboxOpen = false;
  setInert(els.modalEl, false);

  if (els.zoomBtnEl) els.zoomBtnEl.focus();
}
