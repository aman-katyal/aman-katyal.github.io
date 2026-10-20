/**
 * Asset pipeline contracts: optimized media, responsive markup, and video
 * accessibility.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const {
  loadProjectFiles,
  loadProjects,
  readRepoFile,
  repoPath
} = require('./helpers/project-data');

const IMAGE_DIR = repoPath('assets', 'images');
const CASE_STUDIES = ['rov-hil-testbench.md', 'rov-buoyancy-float.md'];
const MAX_WEBP_BYTES = 500 * 1024;

const thumbFor = (src) => src.replace(/\.(png|jpe?g|webp|svg)$/i, '-thumb.webp');
const exists = (repoRelativePath) => fs.existsSync(repoPath(repoRelativePath.replace(/^\//, '')));

describe('Asset pipeline', () => {
  it('should reference existing optimized media and generated thumbnails', () => {
    const images = loadProjectFiles().flatMap(({ project }) =>
      (project.images || []).map((image) => ({ ...image, project: project.id }))
    );

    images.forEach((image) => {
      assert.ok(exists(image.src), `${image.project}: missing ${image.src}`);

      if (image.type === 'video') {
        assert.ok(image.poster, `${image.project}: video needs a poster`);
        assert.ok(exists(image.poster), `${image.project}: missing poster ${image.poster}`);
        return;
      }

      assert.ok(
        exists(thumbFor(image.src)),
        `${image.project}: missing thumbnail for ${image.src}`
      );
    });
  });

  it('should keep every WebP under the 500KB budget', () => {
    fs.readdirSync(IMAGE_DIR)
      .filter((file) => file.endsWith('.webp'))
      .forEach((file) => {
        const bytes = fs.statSync(repoPath('assets', 'images', file)).size;
        assert.ok(bytes <= MAX_WEBP_BYTES, `${file} is ${Math.round(bytes / 1024)}KB`);
      });
  });

  it('should publish only the social preview as a legacy raster format', () => {
    const legacy = fs
      .readdirSync(IMAGE_DIR)
      .filter((file) => /\.(png|jpe?g)$/i.test(file))
      .sort();

    assert.deepStrictEqual(legacy, ['og-portfolio.jpg']);
  });

  it('should include dimensions, lazy loading, and responsive sources in case studies', () => {
    CASE_STUDIES.forEach((file) => {
      const html = readRepoFile(file);
      const images = html.match(/<img\b[^>]*>/g) || [];
      assert.ok(images.length >= 3, `${file} should contain its case-study images`);

      images.forEach((tag) => {
        assert.match(tag, /\bwidth="\d+"/, `${file}: image is missing width: ${tag}`);
        assert.match(tag, /\bheight="\d+"/, `${file}: image is missing height: ${tag}`);
        assert.match(tag, /\bloading="(lazy|eager)"/, `${file}: image is missing loading`);
        assert.match(tag, /\bdecoding="async"/, `${file}: image is missing decoding`);

        if (!/\.svg"/.test(tag)) {
          assert.match(tag, /\bsrcset="/, `${file}: raster image is missing srcset: ${tag}`);
        }
      });
    });
  });

  it('should use responsive sources on project cards', () => {
    const card = readRepoFile('_includes/home/project-card.html');

    assert.match(card, /srcset=/);
    assert.match(card, /sizes=/);
    assert.match(card, /decoding="async"/);
    assert.match(card, /replace: "\.webp", "-400\.webp"/);
    assert.match(card, /replace: "\.webp", "-800\.webp"/);
  });

  it('should lazy-load videos with posters and captions', () => {
    const modal = readRepoFile('_includes/project_modal.html');
    const gallery = readRepoFile('assets/js/modal/gallery.js');
    const captions = readRepoFile('assets/captions/posture_pet_demo.vtt');
    const video = loadProjects()
      .flatMap((project) => project.images || [])
      .find((image) => image.type === 'video');

    assert.ok(video, 'Expected a video project item');
    assert.ok(exists(video.poster), `Missing video poster ${video.poster}`);
    assert.match(gallery, /videoEl\.setAttribute\('poster', item\.poster\)/);
    assert.strictEqual((modal.match(/preload="none"/g) || []).length, 2);
    assert.strictEqual((modal.match(/kind="captions"/g) || []).length, 2);
    assert.match(modal, /posture_pet_demo\.vtt/);
    assert.match(captions, /^WEBVTT/);
    assert.match(captions, /00:00\.000 --> 00:04\.500/);
  });
});
