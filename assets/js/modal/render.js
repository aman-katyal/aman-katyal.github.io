/**
 * Render project metadata, links, highlights, skills, and gallery content.
 */

import { escapeHTML } from './dom.js';
import { renderGallery } from './gallery.js';

export function renderProject(doc, els, state, project) {
  if (!project) return;

  if (els.categoryEl) els.categoryEl.textContent = project.category || 'Project';
  if (els.titleEl) els.titleEl.textContent = project.title || '';
  if (els.yearEl) els.yearEl.textContent = project.year || '';
  if (els.roleEl) els.roleEl.textContent = project.role || '';

  renderLinks(els, project);
  if (els.summaryEl) els.summaryEl.textContent = project.summary || project.description || '';

  renderHighlights(doc, els, project);
  renderSkillsCluster(doc, els, project.skills);
  renderGallery(doc, els, state, project);

  if (els.navIndicatorEl) {
    els.navIndicatorEl.textContent = `${state.currentProjectIndex + 1} / ${state.projects.length}`;
  }
}

function renderLinks(els, project) {
  if (els.githubLinkEl) {
    if (project.github) {
      els.githubLinkEl.href = project.github;
      els.githubLinkEl.style.display = 'inline-flex';
    } else {
      els.githubLinkEl.style.display = 'none';
    }
  }

  if (els.liveLinkEl) {
    if (project.live) {
      const liveLabel = project.link_label || 'View';
      els.liveLinkEl.href = project.live;
      els.liveLinkEl.setAttribute(
        'aria-label',
        project.link_label
          ? 'View ' + project.title + ' on ' + liveLabel
          : 'View ' + project.title
      );
      const liveLabelEl = els.liveLinkEl.querySelector('span');
      if (liveLabelEl) liveLabelEl.textContent = liveLabel;
      els.liveLinkEl.style.display = 'inline-flex';
    } else {
      els.liveLinkEl.style.display = 'none';
    }
  }
}

function renderHighlights(doc, els, project) {
  if (!els.highlightsListEl) return;
  els.highlightsListEl.innerHTML = '';
  if (!Array.isArray(project.highlights)) return;

  project.highlights.forEach((highlight) => {
    const li = doc.createElement('li');
    li.className = 'modal-highlight-item';
    li.innerHTML = `<span class="highlight-bullet">▹</span><span class="highlight-text">${escapeHTML(highlight)}</span>`;
    els.highlightsListEl.appendChild(li);
  });
}

function renderSkillsCluster(doc, els, skills) {
  if (!skills) {
    if (els.skillsClusterEl) els.skillsClusterEl.style.display = 'none';
    return;
  }
  if (els.skillsClusterEl) els.skillsClusterEl.style.display = 'flex';

  renderPillRow(doc, els.pillsLanguagesEl, els.groupLanguagesEl, skills.languages);
  renderPillRow(doc, els.pillsTechnologiesEl, els.groupTechnologiesEl, skills.technologies);
  renderPillRow(doc, els.pillsProtocolsEl, els.groupProtocolsEl, skills.protocols);
}

function renderPillRow(doc, containerEl, groupEl, items) {
  if (!containerEl) return;
  containerEl.innerHTML = '';

  if (Array.isArray(items) && items.length > 0) {
    if (groupEl) groupEl.style.display = 'block';
    items.forEach((item) => {
      const pill = doc.createElement('span');
      pill.className = 'skills-pill';
      pill.textContent = item;
      containerEl.appendChild(pill);
    });
  } else if (groupEl) {
    groupEl.style.display = 'none';
  }
}
