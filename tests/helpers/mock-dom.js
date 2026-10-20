/**
 * Minimal DOM implementation used to exercise the project modal controller.
 */

const fs = require('fs');
const vm = require('vm');
const { repoPath } = require('./project-data');

class MockElement {
  constructor(tagName = 'div', id = '', className = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this._classList = new Set((className || '').split(/\s+/).filter(Boolean));
    this.children = [];
    this.parentElement = null;
    this.attributes = {};
    this.style = {};
    this.textContent = '';
    this.listeners = {};
    this.scrollTop = 0;
    this.href = '';
    this.src = '';
    this.alt = '';
    this.type = 'button';
    this.ownerDocument = null;
  }

  get className() {
    return Array.from(this._classList).join(' ');
  }

  set className(val) {
    this._classList = new Set((val || '').split(/\s+/).filter(Boolean));
  }

  get classList() {
    return {
      add: (...classes) => {
        classes.forEach(c => this._classList.add(c));
      },
      remove: (...classes) => {
        classes.forEach(c => this._classList.delete(c));
      },
      contains: (c) => this._classList.has(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (this._classList.has(c)) this._classList.delete(c);
          else this._classList.add(c);
        } else if (force) {
          this._classList.add(c);
        } else {
          this._classList.delete(c);
        }
      }
    };
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
    if (name === 'id') this.id = String(val);
    if (name === 'class') {
      this.className = String(val);
      this._classList = new Set(this.className.split(/\s+/).filter(Boolean));
    }
    if (name === 'href') this.href = String(val);
    if (name === 'src') this.src = String(val);
    if (name === 'alt') this.alt = String(val);
  }

  getAttribute(name) {
    if (name === 'id') return this.id || null;
    if (name === 'class') return this.className || null;
    if (name === 'href') return this.href || null;
    if (name === 'src') return this.src || null;
    if (name === 'alt') return this.alt || null;
    return this.attributes[name] ?? null;
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name === 'href') this.href = '';
    if (name === 'src') this.src = '';
  }

  appendChild(child) {
    child.parentElement = this;
    child.ownerDocument = this.ownerDocument;
    this.children.push(child);
    if (this.ownerDocument && child.id) {
      this.ownerDocument.elementsById[child.id] = child;
    }
    return child;
  }

  addEventListener(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(h => h !== handler);
  }

  dispatchEvent(event) {
    if (!event.target) event.target = this;
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach(fn => fn(event));
    }
    if (this.parentElement) {
      this.parentElement.dispatchEvent(event);
    }
  }

  focus() {
    if (this.ownerDocument) {
      this.ownerDocument.activeElement = this;
    }
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (curr.matches && curr.matches(selector)) {
        return curr;
      }
      curr = curr.parentElement;
    }
    return null;
  }

  matches(selector) {
    if (selector.includes(',')) {
      return selector.split(',').some(s => this.matches(s.trim()));
    }
    if (selector.startsWith('#') && this.id === selector.slice(1)) return true;
    if (selector.startsWith('.') && this._classList.has(selector.slice(1))) return true;
    if (this.tagName.toLowerCase() === selector.toLowerCase()) return true;

    if (selector.startsWith('[') && selector.endsWith(']')) {
      const inner = selector.slice(1, -1);
      if (inner.includes('=')) {
        const [k, v] = inner.split('=');
        const cleanV = v.replace(/^['"]|['"]$/g, '');
        return this.getAttribute(k) === cleanV;
      }
      return this.getAttribute(inner) !== null;
    }

    if (selector === 'a:not([data-project-trigger])') {
      return this.tagName === 'A' && this.getAttribute('data-project-trigger') === null;
    }

    if (selector === 'button:not([disabled])') {
      return this.tagName === 'BUTTON' && !this.getAttribute('disabled');
    }

    return false;
  }

  isFocusable() {
    if (this.tagName === 'BUTTON' && !this.getAttribute('disabled')) return true;
    if (this.tagName === 'A' && (this.href || this.getAttribute('href'))) return true;
    if (this.getAttribute('tabindex') && this.getAttribute('tabindex') !== '-1') return true;
    return false;
  }

  querySelectorAll(selector) {
    const results = [];
    const isFocusTrapQuery = selector.includes('button:not([disabled])');
    const walk = (node) => {
      for (const child of node.children) {
        if (isFocusTrapQuery) {
          if (child.isFocusable()) results.push(child);
        } else if (child.matches(selector)) {
          results.push(child);
        }
        walk(child);
      }
    };
    walk(this);
    return results;
  }

  querySelector(selector) {
    const list = this.querySelectorAll(selector);
    return list.length > 0 ? list[0] : null;
  }

  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];
    if (!html) {
      this.textContent = '';
      return;
    }
    const textMatch = html.match(/<span class="highlight-text">([\s\S]*?)<\/span>/);
    if (textMatch) {
      this.textContent = textMatch[1];
    }
  }

  get innerHTML() {
    return this._innerHTML || this.textContent;
  }
}

