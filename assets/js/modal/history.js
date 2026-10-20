/**
 * Shareable project-modal hash helpers.
 */

const PREFIX = '#project-';

export function projectIdFromHash(win) {
  if (!win || !win.location || typeof win.location.hash !== 'string') return null;
  if (!win.location.hash.startsWith(PREFIX)) return null;

  try {
    return decodeURIComponent(win.location.hash.slice(PREFIX.length)) || null;
  } catch {
    return null;
  }
}

export function updateProjectHash(win, projectId) {
  if (!win || !win.history || !win.location || typeof win.history.replaceState !== 'function') {
    return;
  }

  const base = win.location.pathname + win.location.search;
  const next = projectId ? `${base}${PREFIX}${encodeURIComponent(projectId)}` : base;
  const current = win.location.pathname + win.location.search + win.location.hash;

  if (next !== current) {
    win.history.replaceState(null, '', next);
  }
}
