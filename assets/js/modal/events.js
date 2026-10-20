/**
 * Wire modal, gallery, lightbox, and navigation controls to the controller API.
 */

export function bindControls(els, api) {
  if (els.closeBtnEl) els.closeBtnEl.addEventListener('click', api.closeProjectModal);

  if (els.backdropEl) {
    els.backdropEl.addEventListener('click', (event) => {
      if (event.target === els.backdropEl) api.closeProjectModal();
    });
  }

  if (els.galleryViewportEl) {
    els.galleryViewportEl.addEventListener('click', (event) => {
      if (event.target && event.target.closest && event.target.closest('video')) return;
      // Keep the click from moving focus to <body> after the lightbox opens.
      if (typeof event.preventDefault === 'function') event.preventDefault();
      api.openLightbox();
    });
  }

  if (els.lightboxCloseBtnEl) els.lightboxCloseBtnEl.addEventListener('click', api.closeLightbox);

  if (els.lightboxEl) {
    els.lightboxEl.addEventListener('click', (event) => {
      if (event.target === els.lightboxEl) api.closeLightbox();
    });
  }

  if (els.lightboxPrevBtnEl) {
    els.lightboxPrevBtnEl.addEventListener('click', (event) => {
      event.stopPropagation();
      api.stepImage(-1);
    });
  }

  if (els.lightboxNextBtnEl) {
    els.lightboxNextBtnEl.addEventListener('click', (event) => {
      event.stopPropagation();
      api.stepImage(1);
    });
  }

  if (els.prevBtnEl) els.prevBtnEl.addEventListener('click', api.prevProject);
  if (els.nextBtnEl) els.nextBtnEl.addEventListener('click', api.nextProject);
}