class MockDocument {
  constructor() {
    this.elementsById = {};
    this.listeners = {};
    this.body = new MockElement('body');
    this.body.ownerDocument = this;
    this.activeElement = null;
    this.readyState = 'complete';
  }

  registerElement(el) {
    el.ownerDocument = this;
    if (el.id) {
      this.elementsById[el.id] = el;
    }
  }

  getElementById(id) {
    return this.elementsById[id] || null;
  }

  createElement(tagName) {
    const el = new MockElement(tagName);
    el.ownerDocument = this;
    return el;
  }

  querySelectorAll(selector) {
    const results = [];
    const walk = (node) => {
      for (const child of node.children) {
        if (child.matches(selector)) results.push(child);
        walk(child);
      }
    };
    walk(this.body);
    return results;
  }

  addEventListener(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  dispatchEvent(event) {
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach(fn => fn(event));
    }
  }
}

/**
 * Builds the modal DOM, loads project data, and executes the controller.
 */
function createDOMSandbox(projectsData) {
  const doc = new MockDocument();

  const backdrop = new MockElement('div', 'project-modal-backdrop', 'project-modal-backdrop');
  const modal = new MockElement('div', 'project-modal', 'project-modal');
  const closeBtn = new MockElement('button', 'modal-close-btn', 'modal-close-btn');
  const category = new MockElement('span', 'modal-project-category', 'modal-category-eyebrow');
  const title = new MockElement('h2', 'modal-project-title', 'modal-title');
  const year = new MockElement('span', 'modal-project-year', 'modal-meta-item modal-year');
  const role = new MockElement('span', 'modal-project-role', 'modal-meta-item modal-role');
  const githubLink = new MockElement('a', 'modal-project-github', 'modal-btn modal-btn-secondary');
  const liveLink = new MockElement('a', 'modal-project-live', 'modal-btn modal-btn-primary');
  const galleryViewport = new MockElement('div', 'modal-gallery-viewport', 'modal-gallery-viewport');
  const mainImg = new MockElement('img', 'modal-main-img', 'modal-main-img');
  const imgCaption = new MockElement('div', 'modal-img-caption', 'modal-img-caption');
  const zoomBtn = new MockElement('button', 'modal-zoom-btn', 'modal-zoom-btn');
  const thumbnails = new MockElement('div', 'modal-thumbnails', 'modal-thumbnails');
  const summary = new MockElement('p', 'modal-project-summary', 'modal-overview');
  const highlightsList = new MockElement('ul', 'modal-highlights-list', 'modal-highlights');
  const skillsCluster = new MockElement('div', 'modal-skills-cluster', 'skills-cluster');
  const pillsLanguages = new MockElement('div', 'modal-pills-languages', 'skills-pill-group');
  const pillsTechnologies = new MockElement('div', 'modal-pills-technologies', 'skills-pill-group');
  const pillsProtocols = new MockElement('div', 'modal-pills-protocols', 'skills-pill-group');
  const groupLanguages = new MockElement('div', 'modal-group-languages', 'skills-group');
  const groupTechnologies = new MockElement('div', 'modal-group-technologies', 'skills-group');
  const groupProtocols = new MockElement('div', 'modal-group-protocols', 'skills-group');
  const prevBtn = new MockElement('button', 'modal-prev-btn', 'modal-nav-btn modal-nav-prev');
  const nextBtn = new MockElement('button', 'modal-next-btn', 'modal-nav-btn modal-nav-next');
  const navIndicator = new MockElement('div', 'modal-nav-indicator', 'modal-nav-indicator');
  const lightbox = new MockElement('div', 'modal-lightbox', 'modal-lightbox');
  const lightboxImg = new MockElement('img', 'lightbox-img', 'lightbox-img');
  const lightboxCaption = new MockElement('div', 'lightbox-caption', 'lightbox-caption');
  const lightboxCloseBtn = new MockElement('button', 'lightbox-close-btn', 'lightbox-close-btn');

  const dataScript = new MockElement('script', 'portfolio-projects-data');
  dataScript.textContent = JSON.stringify(projectsData);

  doc.body.appendChild(backdrop);
  backdrop.appendChild(modal);

  modal.appendChild(closeBtn);
  modal.appendChild(category);
  modal.appendChild(title);
  modal.appendChild(year);
  modal.appendChild(role);
  modal.appendChild(githubLink);
  modal.appendChild(liveLink);

  galleryViewport.appendChild(mainImg);
  galleryViewport.appendChild(imgCaption);
  galleryViewport.appendChild(zoomBtn);
  modal.appendChild(galleryViewport);
  modal.appendChild(thumbnails);

  modal.appendChild(summary);
  modal.appendChild(highlightsList);

  groupLanguages.appendChild(pillsLanguages);
  groupTechnologies.appendChild(pillsTechnologies);
  groupProtocols.appendChild(pillsProtocols);
  skillsCluster.appendChild(groupLanguages);
  skillsCluster.appendChild(groupTechnologies);
  skillsCluster.appendChild(groupProtocols);
  modal.appendChild(skillsCluster);

  modal.appendChild(prevBtn);
  modal.appendChild(navIndicator);
  modal.appendChild(nextBtn);

  lightbox.appendChild(lightboxCloseBtn);
  lightbox.appendChild(lightboxImg);
  lightbox.appendChild(lightboxCaption);
  doc.body.appendChild(lightbox);

  doc.body.appendChild(dataScript);

  [
    backdrop, modal, closeBtn, category, title, year, role,
    githubLink, liveLink, galleryViewport, mainImg, imgCaption,
    zoomBtn, thumbnails, summary, highlightsList, skillsCluster,
    pillsLanguages, pillsTechnologies, pillsProtocols,
    groupLanguages, groupTechnologies, groupProtocols,
    prevBtn, nextBtn, navIndicator, lightbox, lightboxImg,
    lightboxCaption, lightboxCloseBtn, dataScript
  ].forEach(el => doc.registerElement(el));

  const sandbox = {
    document: doc,
    window: {},
    console: console,
    Array: Array,
    Object: Object,
    JSON: JSON
  };
  sandbox.window = sandbox;

  const scriptContent = fs.readFileSync(repoPath('assets', 'js', 'project-modal.js'), 'utf8');
  vm.createContext(sandbox);
  vm.runInContext(scriptContent, sandbox);

  return { doc, sandbox };
}

