/**
 * End-to-End Test Suite for Interactive Project Showcase Viewer
 *
 * Verifies:
 * 1. Project YAML data model, schemas, highlights, and asset image paths on disk.
 * 2. User-provided wand photos in ml-dueling.
 * 3. Client-side JS controller (assets/js/project-modal.js):
 *    - openProjectModal for all 4 projects
 *    - setProjectImage image switching logic
 *    - nextProject and prevProject cyclic traversal
 *    - openLightbox and closeLightbox
 *    - Keyboard handling (Escape, ArrowRight, ArrowLeft, Tab focus trap, Enter/Space trigger)
 * 4. Sass/SCSS compilation of assets/css/style.scss and Dark/Light theme tokens.
 * 5. Intactness of print-portfolio.html and individual project markdown reports.
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

// --- Helper: Mock DOM Environment for project-modal.js ---
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

function createDOMSandbox(projectsData) {
  const doc = new MockDocument();

  // Create required modal DOM elements
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

  // Data script
  const dataScript = new MockElement('script', 'portfolio-projects-data');
  dataScript.textContent = JSON.stringify(projectsData);

  // Assemble hierarchy
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

  // Run the controller script
  const scriptContent = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'project-modal.js'), 'utf8');
  vm.createContext(sandbox);
  vm.runInContext(scriptContent, sandbox);

  return { doc, sandbox };
}

// --- Test Suite Execution ---
describe('End-to-End Portfolio Showcase Verification Suite', () => {
  let projects = [];

  before(() => {
    // Load YAML via Python yaml parser
    const projectsJson = execSync(
      'python -c "import yaml, json; print(json.dumps(yaml.safe_load(open(\'_data/projects.yml\', encoding=\'utf-8\'))))"',
      { encoding: 'utf8', cwd: path.join(__dirname, '..') }
    );
    projects = JSON.parse(projectsJson);
  });

  // =========================================================================
  // 1. Data Model & Schema Verification
  // =========================================================================
  describe('1. Data Model & Schema (_data/projects.yml)', () => {
    it('should contain all project entries', () => {
      assert.strictEqual(projects.length, 4, `Expected 4 projects, found ${projects.length}`);
    });

    it('should contain all required project IDs', () => {
      const expectedIds = [
        'rov-hil-testbench',
        'rov-buoyancy-float',
        'posture-pet',
        'ml-dueling'
      ];
      const actualIds = projects.map(p => p.id);
      assert.deepStrictEqual(actualIds, expectedIds);
    });


    it('should satisfy strict schema for every project entry', () => {
      projects.forEach(p => {
        assert.ok(typeof p.id === 'string' && p.id.length > 0, `Project ${p.id} missing id`);
        assert.ok(typeof p.title === 'string' && p.title.length > 0, `Project ${p.id} missing title`);
        assert.ok(typeof p.subtitle === 'string' && p.subtitle.length > 0, `Project ${p.id} missing subtitle`);
        assert.ok(typeof p.category === 'string' && p.category.length > 0, `Project ${p.id} missing category`);
        assert.ok(typeof p.badge_type === 'string' && p.badge_type.length > 0, `Project ${p.id} missing badge_type`);
        assert.ok(typeof p.role === 'string' && p.role.length > 0, `Project ${p.id} missing role`);
        assert.ok(typeof p.year === 'string' && p.year.length > 0, `Project ${p.id} missing year`);
        assert.ok(typeof p.github === 'string' && p.github.startsWith('http'), `Project ${p.id} invalid github URL`);
        assert.ok(typeof p.live === 'string', `Project ${p.id} missing live string`);
        assert.ok(typeof p.summary === 'string' && p.summary.length >= 20, `Project ${p.id} summary too short`);

        // Highlights
        assert.ok(Array.isArray(p.highlights) && p.highlights.length >= 3, `Project ${p.id} highlights must have >= 3 items`);
        p.highlights.forEach((h, i) => {
          assert.ok(typeof h === 'string' && h.trim().length > 10, `Project ${p.id} highlight #${i} too short`);
        });

        // Skills clusters
        assert.ok(p.skills && typeof p.skills === 'object', `Project ${p.id} missing skills object`);
        assert.ok(Array.isArray(p.skills.languages) && p.skills.languages.length > 0, `Project ${p.id} missing languages`);
        assert.ok(Array.isArray(p.skills.technologies) && p.skills.technologies.length > 0, `Project ${p.id} missing technologies`);
        assert.ok(Array.isArray(p.skills.protocols) && p.skills.protocols.length > 0, `Project ${p.id} missing protocols`);

        // Images
        assert.ok(Array.isArray(p.images) && p.images.length >= 1, `Project ${p.id} images array empty`);
        const featuredImages = p.images.filter(img => img.featured === true);
        assert.strictEqual(featuredImages.length, 1, `Project ${p.id} must have exactly 1 featured image`);

        p.images.forEach((img, i) => {
          assert.ok(typeof img.src === 'string' && img.src.startsWith('/assets/images/'), `Project ${p.id} image ${i} invalid src: ${img.src}`);
          assert.ok(typeof img.label === 'string' && img.label.length > 0, `Project ${p.id} image ${i} missing label`);
        });
      });
    });

    it('should verify all referenced image assets exist on disk with positive byte size', () => {
      projects.forEach(p => {
        p.images.forEach(img => {
          const relativeDiskPath = img.src.replace(/^\//, '');
          const absPath = path.join(__dirname, '..', relativeDiskPath);
          assert.ok(fs.existsSync(absPath), `Image file missing on disk: ${relativeDiskPath} for project ${p.id}`);
          const stat = fs.statSync(absPath);
          assert.ok(stat.size > 1000, `Image file suspiciously small (${stat.size} bytes): ${relativeDiskPath}`);
        });
      });
    });
  });

  // =========================================================================
  // 2. User-Provided Wand Photos Verification
  // =========================================================================
  describe('2. Wand Photos in ml-dueling', () => {
    it('should include wand_pcb_1.jpg and wand_pcb_2.jpg in ml-dueling images', () => {
      const mlProject = projects.find(p => p.id === 'ml-dueling');
      assert.ok(mlProject, 'ml-dueling project not found');

      const imageSrcs = mlProject.images.map(img => img.src);
      assert.ok(
        imageSrcs.includes('/assets/images/wand_pcb_1.jpg'),
        'ml-dueling missing /assets/images/wand_pcb_1.jpg'
      );
      assert.ok(
        imageSrcs.includes('/assets/images/wand_pcb_2.jpg'),
        'ml-dueling missing /assets/images/wand_pcb_2.jpg'
      );
    });

    it('should verify wand photos exist on disk, are web-sized, and are valid JPEG headers', () => {
      const wand1 = path.join(__dirname, '..', 'assets', 'images', 'wand_pcb_1.jpg');
      const wand2 = path.join(__dirname, '..', 'assets', 'images', 'wand_pcb_2.jpg');

      assert.ok(fs.existsSync(wand1), 'wand_pcb_1.jpg does not exist');
      assert.ok(fs.existsSync(wand2), 'wand_pcb_2.jpg does not exist');

      const stat1 = fs.statSync(wand1);
      const stat2 = fs.statSync(wand2);

      // Compressed for web (~1600px wide); JPEG magic bytes prove real photos
      assert.ok(stat1.size > 150000, `wand_pcb_1.jpg size ${stat1.size} is suspiciously small`);
      assert.ok(stat2.size > 150000, `wand_pcb_2.jpg size ${stat2.size} is suspiciously small`);

      // Verify JPEG magic bytes 0xFF 0xD8 0xFF
      const buf1 = fs.readFileSync(wand1);
      const buf2 = fs.readFileSync(wand2);
      assert.strictEqual(buf1[0], 0xFF);
      assert.strictEqual(buf1[1], 0xD8);
      assert.strictEqual(buf1[2], 0xFF);
      assert.strictEqual(buf2[0], 0xFF);
      assert.strictEqual(buf2[1], 0xD8);
      assert.strictEqual(buf2[2], 0xFF);
    });
  });

  // =========================================================================
  // 3. JavaScript Controller (assets/js/project-modal.js) Verification
  // =========================================================================
  describe('3. JavaScript Controller Functionality', () => {
    it('should pass node syntax compilation check without errors', () => {
      const jsPath = path.join(__dirname, '..', 'assets', 'js', 'project-modal.js');
      const output = execSync(`node -c "${jsPath}"`, { encoding: 'utf8' });
      assert.strictEqual(output.trim(), '');
    });

    it('should export required public functions on window', () => {
      const { sandbox } = createDOMSandbox(projects);
      const expectedExports = [
        'openProjectModal',
        'closeProjectModal',
        'setProjectImage',
        'openLightbox',
        'closeLightbox',
        'nextProject',
        'prevProject'
      ];
      expectedExports.forEach(fnName => {
        assert.strictEqual(typeof sandbox.window[fnName], 'function', `window.${fnName} must be a function`);
      });
    });

    it('should open modal for all 4 projects and accurately populate all fields', () => {
      const { doc, sandbox } = createDOMSandbox(projects);

      projects.forEach((proj, idx) => {
        sandbox.window.openProjectModal(proj.id);

        assert.ok(doc.getElementById('project-modal').classList.contains('is-active'));
        assert.ok(doc.getElementById('project-modal-backdrop').classList.contains('is-active'));
        assert.ok(doc.body.classList.contains('modal-open'));
        assert.strictEqual(doc.getElementById('project-modal-backdrop').getAttribute('aria-hidden'), 'false');

        // Text assertions
        assert.strictEqual(doc.getElementById('modal-project-title').textContent, proj.title);
        assert.strictEqual(doc.getElementById('modal-project-category').textContent, proj.category);
        assert.strictEqual(doc.getElementById('modal-project-year').textContent, proj.year);
        assert.strictEqual(doc.getElementById('modal-project-role').textContent, proj.role);
        assert.strictEqual(doc.getElementById('modal-project-summary').textContent, proj.summary);
        assert.strictEqual(doc.getElementById('modal-nav-indicator').textContent, `${idx + 1} / ${projects.length}`);

        // Highlights list
        const highlightsList = doc.getElementById('modal-highlights-list');
        assert.strictEqual(highlightsList.children.length, proj.highlights.length);

        // Skills pills
        const pillsLang = doc.getElementById('modal-pills-languages');
        assert.strictEqual(pillsLang.children.length, proj.skills.languages.length);

        const pillsTech = doc.getElementById('modal-pills-technologies');
        assert.strictEqual(pillsTech.children.length, proj.skills.technologies.length);

        const pillsProt = doc.getElementById('modal-pills-protocols');
        assert.strictEqual(pillsProt.children.length, proj.skills.protocols.length);

        // Featured image loaded
        const featured = proj.images.find(img => img.featured) || proj.images[0];
        assert.strictEqual(doc.getElementById('modal-main-img').src, featured.src);

        // Close button receives focus
        assert.strictEqual(doc.activeElement, doc.getElementById('modal-close-btn'));
      });
    });

    it('should support switching images via setProjectImage and update thumbnails', () => {
      const { doc, sandbox } = createDOMSandbox(projects);
      const proj = projects.find(p => p.id === 'ml-dueling'); // Has 2 real-photo images
      sandbox.window.openProjectModal(proj.id);

      // Verify thumbnails count
      const thumbs = doc.getElementById('modal-thumbnails').children;
      assert.strictEqual(thumbs.length, 2, 'ml-dueling should render 2 thumbnails');

      // Featured image is wand_pcb_1.jpg (index 0)
      assert.strictEqual(doc.getElementById('modal-main-img').src, '/assets/images/wand_pcb_1.jpg');
      assert.ok(thumbs[0].classList.contains('is-active'));
      assert.strictEqual(thumbs[0].getAttribute('aria-selected'), 'true');

      // Switch to image 1 (wand_pcb_2.jpg)
      sandbox.window.setProjectImage(1);
      assert.strictEqual(doc.getElementById('modal-main-img').src, '/assets/images/wand_pcb_2.jpg');
      assert.ok(thumbs[1].classList.contains('is-active'));
      assert.strictEqual(thumbs[1].getAttribute('aria-selected'), 'true');
      assert.ok(!thumbs[0].classList.contains('is-active'));

      // Switch back to image 0 (wand_pcb_1.jpg)
      sandbox.window.setProjectImage(0);
      assert.strictEqual(doc.getElementById('modal-main-img').src, '/assets/images/wand_pcb_1.jpg');
      assert.ok(thumbs[0].classList.contains('is-active'));
      assert.strictEqual(thumbs[0].getAttribute('aria-selected'), 'true');
    });

    it('should perform cyclic nextProject and prevProject navigation', () => {
      const { doc, sandbox } = createDOMSandbox(projects);

      sandbox.window.openProjectModal(projects[0].id);
      assert.strictEqual(doc.getElementById('modal-nav-indicator').textContent, `1 / ${projects.length}`);

      // Cycle forward 1 -> 2 -> ... -> N -> 1
      for (let i = 1; i < projects.length; i++) {
        sandbox.window.nextProject();
        assert.strictEqual(doc.getElementById('modal-nav-indicator').textContent, `${i + 1} / ${projects.length}`);
        assert.strictEqual(doc.getElementById('modal-project-title').textContent, projects[i].title);
      }
      sandbox.window.nextProject(); // Wrap around
      assert.strictEqual(doc.getElementById('modal-nav-indicator').textContent, `1 / ${projects.length}`);

      // Cycle backward 1 -> N -> N-1 -> ... -> 1
      sandbox.window.prevProject(); // Wrap back to N
      assert.strictEqual(doc.getElementById('modal-nav-indicator').textContent, `${projects.length} / ${projects.length}`);
      sandbox.window.prevProject();
      assert.strictEqual(doc.getElementById('modal-nav-indicator').textContent, `${projects.length - 1} / ${projects.length}`);
    });


    it('should open and close lightbox and sync image', () => {
      const { doc, sandbox } = createDOMSandbox(projects);
      sandbox.window.openProjectModal('ml-dueling');
      sandbox.window.setProjectImage(1); // wand_pcb_2.jpg

      // Open lightbox
      sandbox.window.openLightbox();
      const lightbox = doc.getElementById('modal-lightbox');
      assert.ok(lightbox.classList.contains('is-active'));
      assert.strictEqual(lightbox.getAttribute('aria-hidden'), 'false');
      assert.strictEqual(doc.getElementById('lightbox-img').src, '/assets/images/wand_pcb_2.jpg');
      assert.strictEqual(doc.activeElement, doc.getElementById('lightbox-close-btn'));

      // Close lightbox
      sandbox.window.closeLightbox();
      assert.ok(!lightbox.classList.contains('is-active'));
      assert.strictEqual(lightbox.getAttribute('aria-hidden'), 'true');
      assert.strictEqual(doc.activeElement, doc.getElementById('modal-zoom-btn'));
    });

    it('should handle keyboard events: Escape, ArrowRight, ArrowLeft, and Tab trap', () => {
      const { doc, sandbox } = createDOMSandbox(projects);

      // Create a dummy trigger element in document body to simulate focus return
      const dummyTrigger = doc.createElement('div');
      dummyTrigger.setAttribute('data-project-trigger', 'ml-dueling');
      dummyTrigger.setAttribute('tabindex', '0');
      doc.body.appendChild(dummyTrigger);
      dummyTrigger.focus();

      // Enter key opens modal from focused trigger
      let enterEvt = {
        type: 'keydown',
        key: 'Enter',
        target: dummyTrigger,
        preventDefault: () => {}
      };
      doc.dispatchEvent(enterEvt);
      assert.ok(doc.getElementById('project-modal').classList.contains('is-active'));

      // ArrowRight advances image in ml-dueling (2 images, starts at featured index 0)
      let arrowRightEvt = {
        type: 'keydown',
        key: 'ArrowRight',
        shiftKey: false,
        target: doc.getElementById('modal-close-btn'),
        preventDefault: () => {}
      };
      doc.dispatchEvent(arrowRightEvt);
      assert.strictEqual(doc.getElementById('modal-main-img').src, '/assets/images/wand_pcb_2.jpg');

      // ArrowLeft retreats image
      let arrowLeftEvt = {
        type: 'keydown',
        key: 'ArrowLeft',
        shiftKey: false,
        target: doc.getElementById('modal-close-btn'),
        preventDefault: () => {}
      };
      doc.dispatchEvent(arrowLeftEvt);
      assert.strictEqual(doc.getElementById('modal-main-img').src, '/assets/images/wand_pcb_1.jpg');

      // Shift+ArrowRight advances project (ml-dueling is last, wraps to first)
      let shiftRightEvt = {
        type: 'keydown',
        key: 'ArrowRight',
        shiftKey: true,
        target: doc.getElementById('modal-close-btn'),
        preventDefault: () => {}
      };
      doc.dispatchEvent(shiftRightEvt);
      assert.strictEqual(doc.getElementById('modal-project-title').textContent, 'ROV HIL Testbench & Control Board');

      // Open Lightbox, then Escape closes lightbox without closing modal
      sandbox.window.openLightbox();
      assert.ok(doc.getElementById('modal-lightbox').classList.contains('is-active'));

      let escEvt = {
        type: 'keydown',
        key: 'Escape',
        target: doc.getElementById('lightbox-close-btn'),
        preventDefault: () => {}
      };
      doc.dispatchEvent(escEvt);
      assert.ok(!doc.getElementById('modal-lightbox').classList.contains('is-active'));
      assert.ok(doc.getElementById('project-modal').classList.contains('is-active'));

      // Second Escape closes modal
      doc.dispatchEvent(escEvt);
      assert.ok(!doc.getElementById('project-modal').classList.contains('is-active'));
      assert.ok(!doc.body.classList.contains('modal-open'));

      // Tab trap test:
      sandbox.window.openProjectModal('rov-hil-testbench');
      const focusables = doc.getElementById('project-modal').querySelectorAll('button:not([disabled]), [href]');
      assert.ok(focusables.length >= 2, 'Modal should contain multiple focusable elements');

      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      // Tab forward on last element -> loops to first
      lastEl.focus();
      let tabEvt = {
        type: 'keydown',
        key: 'Tab',
        shiftKey: false,
        target: lastEl,
        preventDefault: () => {}
      };
      doc.dispatchEvent(tabEvt);
      assert.strictEqual(doc.activeElement, firstEl);

      // Shift+Tab backward on first element -> loops to last
      firstEl.focus();
      let shiftTabEvt = {
        type: 'keydown',
        key: 'Tab',
        shiftKey: true,
        target: firstEl,
        preventDefault: () => {}
      };
      doc.dispatchEvent(shiftTabEvt);
      assert.strictEqual(doc.activeElement, lastEl);
    });
  });

  // =========================================================================
  // 4. SCSS & CSS Stylesheet Verification
  // =========================================================================
  describe('4. SCSS Compilation & Theme Support', () => {
    let compiledCss = '';

    before(() => {
      const scssRaw = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'style.scss'), 'utf8');
      const scssClean = scssRaw.replace(/^---[\s\S]*?---\r?\n/, '');
      compiledCss = execSync('npx --yes sass --stdin --no-source-map', {
        input: scssClean,
        encoding: 'utf8',
        cwd: path.join(__dirname, '..')
      });
    });

    it('should compile assets/css/style.scss cleanly with non-zero output', () => {
      assert.ok(compiledCss.length > 20000, `Compiled CSS length too short: ${compiledCss.length}`);
    });

    it('should define root light theme tokens', () => {
      assert.ok(compiledCss.includes(':root'), 'Missing :root CSS rule');
      assert.ok(compiledCss.includes('--bg-primary: #ffffff'), 'Missing light mode --bg-primary');
      assert.ok(compiledCss.includes('--text-primary: #0f172a'), 'Missing light mode --text-primary');
      assert.ok(compiledCss.includes('--accent: #1e3a8a'), 'Missing light mode --accent');
    });

    it('should define dark theme overrides for [data-theme="dark"]', () => {
      const hasDarkSelector = compiledCss.includes('[data-theme=dark]') || compiledCss.includes('[data-theme="dark"]');
      assert.ok(hasDarkSelector, 'Missing [data-theme="dark"] rule');
      assert.ok(compiledCss.includes('--bg-primary: #0f172a'), 'Missing dark mode --bg-primary');
      assert.ok(compiledCss.includes('--text-primary: #f8fafc'), 'Missing dark mode --text-primary');
      assert.ok(compiledCss.includes('--accent: #38bdf8'), 'Missing dark mode --accent');
    });

    it('should contain all required modal and terminal card classes', () => {
      const requiredSelectors = [
        '.project-modal',
        '.project-modal-backdrop',
        '.modal-gallery',
        '.modal-thumbnails',
        '.modal-thumb',
        '.modal-lightbox',
        '.termbar',
        '.project-card',
        '.skills-cluster'
      ];
      requiredSelectors.forEach(sel => {
        assert.ok(compiledCss.includes(sel), `Missing selector in compiled CSS: ${sel}`);
      });
    });
  });

  // =========================================================================
  // 5. PDF Portfolio & Markdown Retainment Verification
  // =========================================================================
  describe('5. Print Portfolio & Project Markdown Reports', () => {
    it('should maintain print-portfolio.html with valid permalink and printable filter', () => {
      const htmlPath = path.join(__dirname, '..', 'print-portfolio.html');
      assert.ok(fs.existsSync(htmlPath), 'print-portfolio.html missing');

      const content = fs.readFileSync(htmlPath, 'utf8');
      assert.ok(content.includes('permalink: /print-portfolio/'), 'print-portfolio.html missing permalink');
      assert.ok(content.includes('layout: default'), 'print-portfolio.html missing layout');
      assert.ok(
        content.includes('site.pages | where: "printable", true') || content.includes('printable: true'),
        'print-portfolio.html must query printable pages'
      );
      assert.ok(content.includes('pdf-builder-panel'), 'print-portfolio.html missing control panel');
      assert.ok(content.includes('window.print()'), 'print-portfolio.html missing print trigger');
    });

    it('should verify all 3 project markdown reports are intact with correct frontmatter', () => {
      const expectedFiles = [
        { file: 'rov-hil-testbench.md', permalink: '/projects/rov-hil-testbench/', order: 1 },
        { file: 'rov-buoyancy-float.md', permalink: '/projects/rov-buoyancy-float/', order: 2 },
        { file: 'ml-dueling.md', permalink: '/projects/ml-dueling/', order: 3 }
      ];

      expectedFiles.forEach(({ file, permalink, order }) => {
        const filePath = path.join(__dirname, '..', file);
        assert.ok(fs.existsSync(filePath), `Markdown report missing: ${file}`);

        const content = fs.readFileSync(filePath, 'utf8');
        assert.ok(content.includes('layout: default'), `${file} missing layout: default`);
        assert.ok(content.includes(`permalink: ${permalink}`), `${file} missing permalink: ${permalink}`);
        assert.ok(content.includes('printable: true'), `${file} missing printable: true`);
        assert.ok(content.includes(`order: ${order}`), `${file} missing order: ${order}`);
        assert.ok(content.includes('role:'), `${file} missing role`);
        assert.ok(content.includes('technologies:'), `${file} missing technologies`);
        assert.ok(content.includes('image:'), `${file} missing image`);
        assert.ok(content.length > 2500, `${file} content body appears truncated (${content.length} chars)`);
      });
    });
  });
});
