/**
 * Shared project-data and repository path helpers for the test suite.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..', '..');

/**
 * Loads the project showcase data from YAML without requiring Python.
 */
function loadProjects() {
  return yaml.load(fs.readFileSync(path.join(ROOT, '_data', 'projects.yml'), 'utf8'));
}

/**
 * Reads a repository-relative text file.
 */
function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

/**
 * Resolves one or more repository-relative path segments.
 */
function repoPath(...segments) {
  return path.join(ROOT, ...segments);
}

module.exports = {
  ROOT,
  loadProjects,
  readRepoFile,
  repoPath
};
