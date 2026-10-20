/**
 * Gallery rendering, image/video switching, and thumbnail state.
 */

export function isVideo(item) {
  return !!item && item.type === 'video';
}

export function pauseVideos(els) {
  [els.mainVideoEl, els.lightboxVideoEl].forEach((videoEl) => {
    if (videoEl && typeof videoEl.pause === 'function') {
      try {
        videoEl.pause();
      } catch {
        /* not yet playable */
      }
    }
  });
}

export function showMedia(imgEl, videoEl, item, project) {
  const video = isVideo(item);

  if (imgEl) {
    imgEl.style.display = video ? 'none' : 'block';
    if (!video) {
      imgEl.src = item.src;
      imgEl.alt = item.label || project.title;
      imgEl.style.objectPosition = item.position || '';
    }
  }

  if (videoEl) {
    videoEl.style.display = video ? 'block' : 'none';
    if (video) {
      if (videoEl.getAttribute('src') !== item.src) {
        videoEl.setAttribute('src', item.src);
      }
      videoEl.setAttribute('aria-label', item.label || project.title);
    } else if (typeof videoEl.pause === 'function') {
      try {
        videoEl.pause();
      } catch {
        /* not yet playable */
      }
    }
  }
}

export function setProjectImage(els, state, index) {
  const project = state.getCurrentProject();
  if (!project || !project.images || !project.images[index]) return;

  state.currentImageIndex = index;
  const item = project.images[index];

  showMedia(els.mainImgEl, els.mainVideoEl, item, project);
  if (els.imgCaptionEl) {
    els.imgCaptionEl.textContent = item.label || project.title;
    els.imgCaptionEl.style.display = item.label ? 'block' : 'none';
  }

  updateCounter(els.mediaCounterEl, index, project.images.length);
  updateCounter(els.lightboxCounterEl, index, project.images.length);

  if (els.thumbnailsEl) {
    els.thumbnailsEl.querySelectorAll('.modal-thumb').forEach((thumb, thumbIndex) => {
      const active = thumbIndex === index;
      thumb.classList.toggle('is-active', active);
      thumb.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  if (state.isLightboxOpen) {
    showMedia(els.lightboxImgEl, els.lightboxVideoEl, item, project);
    if (els.lightboxCaptionEl) {
      els.lightboxCaptionEl.textContent = item.label || '';
    }
  }
}

export function stepImage(els, state, delta) {
  const project = state.getCurrentProject();
  if (!project || !project.images || project.images.length < 2) return;
  const next = (state.currentImageIndex + delta + project.images.length) % project.images.length;
  setProjectImage(els, state, next);
}

function updateCounter(el, index, total) {
  if (!el) return;
  const visible = total > 1;
  el.textContent = visible ? `${index + 1} / ${total}` : '';
  el.style.display = visible ? 'block' : 'none';
}

export function renderGallery(doc, els, state, project) {
  const images = project.images || [];

  if (els.thumbnailsEl) els.thumbnailsEl.innerHTML = '';

  if (images.length === 0) {
    if (els.galleryViewportEl) els.galleryViewportEl.style.display = 'none';
    if (els.thumbnailsEl) els.thumbnailsEl.style.display = 'none';
    updateCounter(els.mediaCounterEl, 0, 0);
    updateCounter(els.lightboxCounterEl, 0, 0);
    return;
  }

  if (els.galleryViewportEl) els.galleryViewportEl.style.display = 'block';

  const multiImage = images.length > 1;
  if (els.lightboxPrevBtnEl) els.lightboxPrevBtnEl.style.display = multiImage ? 'flex' : 'none';
  if (els.lightboxNextBtnEl) els.lightboxNextBtnEl.style.display = multiImage ? 'flex' : 'none';

  if (multiImage && els.thumbnailsEl) {
    els.thumbnailsEl.style.display = 'flex';
    images.forEach((image, index) => {
      const thumbBtn = doc.createElement('button');
      thumbBtn.className = 'modal-thumb' + (index === 0 ? ' is-active' : '');
      thumbBtn.type = 'button';
      thumbBtn.setAttribute('role', 'tab');
      thumbBtn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      thumbBtn.setAttribute('aria-label', image.label || `View image ${index + 1}`);

      if (image.type === 'video') {
        thumbBtn.classList.add('modal-thumb-video');
        const thumbIcon = doc.createElement('i');
        thumbIcon.className = 'fa-solid fa-circle-play';
        thumbIcon.setAttribute('aria-hidden', 'true');
        thumbBtn.appendChild(thumbIcon);
      } else {
        const thumbImg = doc.createElement('img');
        thumbImg.src = image.src;
        thumbImg.alt = image.label || `${project.title} thumbnail ${index + 1}`;
        thumbImg.loading = 'lazy';
        thumbImg.decoding = 'async';
        thumbBtn.appendChild(thumbImg);
      }

      thumbBtn.addEventListener('click', () => setProjectImage(els, state, index));
      els.thumbnailsEl.appendChild(thumbBtn);
    });
  } else if (els.thumbnailsEl) {
    els.thumbnailsEl.style.display = 'none';
  }

  const featuredIndex = images.findIndex((image) => image.featured);
  setProjectImage(els, state, featuredIndex >= 0 ? featuredIndex : 0);
}
