/**
 * Project modal controller behavior: rendering, gallery, navigation, and lightbox.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('child_process');
const { loadProjects, repoPath } = require('./helpers/project-data');
const { createDOMSandbox } = require('./helpers/mock-dom');

const projects = loadProjects();

describe('Project modal controller', () => {
  it('should pass a Node syntax compilation check for every module', async () => {
    ['state.js', 'dom.js', 'focus.js', 'gallery.js', 'render.js', 'lightbox.js', 'keyboard.js', 'triggers.js', 'index.js'].forEach((file) => {
      const output = execSync(`node -c "${repoPath('assets', 'js', 'modal', file)}"`, { encoding: 'utf8' });
      assert.strictEqual(output.trim(), '');
    });
  });

  it('should expose only the documented controller API', async () => {
    const { sandbox } = await createDOMSandbox(projects);
    [
      'openProjectModal',
      'closeProjectModal',
      'setProjectImage',
      'openLightbox',
      'closeLightbox',
      'nextProject',
      'prevProject'
    ].forEach((functionName) => {
      assert.strictEqual(typeof sandbox.window[functionName], 'function', `api.${functionName} must be a function`);
    });
  });

  it('should open every project and populate all fields', async () => {
    const { doc, sandbox } = await createDOMSandbox(projects);

    projects.forEach((project, index) => {
      sandbox.window.openProjectModal(project.id);

      assert.ok(doc.getElementById('project-modal').classList.contains('is-active'));
      assert.ok(doc.getElementById('project-modal-backdrop').classList.contains('is-active'));
      assert.ok(doc.body.classList.contains('modal-open'));
      assert.strictEqual(doc.getElementById('project-modal-backdrop').getAttribute('aria-hidden'), 'false');

      assert.strictEqual(doc.getElementById('modal-project-title').textContent, project.title);
      assert.strictEqual(doc.getElementById('modal-project-category').textContent, project.category);
      assert.strictEqual(doc.getElementById('modal-project-year').textContent, project.year);
      assert.strictEqual(doc.getElementById('modal-project-role').textContent, project.role);
      assert.strictEqual(doc.getElementById('modal-project-summary').textContent, project.summary);
      assert.strictEqual(doc.getElementById('modal-nav-indicator').textContent, `${index + 1} / ${projects.length}`);

      assert.strictEqual(doc.getElementById('modal-highlights-list').children.length, project.highlights.length);
      assert.strictEqual(doc.getElementById('modal-pills-languages').children.length, project.skills.languages.length);
      assert.strictEqual(doc.getElementById('modal-pills-technologies').children.length, project.skills.technologies.length);
      assert.strictEqual(doc.getElementById('modal-pills-protocols').children.length, project.skills.protocols.length);

      const featured = project.images.find((image) => image.featured) || project.images[0];
      assert.strictEqual(doc.getElementById('modal-main-img').src, featured.src);
      assert.strictEqual(doc.activeElement, doc.getElementById('modal-close-btn'));
    });
  });

  it('should switch images and update thumbnail state', async () => {
    const { doc, sandbox } = await createDOMSandbox(projects);
    const project = projects.find((entry) => entry.id === 'ml-dueling');
    sandbox.window.openProjectModal(project.id);

    const thumbnails = doc.getElementById('modal-thumbnails').children;
    assert.strictEqual(thumbnails.length, 2);
    assert.strictEqual(doc.getElementById('modal-main-img').src, '/assets/images/wand_pcb_1.jpg');
    assert.ok(thumbnails[0].classList.contains('is-active'));
    assert.strictEqual(thumbnails[0].getAttribute('aria-selected'), 'true');

    sandbox.window.setProjectImage(1);
    assert.strictEqual(doc.getElementById('modal-main-img').src, '/assets/images/wand_pcb_2.jpg');
    assert.ok(thumbnails[1].classList.contains('is-active'));
    assert.strictEqual(thumbnails[1].getAttribute('aria-selected'), 'true');
    assert.ok(!thumbnails[0].classList.contains('is-active'));

    sandbox.window.setProjectImage(0);
    assert.strictEqual(doc.getElementById('modal-main-img').src, '/assets/images/wand_pcb_1.jpg');
    assert.ok(thumbnails[0].classList.contains('is-active'));
  });

  it('should cycle projects in both directions', async () => {
    const { doc, sandbox } = await createDOMSandbox(projects);

    sandbox.window.openProjectModal(projects[0].id);
    assert.strictEqual(doc.getElementById('modal-nav-indicator').textContent, `1 / ${projects.length}`);

    for (let index = 1; index < projects.length; index++) {
      sandbox.window.nextProject();
      assert.strictEqual(doc.getElementById('modal-nav-indicator').textContent, `${index + 1} / ${projects.length}`);
      assert.strictEqual(doc.getElementById('modal-project-title').textContent, projects[index].title);
    }
    sandbox.window.nextProject();
    assert.strictEqual(doc.getElementById('modal-nav-indicator').textContent, `1 / ${projects.length}`);

    sandbox.window.prevProject();
    assert.strictEqual(doc.getElementById('modal-nav-indicator').textContent, `${projects.length} / ${projects.length}`);
    sandbox.window.prevProject();
    assert.strictEqual(doc.getElementById('modal-nav-indicator').textContent, `${projects.length - 1} / ${projects.length}`);
  });

  it('should open and close the lightbox while syncing the current image', async () => {
    const { doc, sandbox } = await createDOMSandbox(projects);
    sandbox.window.openProjectModal('ml-dueling');
    sandbox.window.setProjectImage(1);

    sandbox.window.openLightbox();
    const lightbox = doc.getElementById('modal-lightbox');
    assert.ok(lightbox.classList.contains('is-active'));
    assert.strictEqual(lightbox.getAttribute('aria-hidden'), 'false');
    assert.strictEqual(doc.getElementById('lightbox-img').src, '/assets/images/wand_pcb_2.jpg');
    assert.strictEqual(doc.activeElement, doc.getElementById('lightbox-close-btn'));
    assert.strictEqual(doc.getElementById('project-modal').getAttribute('inert'), '');

    sandbox.window.closeLightbox();
    assert.ok(!lightbox.classList.contains('is-active'));
    assert.strictEqual(lightbox.getAttribute('aria-hidden'), 'true');
    assert.strictEqual(doc.getElementById('project-modal').getAttribute('inert'), null);
    assert.strictEqual(doc.activeElement, doc.getElementById('modal-zoom-btn'));
  });
});
