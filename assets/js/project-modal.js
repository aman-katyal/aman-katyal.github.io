/**
 * Interactive Project Showcase Modal & Gallery Controller
 * Powers in-page modal dialog, thumbnail navigation, lightbox zoom, and keyboard control.
 */

(function () {
  'use strict';

  // --- State ---
  let projects = [];
  let currentProjectIndex = -1;
  let currentImageIndex = 0;
  let isModalOpen = false;
  let isLightboxOpen = false;
  let lastActiveElement = null;

  // --- DOM References ---
  let backdropEl = null;
  let modalEl = null;
  let closeBtnEl = null;
  let categoryEl = null;
  let titleEl = null;
  let yearEl = null;
  let roleEl = null;
  let githubLinkEl = null;
  let liveLinkEl = null;
  let galleryViewportEl = null;
  let mainImgEl = null;
  let mainVideoEl = null;
  let imgCaptionEl = null;
  let zoomBtnEl = null;
  let thumbnailsEl = null;
  let summaryEl = null;
  let highlightsListEl = null;
  let skillsClusterEl = null;
  let pillsLanguagesEl = null;
  let pillsTechnologiesEl = null;
  let pillsProtocolsEl = null;
  let groupLanguagesEl = null;
  let groupTechnologiesEl = null;
  let groupProtocolsEl = null;
  let prevBtnEl = null;
  let nextBtnEl = null;
  let navIndicatorEl = null;
  let lightboxEl = null;
  let lightboxImgEl = null;
  let lightboxVideoEl = null;
  let lightboxCaptionEl = null;
  let lightboxCloseBtnEl = null;
  let lightboxPrevBtnEl = null;
  let lightboxNextBtnEl = null;

  /**
   * Initializes the project data and DOM element references.
   */
  function init() {
    const dataScript = document.getElementById('portfolio-projects-data');
    if (dataScript && dataScript.textContent) {
      try {
        const parsed = JSON.parse(dataScript.textContent);
        if (Array.isArray(parsed)) {
          projects = parsed;
        }
      } catch (err) {
        console.error('Failed to parse portfolio projects JSON data:', err);
      }
    }

    cacheElements();
    bindEvents();
  }

  /**
   * Caches all required DOM elements.
   */
  function cacheElements() {
    backdropEl = document.getElementById('project-modal-backdrop');
    modalEl = document.getElementById('project-modal');
    closeBtnEl = document.getElementById('modal-close-btn');
    categoryEl = document.getElementById('modal-project-category');
    titleEl = document.getElementById('modal-project-title');
    yearEl = document.getElementById('modal-project-year');
    roleEl = document.getElementById('modal-project-role');
    githubLinkEl = document.getElementById('modal-project-github');
    liveLinkEl = document.getElementById('modal-project-live');
    galleryViewportEl = document.getElementById('modal-gallery-viewport');
    mainImgEl = document.getElementById('modal-main-img');
    mainVideoEl = document.getElementById('modal-main-video');
    imgCaptionEl = document.getElementById('modal-img-caption');
    zoomBtnEl = document.getElementById('modal-zoom-btn');
    thumbnailsEl = document.getElementById('modal-thumbnails');
    summaryEl = document.getElementById('modal-project-summary');
    highlightsListEl = document.getElementById('modal-highlights-list');
    skillsClusterEl = document.getElementById('modal-skills-cluster');
    pillsLanguagesEl = document.getElementById('modal-pills-languages');
    pillsTechnologiesEl = document.getElementById('modal-pills-technologies');
    pillsProtocolsEl = document.getElementById('modal-pills-protocols');
    groupLanguagesEl = document.getElementById('modal-group-languages');
    groupTechnologiesEl = document.getElementById('modal-group-technologies');
    groupProtocolsEl = document.getElementById('modal-group-protocols');
    prevBtnEl = document.getElementById('modal-prev-btn');
    nextBtnEl = document.getElementById('modal-next-btn');
    navIndicatorEl = document.getElementById('modal-nav-indicator');
    lightboxEl = document.getElementById('modal-lightbox');
    lightboxImgEl = document.getElementById('lightbox-img');
    lightboxVideoEl = document.getElementById('lightbox-video');
    lightboxCaptionEl = document.getElementById('lightbox-caption');
    lightboxCloseBtnEl = document.getElementById('lightbox-close-btn');
    lightboxPrevBtnEl = document.getElementById('lightbox-prev-btn');
    lightboxNextBtnEl = document.getElementById('lightbox-next-btn');
  }

  /**
   * Binds global and component event listeners.
   */
  function bindEvents() {
    // Event delegation on document for card/trigger clicks
    document.addEventListener('click', handleGlobalClick);

    // Global keyboard listener
    document.addEventListener('keydown', handleKeyDown);

    // Modal close button
    if (closeBtnEl) {
      closeBtnEl.addEventListener('click', closeProjectModal);
    }

    // Backdrop click outside modal content
    if (backdropEl) {
      backdropEl.addEventListener('click', function (e) {
        if (e.target === backdropEl) {
          closeProjectModal();
        }
      });
    }

    // Clicking anywhere on the gallery viewport opens the dedicated
    // full-screen viewer (thumbnail strip clicks excluded — separate element).
    // Clicks on video controls are left alone so play/pause keeps working.
    if (galleryViewportEl) {
      galleryViewportEl.addEventListener('click', function (e) {
        if (e.target && e.target.closest && e.target.closest('video')) {
          return;
        }
        openLightbox();
      });
    }

    // Lightbox close button & backdrop
    if (lightboxCloseBtnEl) {
      lightboxCloseBtnEl.addEventListener('click', closeLightbox);
    }
    // Dedicated-viewer image navigation (mirrors ArrowLeft/ArrowRight keys)
    if (lightboxPrevBtnEl) {
      lightboxPrevBtnEl.addEventListener('click', function (e) {
        e.stopPropagation();
        stepImage(-1);
      });
    }
    if (lightboxNextBtnEl) {
      lightboxNextBtnEl.addEventListener('click', function (e) {
        e.stopPropagation();
        stepImage(1);
      });
    }
    if (lightboxEl) {
      lightboxEl.addEventListener('click', function (e) {
        if (e.target === lightboxEl) {
          closeLightbox();
        }
      });
    }

    // Prev / Next Project Buttons
    if (prevBtnEl) {
      prevBtnEl.addEventListener('click', prevProject);
    }
    if (nextBtnEl) {
      nextBtnEl.addEventListener('click', nextProject);
    }
  }

  /**
   * Handles document-wide click delegation for elements with data-project-trigger or data-project-id.
   */
  function handleGlobalClick(e) {
    const trigger = e.target.closest('[data-project-trigger], [data-project-id]');
    if (trigger) {
      // If the clicked target was an anchor link inside the card that is not the trigger itself, let it navigate naturally
      if (e.target.closest('a:not([data-project-trigger])')) {
        return;
      }
      e.preventDefault();
      const projectId = trigger.getAttribute('data-project-trigger') || trigger.getAttribute('data-project-id');
      if (projectId) {
        openProjectModal(projectId);
      }
    }
  }

  /**
   * Keyboard handler for Esc, ArrowLeft, ArrowRight, and Enter/Space on triggers.
   */
  function handleKeyDown(e) {
    // If modal/lightbox is not open, handle Enter or Space on focused project triggers
    if (!isModalOpen && !isLightboxOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        // Let native button/link activation handle keyboard interaction to
        // avoid double-opening the modal (keydown + click). Only handle
        // generic focusable triggers (e.g. div[tabindex]) here.
        if (e.target.closest && e.target.closest('button, a')) {
          return;
        }
        const trigger = e.target.closest('[data-project-trigger], [data-project-id]');
        if (trigger && !e.target.closest('a:not([data-project-trigger])')) {
          e.preventDefault();
          const projectId = trigger.getAttribute('data-project-trigger') || trigger.getAttribute('data-project-id');
          if (projectId) {
            openProjectModal(projectId);
          }
        }
      }
      return;
    }

    if (e.key === 'Tab') {
      const container = isLightboxOpen ? lightboxEl : (isModalOpen ? modalEl : null);
      if (!container) return;

      const focusable = container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (isLightboxOpen) {
        closeLightbox();
      } else {
        closeProjectModal();
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const currentProj = getCurrentProject();
      if (!currentProj) return;

      if (e.shiftKey) {
        // Shift + Arrow = Switch project
        nextProject();
      } else if (currentProj.images && currentProj.images.length > 1) {
        // Arrow = Switch image
        const nextImgIndex = (currentImageIndex + 1) % currentProj.images.length;
        setProjectImage(nextImgIndex);
      } else {
        nextProject();
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentProj = getCurrentProject();
      if (!currentProj) return;

      if (e.shiftKey) {
        // Shift + Arrow = Switch project
        prevProject();
      } else if (currentProj.images && currentProj.images.length > 1) {
        // Arrow = Switch image
        const prevImgIndex = (currentImageIndex - 1 + currentProj.images.length) % currentProj.images.length;
        setProjectImage(prevImgIndex);
      } else {
        prevProject();
      }
      return;
    }
  }

  /**
   * Returns current project object or null.
   */
  function getCurrentProject() {
    if (currentProjectIndex >= 0 && currentProjectIndex < projects.length) {
      return projects[currentProjectIndex];
    }
    return null;
  }

  /**
   * Opens the modal dialog for the requested project ID.
   * @param {string} projectId
   */
  function openProjectModal(projectId) {
    if (isLightboxOpen) {
      closeLightbox();
    }

    const index = projects.findIndex(p => p.id === projectId);
    if (index === -1) {
      console.warn('Project not found in loaded data:', projectId);
      return;
    }

    lastActiveElement = document.activeElement;
    currentProjectIndex = index;
    currentImageIndex = 0;

    renderProject(projects[currentProjectIndex]);

    if (backdropEl) {
      backdropEl.classList.add('is-active');
      backdropEl.setAttribute('aria-hidden', 'false');
    }
    if (modalEl) {
      modalEl.classList.add('is-active');
      modalEl.scrollTop = 0;
      const modalBody = modalEl.querySelector ? modalEl.querySelector('.modal-body') : null;
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
    }

    // Lock body scroll
    document.body.classList.add('modal-open');
    isModalOpen = true;

    // Focus close button or modal
    if (closeBtnEl) {
      closeBtnEl.focus();
    }
  }

  /**
   * Closes the modal dialog and returns focus to the trigger element.
   */
  function closeProjectModal() {
    if (isLightboxOpen) {
      closeLightbox();
    }

    if (backdropEl) {
      backdropEl.classList.remove('is-active');
      backdropEl.setAttribute('aria-hidden', 'true');
    }
    if (modalEl) {
      modalEl.classList.remove('is-active');
    }

    document.body.classList.remove('modal-open');
    isModalOpen = false;
    pauseVideos();

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  /**
   * Advances to the next project in the collection.
   */
  function nextProject() {
    if (projects.length <= 1) return;
    const nextIndex = (currentProjectIndex + 1) % projects.length;
    openProjectModal(projects[nextIndex].id);
  }

  /**
   * Navigates to the previous project in the collection.
   */
  function prevProject() {
    if (projects.length <= 1) return;
    const prevIndex = (currentProjectIndex - 1 + projects.length) % projects.length;
    openProjectModal(projects[prevIndex].id);
  }

  /**
   * Returns true when a gallery entry is a video rather than an image.
   */
  function isVideo(item) {
    return !!item && item.type === 'video';
  }

  /**
   * Pauses every gallery video element (called on navigate/close).
   */
  function pauseVideos() {
    [mainVideoEl, lightboxVideoEl].forEach(function (videoEl) {
      if (videoEl && typeof videoEl.pause === 'function') {
        try { videoEl.pause(); } catch (err) { /* not yet playable */ }
      }
    });
  }

  /**
   * Shows the right element (img or video) inside a viewport pair.
   */
  function showMedia(imgEl, videoEl, item, project) {
    const video = isVideo(item);
    if (imgEl) {
      imgEl.style.display = video ? 'none' : 'block';
      if (!video) {
        imgEl.src = item.src;
        imgEl.alt = item.label || project.title;
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
        try { videoEl.pause(); } catch (err) { /* not yet playable */ }
      }
    }
  }

  /**
   * Sets the active image inside the project gallery.
   * @param {number} index
   */
  function setProjectImage(index) {
    const project = getCurrentProject();
    if (!project || !project.images || !project.images[index]) return;

    currentImageIndex = index;
    const item = project.images[index];

    showMedia(mainImgEl, mainVideoEl, item, project);
    if (imgCaptionEl) {
      imgCaptionEl.textContent = item.label || project.title;
      imgCaptionEl.style.display = item.label ? 'block' : 'none';
    }

    // Update thumbnail active ring
    if (thumbnailsEl) {
      const thumbs = thumbnailsEl.querySelectorAll('.modal-thumb');
      thumbs.forEach((thumb, i) => {
        if (i === index) {
          thumb.classList.add('is-active');
          thumb.setAttribute('aria-selected', 'true');
        } else {
          thumb.classList.remove('is-active');
          thumb.setAttribute('aria-selected', 'false');
        }
      });
    }

    // Update lightbox media if currently open
    if (isLightboxOpen) {
      showMedia(lightboxImgEl, lightboxVideoEl, item, project);
      if (lightboxCaptionEl) {
        lightboxCaptionEl.textContent = item.label || '';
      }
    }
  }

  /**
   * Steps the active gallery image by delta (used by lightbox arrows).
   * @param {number} delta +1 for next, -1 for previous
   */
  function stepImage(delta) {
    const project = getCurrentProject();
    if (!project || !project.images || project.images.length < 2) return;
    const next = (currentImageIndex + delta + project.images.length) % project.images.length;
    setProjectImage(next);
  }

  /**
   * Opens the full-viewport lightbox overlay for the currently active image.
   */
  function openLightbox() {
    const project = getCurrentProject();
    if (!project || !project.images || !project.images[currentImageIndex]) return;

    const item = project.images[currentImageIndex];
    showMedia(lightboxImgEl, lightboxVideoEl, item, project);
    if (lightboxCaptionEl) {
      lightboxCaptionEl.textContent = item.label || '';
    }
    if (lightboxEl) {
      lightboxEl.classList.add('is-active');
      lightboxEl.setAttribute('aria-hidden', 'false');
    }
    isLightboxOpen = true;

    if (lightboxCloseBtnEl) {
      lightboxCloseBtnEl.focus();
    }
  }

  /**
   * Closes the full-viewport lightbox overlay.
   */
  function closeLightbox() {
    pauseVideos();
    if (lightboxEl) {
      lightboxEl.classList.remove('is-active');
      lightboxEl.setAttribute('aria-hidden', 'true');
    }
    isLightboxOpen = false;

    if (zoomBtnEl) {
      zoomBtnEl.focus();
    }
  }

  /**
   * Populates the modal DOM with the provided project's content.
   * @param {Object} project
   */
  function renderProject(project) {
    if (!project) return;

    // Header metadata
    if (categoryEl) categoryEl.textContent = project.category || 'Project';
    if (titleEl) titleEl.textContent = project.title || '';
    if (yearEl) yearEl.textContent = project.year || '';
    if (roleEl) roleEl.textContent = project.role || '';

    // Links
    if (githubLinkEl) {
      if (project.github) {
        githubLinkEl.href = project.github;
        githubLinkEl.style.display = 'inline-flex';
      } else {
        githubLinkEl.style.display = 'none';
      }
    }

    if (liveLinkEl) {
      if (project.live) {
        liveLinkEl.href = project.live;
        liveLinkEl.style.display = 'inline-flex';
      } else {
        liveLinkEl.style.display = 'none';
      }
    }

    // Summary
    if (summaryEl) {
      summaryEl.textContent = project.summary || project.description || '';
    }

    // Highlights list (▹ markers)
    if (highlightsListEl) {
      highlightsListEl.innerHTML = '';
      if (Array.isArray(project.highlights)) {
        project.highlights.forEach(highlight => {
          const li = document.createElement('li');
          li.className = 'modal-highlight-item';
          li.innerHTML = `<span class="highlight-bullet">▹</span><span class="highlight-text">${escapeHTML(highlight)}</span>`;
          highlightsListEl.appendChild(li);
        });
      }
    }

    // Skills Clusters (Languages, Technologies, Protocols)
    renderSkillsCluster(project.skills);

    // Media Gallery & Thumbnails
    renderGallery(project);

    // Navigation indicator
    if (navIndicatorEl) {
      navIndicatorEl.textContent = `${currentProjectIndex + 1} / ${projects.length}`;
    }
  }

  /**
   * Renders the categorized skills pill cluster.
   * @param {Object} skills
   */
  function renderSkillsCluster(skills) {
    if (!skills) {
      if (skillsClusterEl) skillsClusterEl.style.display = 'none';
      return;
    }
    if (skillsClusterEl) skillsClusterEl.style.display = 'flex';

    renderPillRow(pillsLanguagesEl, groupLanguagesEl, skills.languages);
    renderPillRow(pillsTechnologiesEl, groupTechnologiesEl, skills.technologies);
    renderPillRow(pillsProtocolsEl, groupProtocolsEl, skills.protocols);
  }

  /**
   * Helper to populate an individual category row of skill pills.
   */
  function renderPillRow(containerEl, groupEl, items) {
    if (!containerEl) return;
    containerEl.innerHTML = '';
    if (Array.isArray(items) && items.length > 0) {
      if (groupEl) groupEl.style.display = 'block';
      items.forEach(item => {
        const pill = document.createElement('span');
        pill.className = 'skills-pill';
        pill.textContent = item;
        containerEl.appendChild(pill);
      });
    } else {
      if (groupEl) groupEl.style.display = 'none';
    }
  }

  /**
   * Populates the gallery viewport and thumbnail strip.
   * @param {Object} project
   */
  function renderGallery(project) {
    const images = project.images || [];

    if (thumbnailsEl) {
      thumbnailsEl.innerHTML = '';
    }

    if (images.length === 0) {
      if (galleryViewportEl) galleryViewportEl.style.display = 'none';
      if (thumbnailsEl) thumbnailsEl.style.display = 'none';
      return;
    }

    if (galleryViewportEl) galleryViewportEl.style.display = 'block';

    // Dedicated-viewer arrows only make sense with 2+ images
    const multiImage = images.length > 1;
    if (lightboxPrevBtnEl) lightboxPrevBtnEl.style.display = multiImage ? 'flex' : 'none';
    if (lightboxNextBtnEl) lightboxNextBtnEl.style.display = multiImage ? 'flex' : 'none';

    if (images.length > 1) {
      if (thumbnailsEl) thumbnailsEl.style.display = 'flex';
      images.forEach((img, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.className = 'modal-thumb' + (idx === 0 ? ' is-active' : '');
        thumbBtn.type = 'button';
        thumbBtn.setAttribute('role', 'tab');
        thumbBtn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
        thumbBtn.setAttribute('aria-label', img.label || `View image ${idx + 1}`);

        if (img.type === 'video') {
          thumbBtn.classList.add('modal-thumb-video');
          const thumbIcon = document.createElement('i');
          thumbIcon.className = 'fa-solid fa-circle-play';
          thumbIcon.setAttribute('aria-hidden', 'true');
          thumbBtn.appendChild(thumbIcon);
        } else {
          const thumbImg = document.createElement('img');
          thumbImg.src = img.src;
          thumbImg.alt = img.label || `${project.title} thumbnail ${idx + 1}`;
          thumbImg.loading = 'lazy';
          thumbImg.decoding = 'async';
          thumbBtn.appendChild(thumbImg);
        }

        thumbBtn.addEventListener('click', function () {
          setProjectImage(idx);
        });

        thumbnailsEl.appendChild(thumbBtn);
      });
    } else {
      if (thumbnailsEl) thumbnailsEl.style.display = 'none';
    }

    // Display initial featured image (or first image)
    const featuredIdx = images.findIndex(i => i.featured);
    const initialIdx = featuredIdx >= 0 ? featuredIdx : 0;
    setProjectImage(initialIdx);
  }

  /**
   * Basic HTML string escaping utility.
   */
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Public API Exports on window ---
  window.openProjectModal = openProjectModal;
  window.closeProjectModal = closeProjectModal;
  window.setProjectImage = setProjectImage;
  window.stepImage = stepImage;
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;
  window.nextProject = nextProject;
  window.prevProject = prevProject;

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
