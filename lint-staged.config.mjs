// ═══════════════════════════════════════════════════════════
// lint-staged.config.mjs — Checks antes de cada commit
// Bitácora Cósmica · La luna como lugar de encuentro
// ═══════════════════════════════════════════════════════════

/** @type {import('lint-staged').Config} */
export default {
  // Archivos JavaScript: lint + format
  '**/*.js': [
    'eslint --fix --max-warnings=0',
    'prettier --write',
  ],

  // Archivos JSON: solo format
  '**/*.json': [
    'prettier --write',
  ],

  // Archivos CSS y HTML: solo format
  '**/*.{css,html}': [
    'prettier --write',
  ],

  // Archivos Markdown: solo format
  '**/*.md': [
    'prettier --write',
  ],
};
