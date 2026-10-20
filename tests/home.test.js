/**
 * Homepage composition: thin index, includes, and single-source data.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const yaml = require('js-yaml');
const { readHome, readRepoFile, repoPath } = require('./helpers/project-data');

describe('Homepage composition', () => {
  it('should keep index.md as front matter plus section includes', () => {
    const index = readRepoFile('index.md');
    const lineCount = index.split('\n').length;

    assert.ok(lineCount < 30, `index.md is ${lineCount} lines; expected <30`);
    ['home/hero.html', 'home/skills.html', 'home/experience.html', 'home/projects.html'].forEach(
      (include) => {
        assert.ok(index.includes(`include ${include}`), `index.md does not include ${include}`);
      }
    );
    assert.ok(!index.includes('<div class="hero-grid">'), 'Hero markup still lives in index.md');
    assert.ok(
      !index.includes('<div class="exp-section"'),
      'Experience markup still lives in index.md'
    );
    assert.ok(
      !index.includes('<article class="project-card"'),
      'Project card markup still lives in index.md'
    );
  });

  it('should ship the homepage includes and keep project cards reusable', () => {
    [
      '_includes/home/hero.html',
      '_includes/home/education.html',
      '_includes/home/skills.html',
      '_includes/home/experience.html',
      '_includes/home/projects.html',
      '_includes/home/project-card.html'
    ].forEach((file) => {
      assert.ok(fs.existsSync(repoPath(file)), `${file} is missing`);
    });

    const projects = readRepoFile('_includes/home/projects.html');
    const card = readRepoFile('_includes/home/project-card.html');
    assert.ok(
      projects.includes('include home/project-card.html project=project'),
      'Projects section does not reuse the card include'
    );
    assert.ok(
      card.includes('{% assign project = include.project %}'),
      'Card include does not receive a project'
    );
    assert.ok(
      card.includes('data-project-trigger="{{ project.id }}"'),
      'Card lost its modal trigger'
    );
  });

  it('should keep skills and experience headings in a valid hierarchy', () => {
    const home = readHome();

    assert.ok(home.includes('<h2 class="skills-eyebrow">Skills</h2>'), 'Skills section has no h2');
    assert.ok(
      home.includes('<h2 class="skills-eyebrow">Experience</h2>'),
      'Experience section has no h2'
    );
    assert.ok(
      home.includes('<h2 class="section-title">Featured Projects</h2>'),
      'Projects section has no h2'
    );
    assert.ok(home.includes('<h3>languages</h3>'), 'Skills columns lost their h3 headings');
    assert.ok(
      home.indexOf('<h2 class="skills-eyebrow">Skills</h2>') < home.indexOf('<h3>languages</h3>'),
      'Skills h3 precedes its h2'
    );
    assert.ok(
      !home.includes('<span class="skills-eyebrow">'),
      'Section title is still a non-semantic span'
    );
  });

  it('should keep education and experience in one data source', () => {
    const education = yaml.load(readRepoFile('_data/education.yml'));
    const experience = yaml.load(readRepoFile('_data/experience.yml'));
    const index = readRepoFile('index.md');

    assert.strictEqual(education.school, 'Purdue University');
    assert.strictEqual(education.degrees.length, 2);
    assert.ok(education.coursework.length >= 3);
    assert.ok(education.honors.length >= 2);

    assert.strictEqual(experience.length, 3);
    experience.forEach((job) => {
      assert.ok(
        job.role && job.company && job.dates,
        'Experience entry is missing required fields'
      );
      assert.ok(
        Array.isArray(job.bullets) && job.bullets.length >= 2,
        'Experience entry is missing bullets'
      );
    });
    assert.ok(
      !index.includes('Hewlett Packard Enterprise'),
      'Experience copy is duplicated in index.md'
    );
    assert.ok(!index.includes('Purdue IEEE ROV Team'), 'Experience copy is duplicated in index.md');
  });
});