/**
 * Builds a minimal print-builder DOM, loads saved state, and executes the
 * browser controller. The script auto-initializes because readyState is
 * already "complete".
 */
function createPrintSandbox(options = {}) {
  const doc = new MockDocument();
  const slugs = options.slugs || ['rov-hil-testbench', 'rov-buoyancy-float', 'ml-dueling'];
  const counter = new MockElement('span', 'selected-counter-badge', 'selected-badge');
  const selectAllBtn = new MockElement('button', 'btn-select-all', 'text-action-btn');
  const clearAllBtn = new MockElement('button', 'btn-clear-all', 'text-action-btn');
  const checkboxes = {};
  const cards = {};
  const sections = {};

  doc.body.appendChild(counter);
  doc.body.appendChild(selectAllBtn);
  doc.body.appendChild(clearAllBtn);

  slugs.forEach((slug) => {
    const card = new MockElement('label', '', 'pdf-checkbox-card selected');
    card.setAttribute('data-project-slug', slug);

    const checkbox = new MockElement('input', `check-${slug}`, 'project-toggle-checkbox');
    checkbox.setAttribute('data-target', `proj-sec-${slug}`);
    checkbox.checked = true;
    card.appendChild(checkbox);
    doc.body.appendChild(card);

    const section = new MockElement('section', `proj-sec-${slug}`, 'print-project-section');
    section.setAttribute('data-project-slug', slug);
    doc.body.appendChild(section);

    checkboxes[slug] = checkbox;
    cards[slug] = card;
    sections[slug] = section;
  });

  const storage = {
    store: {},
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
    },
    setItem(key, value) {
      this.store[key] = String(value);
    }
  };
  if (options.saved !== undefined) {
    storage.store.pdf_selected_projects = JSON.stringify(options.saved);
  }

  const sandbox = {
    document: doc,
    window: {},
    console,
    JSON,
    Array,
    Object,
    localStorage: storage,
    setTimeout,
    clearTimeout
  };
  sandbox.window = sandbox;

  const scriptContent = fs.readFileSync(repoPath('assets', 'js', 'print-builder.js'), 'utf8');
  vm.createContext(sandbox);
  vm.runInContext(scriptContent, sandbox);

  return {
    doc,
    sandbox,
    storage,
    counter,
    selectAllBtn,
    clearAllBtn,
    checkboxes,
    cards,
    sections,
    instance: sandbox.PrintBuilder.instance
  };
}

module.exports = {
  MockElement,
  MockDocument,
  createDOMSandbox,
  createPrintSandbox
};
