/**
 * Lint and formatting configuration contracts.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readRepoFile } = require('./helpers/project-data');

describe('Lint and formatting checks', () => {
  it('should expose one lint entry point for CSS, JS, and formatting', () => {
    const packageJson = JSON.parse(readRepoFile('package.json'));
    const scripts = packageJson.scripts;

    assert.match(scripts.lint, /lint:css/);
    assert.match(scripts.lint, /lint:js/);
    assert.match(scripts.lint, /format:check/);
    assert.match(scripts['lint:js'], /eslint/);
    assert.match(scripts['format:check'], /prettier --check/);
  });

  it('should configure ESLint for browser modules and Node tests', () => {
    const config = readRepoFile('eslint.config.js');

    assert.ok(config.includes('assets/js/project-modal.js'), 'Modal entry is not linted');
    assert.ok(config.includes('assets/js/modal/**/*.js'), 'Modal modules are not linted');
    assert.ok(config.includes("files: ['tests/**/*.js']"), 'Tests are not linted');
    assert.ok(config.includes("sourceType: 'module'"), 'ES modules are not declared');
    assert.ok(config.includes("sourceType: 'commonjs'"), 'Node tests are not declared');
  });

  it('should configure Prettier for Liquid HTML, SCSS, and JS', () => {
    const config = JSON.parse(readRepoFile('.prettierrc.json'));
    const workflow = readRepoFile('.github/workflows/site.yml');
    const readme = readRepoFile('README.md');

    assert.deepEqual(config.plugins, ['@shopify/prettier-plugin-liquid']);
    assert.ok(
      config.overrides.some((override) => override.files === '*.html'),
      'Liquid HTML is not formatted'
    );
    assert.ok(
      config.overrides.some((override) => override.files === '*.scss'),
      'SCSS is not formatted'
    );
    assert.ok(workflow.includes('npm run lint'), 'CI does not block on lint errors');
    assert.ok(readme.includes('npm run lint'), 'README does not document the lint command');
    assert.ok(readme.includes('npm run format'), 'README does not document formatting');
  });
});
