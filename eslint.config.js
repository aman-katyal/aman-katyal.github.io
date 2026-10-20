'use strict';

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      '_site/**',
      'node_modules/**',
      'assets/images/**',
      'assets/**/*.pdf',
      'package-lock.json'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest'
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  {
    files: ['assets/js/**/*.js'],
    ignores: ['assets/js/project-modal.js', 'assets/js/modal/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser,
        renderMathInElement: 'readonly'
      }
    }
  },
  {
    files: ['assets/js/project-modal.js', 'assets/js/modal/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['eslint.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    }
  }
];
