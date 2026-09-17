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
  let lightboxCaptionEl = null;
  let lightboxCloseBtnEl = null;

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
    lightboxCaptionEl = document.getElementById('lightbox-caption');
    lightboxCloseBtnEl = document.getElementById('lightbox-close-btn');
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

    // Main image click or zoom button click triggers lightbox
    if (galleryViewportEl) {
      galleryViewportEl.addEventListener('click', function (e) {
        if (!e.target.closest('#modal-zoom-btn') && e.target !== mainImgEl) {
          return;
        }
        openLightbox();
      });
    }

    // Lightbox close button & backdrop
    if (lightboxCloseBtnEl) {
      lightboxCloseBtnEl.addEventListener('click', closeLightbox);
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
   * Sets the active image inside the project gallery.
   * @param {number} index
   */
  function setProjectImage(index) {
    const project = getCurrentProject();
    if (!project || !project.images || !project.images[index]) return;

    currentImageIndex = index;
    const item = project.images[index];

    if (mainImgEl) {
      mainImgEl.src = item.src;
      mainImgEl.alt = item.label || project.title;
    }
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

    // Update lightbox image if currently open
    if (isLightboxOpen && lightboxImgEl) {
      lightboxImgEl.src = item.src;
      lightboxImgEl.alt = item.label || project.title;
      if (lightboxCaptionEl) {
        lightboxCaptionEl.textContent = item.label || '';
      }
    }
  }

  /**
   * Opens the full-viewport lightbox overlay for the currently active image.
   */
  function openLightbox() {
    const project = getCurrentProject();
    if (!project || !project.images || !project.images[currentImageIndex]) return;

    const item = project.images[currentImageIndex];
    if (lightboxImgEl) {
      lightboxImgEl.src = item.src;
      lightboxImgEl.alt = item.label || project.title;
    }
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

    if (images.length > 1) {
      if (thumbnailsEl) thumbnailsEl.style.display = 'flex';
      images.forEach((img, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.className = 'modal-thumb' + (idx === 0 ? ' is-active' : '');
        thumbBtn.type = 'button';
        thumbBtn.setAttribute('role', 'tab');
        thumbBtn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
        thumbBtn.setAttribute('aria-label', img.label || `View image ${idx + 1}`);

        const thumbImg = document.createElement('img');
        thumbImg.src = img.src;
        thumbImg.alt = img.label || `${project.title} thumbnail ${idx + 1}`;
        thumbBtn.appendChild(thumbImg);

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
