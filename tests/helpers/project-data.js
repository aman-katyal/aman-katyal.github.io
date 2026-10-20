/**
 * Shared project-data and repository path helpers for the test suite.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..', '..');

/**
 * Loads every per-project YAML record, sorted by its explicit display order.
 */
function loadProjectFiles() {
  const directory = path.join(ROOT, '_data', 'projects');
  return fs.readdirSync(directory)
    .filter((file) => /\.ya?ml$/.test(file))
    .map((file) => ({
      file,
      project: yaml.load(fs.readFileSync(path.join(directory, file), 'utf8'))
    }))
    .sort((a, b) => a.project.order - b.project.order);
}

/**
 * Loads the project showcase data without requiring Python.
 */
function loadProjects() {
  return loadProjectFiles().map(({ project }) => project);
}

/**
 * Reads a repository-relative text file.
 */
function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

/**
 * Concatenates the homepage and its extracted includes so tests can assert on
 * rendered structure without depending on one physical file.
 */
function readHome() {
  return [
    'index.md',
    '_includes/home/hero.html',
    '_includes/home/education.html',
    '_includes/home/skills.html',
    '_includes/home/experience.html',
    '_includes/home/projects.html',
    '_includes/home/project-card.html'
  ].map(readRepoFile).join('\n');
}

/**
 * Concatenates the layout and its extracted includes/scripts so tests can
 * assert on rendered structure without depending on one physical file.
 */
function readLayout() {
  return [
    '_layouts/default.html',
    '_includes/head.html',
    '_includes/nav.html',
    '_includes/footer.html',
    '_includes/project-detail.html',
    '_includes/scripts.html',
    'assets/js/theme.js',
    'assets/js/site.js'
  ].map(readRepoFile).join('\n');
}

/**
 * Resolves one or more repository-relative path segments.
 */
function repoPath(...segments) {
  return path.join(ROOT, ...segments);
}

module.exports = {
  ROOT,
  loadProjectFiles,
  loadProjects,
  readHome,
  readLayout,
  readRepoFile,
  repoPath
};
