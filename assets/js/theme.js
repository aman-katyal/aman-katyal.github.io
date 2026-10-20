/**
 * Theme toggle controller.
 * The critical first-paint theme decision stays inline in the document head.
 */

(function () {
  'use strict';

  function syncThemeToggleState() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isDark ? '#0f172a' : '#ffffff');
    }
  }

  function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    syncThemeToggleState();
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      syncThemeToggleState();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
})();
