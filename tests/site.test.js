/**
 * Site-wide navigation, SEO metadata, discoverability, and static pages.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { readLayout, readRepoFile, repoPath } = require('./helpers/project-data');

describe('Site navigation and metadata', () => {
  it('should order nav links to match the homepage sections', () => {
    const layout = readLayout();
    const navMatch = layout.match(/<div class="nav-links">([\s\S]*?)<\/div>/);
    assert.ok(navMatch, 'Could not find the nav-links block');
    const navLinks = navMatch[1];
    assert.ok(navLinks.indexOf('#experience') < navLinks.indexOf('#projects'), 'Experience must appear before Projects');
  });

  it('should publish canonical, theme-color, and social metadata', () => {
    const layout = readLayout();
    const config = readRepoFile('_config.yml');

    assert.ok(layout.includes('rel="canonical"'), 'Layout is missing a canonical URL');
    assert.ok(layout.includes('property="og:site_name"'), 'Layout is missing og:site_name');
    assert.ok(layout.includes('name="theme-color"'), 'Layout is missing theme-color');
    assert.ok(layout.includes('{% if project_meta %}article{% else %}website{% endif %}'), 'OG type is not page-aware');
    assert.ok(config.includes('og_image: /assets/images/og-portfolio.jpg'), 'Default OG image is not configured');
    assert.ok(!config.includes('UVM Verification'), 'Stale UVM positioning remains in the description');
  });

  it('should ship sitemap, robots, 404, and optimized social assets', () => {
    ['sitemap.xml', 'robots.txt', '404.html', 'assets/images/og-portfolio.jpg'].forEach((file) => {
      assert.ok(fs.existsSync(repoPath(file)), `${file} is missing`);
    });
  });

  it('should link the PDF builder from the hero and footer', () => {
    const home = readRepoFile('index.md');
    const layout = readLayout();
    assert.ok(home.includes("'/print-portfolio/'"), 'Home hero does not link the PDF builder');
    assert.ok(layout.includes("'/print-portfolio/'"), 'Site footer does not link the PDF builder');
  });

  it('should resolve project page metadata from the project data', () => {
    const layout = readLayout();
    assert.ok(layout.includes('site.data.projects[project_slug]'), 'Layout does not look up project metadata');
    assert.ok(layout.includes('project_meta.title'), 'Layout does not use the data title');
    assert.ok(layout.includes('project_meta.role'), 'Layout does not use the data role');
    assert.ok(layout.includes('project_meta.skills.technologies'), 'Layout does not use data technologies');
    assert.ok(layout.includes('project_image.src'), 'Layout does not use the featured data image');
    assert.ok(layout.includes('<title>{{ project_meta.title | default: page.title'), 'Project data title must win over an inferred page title');
    assert.ok(layout.includes('<h1 class="project-title">{{ project_meta.title }}</h1>'), 'Project heading must use the data title');

    ['rov-hil-testbench.md', 'rov-buoyancy-float.md', 'ml-dueling.md'].forEach((file) => {
      const content = readRepoFile(file);
      ['title:', 'role:', 'technologies:', 'image:'].forEach((field) => {
        assert.ok(!content.includes(`\n${field}`), `${file} still duplicates ${field} in front matter`);
      });
    });
  });

  it('should cache-bust the hosted resume', () => {
    const home = readRepoFile('index.md');
    const config = readRepoFile('_config.yml');
    assert.ok(config.includes('resume_version:'), 'Resume URL is not cache-busted');
    assert.ok(home.includes('?v={{ site.resume_version }}'), 'Resume link does not use the version query');
  });
});
