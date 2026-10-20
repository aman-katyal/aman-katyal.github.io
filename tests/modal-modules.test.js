/**
 * Focused ES-module contracts for the project modal.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { readRepoFile, repoPath } = require('./helpers/project-data');
const { MockDocument, MockElement, createDOMSandbox } = require('./helpers/mock-dom');

const load = (name) => import(pathToFileURL(repoPath('assets', 'js', 'modal', name)).href);

describe('Project modal modules', () => {
  it('should keep every module under 150 lines', async () => {
    const files = fs
      .readdirSync(repoPath('assets', 'js', 'modal'))
      .filter((file) => file.endsWith('.js'));

    files.forEach((file) => {
      const lines = readRepoFile(`assets/js/modal/${file}`).split('\n').length;
      assert.ok(lines <= 150, `${file} is ${lines} lines; expected <=150`);
    });
  });

  it('should create independent state objects', async () => {
    const { createState } = await load('state.js');
    const first = createState([{ id: 'one' }, { id: 'two' }]);
    const second = createState([{ id: 'other' }]);

    first.currentProjectIndex = 1;

    assert.strictEqual(first.getCurrentProject().id, 'two');
    assert.strictEqual(second.getCurrentProject(), null);
    assert.strictEqual(second.projects.length, 1);
  });

  it('should manage inert backgrounds and focus containment', async () => {
    const { focusDialogControl, isWithin, setInert, setPageInert } = await load('focus.js');
    const doc = new MockDocument();
    const navbar = new MockElement('nav', '', 'navbar');
    const container = new MockElement('div', 'project-modal', 'project-modal');
    const target = new MockElement('button', 'focus-target');
    doc.body.appendChild(navbar);
    doc.body.appendChild(container);
    container.appendChild(target);

    setInert(navbar, true);
    assert.strictEqual(navbar.getAttribute('inert'), '');
    setInert(navbar, false);
    assert.strictEqual(navbar.getAttribute('inert'), null);

    setPageInert(doc, true);
    assert.strictEqual(navbar.getAttribute('inert'), '');
    setPageInert(doc, false);
    assert.strictEqual(navbar.getAttribute('inert'), null);

    assert.ok(isWithin(container, target));
    assert.ok(!isWithin(container, navbar));

    focusDialogControl(doc, container, target, () => true);
    assert.strictEqual(doc.activeElement, target);
  });

  it('should switch gallery media and wrap image navigation', async () => {
    const { setProjectImage, stepImage, isVideo } = await load('gallery.js');
    const els = {
      mainImgEl: new MockElement('img', 'modal-main-img'),
      mainVideoEl: new MockElement('video', 'modal-main-video'),
      imgCaptionEl: new MockElement('div', 'modal-img-caption'),
      thumbnailsEl: new MockElement('div', 'modal-thumbnails'),
      mediaCounterEl: new MockElement('div', 'modal-media-counter'),
      lightboxImgEl: new MockElement('img', 'lightbox-img'),
      lightboxVideoEl: new MockElement('video', 'lightbox-video'),
      lightboxCaptionEl: new MockElement('div', 'lightbox-caption'),
      lightboxCounterEl: new MockElement('div', 'lightbox-counter')
    };
    const state = (await load('state.js')).createState([
      {
        id: 'demo',
        title: 'Demo',
        images: [
          { src: '/one.jpg', label: 'One' },
          { src: '/two.jpg', label: 'Two', type: 'video' }
        ]
      }
    ]);
    state.currentProjectIndex = 0;

    assert.ok(isVideo({ type: 'video' }));
    assert.ok(!isVideo({ type: 'image' }));

    setProjectImage(els, state, 0);
    assert.strictEqual(state.currentImageIndex, 0);
    assert.strictEqual(els.mainImgEl.src, '/one.jpg');
    assert.strictEqual(els.mainImgEl.style.display, 'block');
    assert.strictEqual(els.mediaCounterEl.textContent, '1 / 2');
    assert.strictEqual(els.lightboxCounterEl.textContent, '1 / 2');

    setProjectImage(els, state, 1);
    assert.strictEqual(state.currentImageIndex, 1);
    assert.strictEqual(els.mainImgEl.style.display, 'none');
    assert.strictEqual(els.mainVideoEl.style.display, 'block');
    assert.strictEqual(els.mainVideoEl.getAttribute('src'), '/two.jpg');
    assert.strictEqual(els.mediaCounterEl.textContent, '2 / 2');
    assert.strictEqual(els.lightboxCounterEl.textContent, '2 / 2');

    stepImage(els, state, 1);
    assert.strictEqual(state.currentImageIndex, 0);
    stepImage(els, state, -1);
    assert.strictEqual(state.currentImageIndex, 1);
  });

  it('should handle horizontal swipes and suppress the follow-up click', async () => {
    const { bindSwipe } = await load('swipe.js');
    const element = new MockElement('div', '', 'gallery-swipe');
    const video = new MockElement('video', '', 'video');
    element.appendChild(video);
    let left = 0;
    let right = 0;
    const swipe = bindSwipe(element, {
      onSwipeLeft: () => (left += 1),
      onSwipeRight: () => (right += 1)
    });

    element.dispatchEvent({
      type: 'pointerdown',
      pointerType: 'touch',
      clientX: 120,
      clientY: 10,
      target: element
    });
    element.dispatchEvent({
      type: 'pointerup',
      pointerType: 'touch',
      clientX: 20,
      clientY: 12,
      target: element
    });

    assert.strictEqual(left, 1);
    assert.strictEqual(right, 0);
    assert.strictEqual(swipe.consumeSuppression(), true);
    assert.strictEqual(swipe.consumeSuppression(), false);

    element.dispatchEvent({
      type: 'pointerdown',
      pointerType: 'touch',
      clientX: 20,
      clientY: 10,
      target: element
    });
    element.dispatchEvent({
      type: 'pointerup',
      pointerType: 'touch',
      clientX: 130,
      clientY: 10,
      target: element
    });
    assert.strictEqual(right, 1);

    element.dispatchEvent({
      type: 'pointerdown',
      pointerType: 'touch',
      clientX: 120,
      clientY: 10,
      target: video
    });
    element.dispatchEvent({
      type: 'pointerup',
      pointerType: 'touch',
      clientX: 20,
      clientY: 10,
      target: video
    });
    assert.strictEqual(left, 1);
  });

  it('should read and write shareable project hashes', async () => {
    const { projectIdFromHash, updateProjectHash } = await load('history.js');
    const calls = [];
    const win = {
      location: { pathname: '/projects/', search: '?view=grid', hash: '' },
      history: {
        replaceState(_state, _title, url) {
          calls.push(url);
          const hashIndex = url.indexOf('#');
          win.location.hash = hashIndex === -1 ? '' : url.slice(hashIndex);
        }
      }
    };

    assert.strictEqual(projectIdFromHash(win), null);
    updateProjectHash(win, 'ml-dueling');
    assert.strictEqual(win.location.hash, '#project-ml-dueling');
    assert.strictEqual(projectIdFromHash(win), 'ml-dueling');
    assert.deepStrictEqual(calls, ['/projects/?view=grid#project-ml-dueling']);

    updateProjectHash(win, null);
    assert.strictEqual(win.location.hash, '');
    assert.deepStrictEqual(calls, [
      '/projects/?view=grid#project-ml-dueling',
      '/projects/?view=grid'
    ]);
    assert.strictEqual(projectIdFromHash({ location: { hash: '#project-bad%ZZ' } }), null);
  });

  it('should open a deep-linked project and clear the hash on close', async () => {
    const { loadProjects } = require('./helpers/project-data');
    const projects = loadProjects();
    const calls = [];
    const win = {
      location: { pathname: '/', search: '', hash: `#project-${projects[2].id}` },
      history: {
        replaceState(_state, _title, url) {
          calls.push(url);
          const hashIndex = url.indexOf('#');
          win.location.hash = hashIndex === -1 ? '' : url.slice(hashIndex);
        }
      }
    };
    const { doc, api } = await createDOMSandbox(projects, win);

    assert.ok(doc.getElementById('project-modal').classList.contains('is-active'));
    assert.strictEqual(doc.getElementById('modal-project-title').textContent, projects[2].title);

    api.closeProjectModal();
    assert.strictEqual(win.location.hash, '');
    assert.strictEqual(calls.at(-1), '/');
  });

  it('should ship swipe, counter, and shortcut affordances', () => {
    const modal = readRepoFile('_includes/project_modal.html');
    const entry = readRepoFile('assets/js/project-modal.js');

    assert.ok(modal.includes('id="modal-media-counter"'), 'Gallery media counter is missing');
    assert.ok(modal.includes('id="lightbox-counter"'), 'Lightbox media counter is missing');
    assert.ok(modal.includes('class="modal-shortcuts"'), 'Shortcut hints are missing');
    assert.ok(modal.includes('id="modal-footer-center"') || modal.includes('modal-footer-center'));
    assert.ok(entry.includes('createModalController(document, window)'), 'Window is not passed');
  });

  it('should open and close the lightbox with focus restoration', async () => {
    const { openLightbox, closeLightbox } = await load('lightbox.js');
    const { createState } = await load('state.js');
    const doc = new MockDocument();
    const modal = new MockElement('div', 'project-modal', 'project-modal is-active');
    const lightbox = new MockElement('div', 'modal-lightbox', 'modal-lightbox');
    const closeBtn = new MockElement('button', 'lightbox-close-btn');
    const zoomBtn = new MockElement('button', 'modal-zoom-btn');
    const img = new MockElement('img', 'lightbox-img');
    const video = new MockElement('video', 'lightbox-video');
    const caption = new MockElement('div', 'lightbox-caption');
    doc.body.appendChild(modal);
    doc.body.appendChild(zoomBtn);
    doc.body.appendChild(lightbox);
    lightbox.appendChild(closeBtn);
    lightbox.appendChild(img);
    lightbox.appendChild(video);
    lightbox.appendChild(caption);

    const state = createState([
      { id: 'demo', title: 'Demo', images: [{ src: '/one.jpg', label: 'One' }] }
    ]);
    state.currentProjectIndex = 0;

    openLightbox(
      doc,
      {
        modalEl: modal,
        lightboxEl: lightbox,
        lightboxCloseBtnEl: closeBtn,
        lightboxImgEl: img,
        lightboxVideoEl: video,
        lightboxCaptionEl: caption,
        zoomBtnEl: zoomBtn
      },
      state
    );

    assert.ok(lightbox.classList.contains('is-active'));
    assert.strictEqual(lightbox.getAttribute('aria-hidden'), 'false');
    assert.strictEqual(modal.getAttribute('inert'), '');
    assert.strictEqual(doc.activeElement, closeBtn);

    closeLightbox(
      {
        modalEl: modal,
        lightboxEl: lightbox,
        lightboxImgEl: img,
        lightboxVideoEl: video,
        lightboxCaptionEl: caption,
        zoomBtnEl: zoomBtn
      },
      state
    );

    assert.ok(!lightbox.classList.contains('is-active'));
    assert.strictEqual(lightbox.getAttribute('aria-hidden'), 'true');
    assert.strictEqual(modal.getAttribute('inert'), null);
    assert.strictEqual(doc.activeElement, zoomBtn);
  });

  it('should expose one documented API and keep a no-JS card fallback', () => {
    const entry = readRepoFile('assets/js/project-modal.js');
    const card = readRepoFile('_includes/home/project-card.html');
    const scripts = readRepoFile('_includes/scripts.html');

    assert.ok(
      entry.includes("from './modal/index.js'"),
      'Entry point does not import the module controller'
    );
    assert.ok(
      entry.includes('window.PortfolioModal = controller.api'),
      'Entry point does not expose the documented API'
    );
    assert.ok(
      scripts.includes(
        'type="module" defer src="{{ \'/assets/js/project-modal.js\' | relative_url }}"'
      ),
      'Script tag is not a deferred ES module'
    );
    assert.ok(!entry.includes('window.openProjectModal'), 'Legacy global API still leaks');
    assert.ok(
      /href="\{\{ project\.live \| relative_url \}\}"/.test(card),
      'Preview action is not a no-JS link'
    );
    assert.ok(
      card.includes('data-project-trigger="{{ project.id }}"'),
      'Preview link lost its modal trigger'
    );
    assert.ok(
      !card.includes('<button type="button" class="card-btn card-btn-primary"'),
      'Preview action is still a JS-only button'
    );
  });

  it('should keep lightbox focus when a modal focus retry is pending', async () => {
    const { loadProjects } = require('./helpers/project-data');
    const projects = loadProjects();
    const { doc, api } = await createDOMSandbox(projects);

    api.openProjectModal(projects[0].id);
    api.openLightbox();
    await new Promise((resolve) => setTimeout(resolve, 350));

    assert.strictEqual(doc.activeElement.id, 'lightbox-close-btn');

    api.closeLightbox();
    api.closeProjectModal();
  });

  it('should not share open state between controller instances', async () => {
    const { createModalController } = await load('index.js');
    const projects = require('./helpers/project-data').loadProjects();
    const first = await createDOMSandbox(projects);
    const second = await createDOMSandbox(projects);

    first.api.openProjectModal(projects[0].id);

    assert.ok(first.doc.getElementById('project-modal').classList.contains('is-active'));
    assert.ok(!second.doc.getElementById('project-modal').classList.contains('is-active'));
    assert.ok(typeof createModalController === 'function');
  });
});
