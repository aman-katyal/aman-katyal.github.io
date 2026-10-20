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
 * Resolves one or more repository-relative path segments.
 */
function repoPath(...segments) {
  return path.join(ROOT, ...segments);
}

module.exports = {
  ROOT,
  loadProjectFiles,
  loadProjects,
  readRepoFile,
  repoPath
};
