/**
 * Cached DOM references and small DOM-only helpers for the project modal.
 */

export function cacheElements(doc) {
  const byId = (id) => doc.getElementById(id);

  return {
    backdropEl: byId('project-modal-backdrop'),
    modalEl: byId('project-modal'),
    closeBtnEl: byId('modal-close-btn'),
    categoryEl: byId('modal-project-category'),
    titleEl: byId('modal-project-title'),
    yearEl: byId('modal-project-year'),
    roleEl: byId('modal-project-role'),
    githubLinkEl: byId('modal-project-github'),
    liveLinkEl: byId('modal-project-live'),
    galleryViewportEl: byId('modal-gallery-viewport'),
    mainImgEl: byId('modal-main-img'),
    mainVideoEl: byId('modal-main-video'),
    imgCaptionEl: byId('modal-img-caption'),
    mediaCounterEl: byId('modal-media-counter'),
    zoomBtnEl: byId('modal-zoom-btn'),
    thumbnailsEl: byId('modal-thumbnails'),
    summaryEl: byId('modal-project-summary'),
    highlightsListEl: byId('modal-highlights-list'),
    skillsClusterEl: byId('modal-skills-cluster'),
    pillsLanguagesEl: byId('modal-pills-languages'),
    pillsTechnologiesEl: byId('modal-pills-technologies'),
    pillsProtocolsEl: byId('modal-pills-protocols'),
    groupLanguagesEl: byId('modal-group-languages'),
    groupTechnologiesEl: byId('modal-group-technologies'),
    groupProtocolsEl: byId('modal-group-protocols'),
    prevBtnEl: byId('modal-prev-btn'),
    nextBtnEl: byId('modal-next-btn'),
    navIndicatorEl: byId('modal-nav-indicator'),
    lightboxEl: byId('modal-lightbox'),
    lightboxImgEl: byId('lightbox-img'),
    lightboxVideoEl: byId('lightbox-video'),
    lightboxCaptionEl: byId('lightbox-caption'),
    lightboxCounterEl: byId('lightbox-counter'),
    lightboxCloseBtnEl: byId('lightbox-close-btn'),
    lightboxPrevBtnEl: byId('lightbox-prev-btn'),
    lightboxNextBtnEl: byId('lightbox-next-btn')
  };
}

export function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
