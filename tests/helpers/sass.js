/**
 * Compiles the Jekyll SCSS entry point without requiring the Jekyll toolchain.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ROOT } = require('./project-data');

function compileScss() {
  const entry = path.join(ROOT, 'assets', 'css', 'style.scss');
  const scssRaw = fs.readFileSync(entry, 'utf8');
  const scssClean = scssRaw.replace(/^---[\s\S]*?---\r?\n/, '');

  return execSync('npx --yes sass --stdin --no-source-map --load-path=_sass', {
    input: scssClean,
    encoding: 'utf8',
    cwd: ROOT
  });
}

module.exports = { compileScss };
