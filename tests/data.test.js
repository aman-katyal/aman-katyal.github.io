/**
 * Project data model, schema, and metadata consistency tests.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { loadProjects, readRepoFile, repoPath } = require('./helpers/project-data');

const projects = loadProjects();

describe('Project data model', () => {
  it('should contain all project entries and required IDs', () => {
    assert.strictEqual(projects.length, 4, `Expected 4 projects, found ${projects.length}`);
    assert.deepStrictEqual(
      projects.map((project) => project.id),
      ['rov-hil-testbench', 'rov-buoyancy-float', 'posture-pet', 'ml-dueling']
    );
  });

  it('should satisfy the strict schema for every project', () => {
    projects.forEach((project) => {
      assert.ok(typeof project.id === 'string' && project.id.length > 0, `Project ${project.id} missing id`);
      assert.ok(typeof project.title === 'string' && project.title.length > 0, `Project ${project.id} missing title`);
      assert.ok(typeof project.subtitle === 'string' && project.subtitle.length > 0, `Project ${project.id} missing subtitle`);
      assert.ok(typeof project.category === 'string' && project.category.length > 0, `Project ${project.id} missing category`);
      assert.ok(typeof project.badge_type === 'string' && project.badge_type.length > 0, `Project ${project.id} missing badge_type`);
      assert.ok(typeof project.role === 'string' && project.role.length > 0, `Project ${project.id} missing role`);
      assert.ok(typeof project.year === 'string' && project.year.length > 0, `Project ${project.id} missing year`);
      assert.ok(typeof project.github === 'string' && project.github.startsWith('http'), `Project ${project.id} invalid github URL`);
      assert.ok(typeof project.live === 'string', `Project ${project.id} missing live string`);
      assert.ok(typeof project.summary === 'string' && project.summary.length >= 20, `Project ${project.id} summary too short`);

      assert.ok(Array.isArray(project.highlights) && project.highlights.length >= 3, `Project ${project.id} highlights must have >= 3 items`);
      project.highlights.forEach((highlight, index) => {
        assert.ok(typeof highlight === 'string' && highlight.trim().length > 10, `Project ${project.id} highlight #${index} too short`);
      });

      assert.ok(project.skills && typeof project.skills === 'object', `Project ${project.id} missing skills object`);
      assert.ok(Array.isArray(project.skills.languages) && project.skills.languages.length > 0, `Project ${project.id} missing languages`);
      assert.ok(Array.isArray(project.skills.technologies) && project.skills.technologies.length > 0, `Project ${project.id} missing technologies`);
      assert.ok(Array.isArray(project.skills.protocols) && project.skills.protocols.length > 0, `Project ${project.id} missing protocols`);

      assert.ok(Array.isArray(project.images) && project.images.length >= 1, `Project ${project.id} images array empty`);
      assert.strictEqual(project.images.filter((image) => image.featured === true).length, 1, `Project ${project.id} must have exactly 1 featured image`);
      project.images.forEach((image, index) => {
        assert.ok(typeof image.src === 'string' && image.src.startsWith('/assets/images/'), `Project ${project.id} image ${index} invalid src: ${image.src}`);
        assert.ok(typeof image.label === 'string' && image.label.length > 0, `Project ${project.id} image ${index} missing label`);
      });
    });
  });

  it('should verify every referenced image exists with a positive byte size', () => {
    projects.forEach((project) => {
      project.images.forEach((image) => {
        const relativeDiskPath = image.src.replace(/^\//, '');
        const absolutePath = repoPath(relativeDiskPath);
        assert.ok(fs.existsSync(absolutePath), `Image file missing on disk: ${relativeDiskPath} for project ${project.id}`);
        assert.ok(fs.statSync(absolutePath).size > 1000, `Image file suspiciously small: ${relativeDiskPath}`);
      });
    });
  });

  it('should keep the wand photos web-sized and valid JPEGs', () => {
    const mlProject = projects.find((project) => project.id === 'ml-dueling');
    assert.ok(mlProject, 'ml-dueling project not found');
    const imageSrcs = mlProject.images.map((image) => image.src);
    assert.ok(imageSrcs.includes('/assets/images/wand_pcb_1.jpg'), 'missing wand_pcb_1.jpg');
    assert.ok(imageSrcs.includes('/assets/images/wand_pcb_2.jpg'), 'missing wand_pcb_2.jpg');

    ['wand_pcb_1.jpg', 'wand_pcb_2.jpg'].forEach((file) => {
      const absolutePath = repoPath('assets', 'images', file);
      assert.ok(fs.existsSync(absolutePath), `${file} does not exist`);
      assert.ok(fs.statSync(absolutePath).size > 150000, `${file} is suspiciously small`);
      const buffer = fs.readFileSync(absolutePath);
      assert.deepStrictEqual([buffer[0], buffer[1], buffer[2]], [0xFF, 0xD8, 0xFF], `${file} is not a JPEG`);
    });
  });

  it('should reconcile years, ML title, and FreeRTOS metadata', () => {
    const buoyancy = projects.find((project) => project.id === 'rov-buoyancy-float');
    const wand = projects.find((project) => project.id === 'ml-dueling');
    const mlPage = readRepoFile('ml-dueling.md');

    assert.strictEqual(buoyancy.year, '2026', 'Buoyancy year must match the 2026 resume timeline');
    assert.strictEqual(wand.year, '2025', 'Wand year must match the 2025 resume timeline');
    assert.strictEqual(wand.title, 'ML Gesture Dueling System', 'Data and page must share one ML project name');
    assert.ok(mlPage.includes('title: "ML Gesture Dueling System"'), 'Case study title must match the project data');
    assert.ok(!wand.skills.technologies.includes('FreeRTOS'), 'ML metadata still claims unused FreeRTOS');
    assert.ok(!mlPage.includes('FreeRTOS'), 'ML case study still claims unused FreeRTOS');
    projects.forEach((project) => {
      assert.ok(!project.year.includes(' - '), `${project.id} uses a non-standard year range`);
    });
  });

  it('should label the external Posture Pet destination correctly', () => {
    const posturePet = projects.find((project) => project.id === 'posture-pet');
    const home = readRepoFile('index.md');

    assert.strictEqual(posturePet.live_label, 'Devpost');
    assert.strictEqual(posturePet.live_external, true);
    assert.ok(home.includes('project.live_label'), 'Home card does not use the project link label');
    assert.ok(home.includes('project.live_external'), 'Home card does not mark external links');
  });
});
