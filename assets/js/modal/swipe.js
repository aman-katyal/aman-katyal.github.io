/**
 * Horizontal touch/pen swipe handling for the gallery and lightbox.
 */

const IGNORE_SELECTOR = 'video, button, a, input, select, textarea, [contenteditable="true"]';
const SWIPE_DISTANCE = 40;
const CLICK_SUPPRESSION_MS = 500;

export function bindSwipe(element, handlers = {}) {
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let suppressUntil = 0;

  const ignored = (target) => {
    return !!(target && typeof target.closest === 'function' && target.closest(IGNORE_SELECTOR));
  };

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' || ignored(event.target)) return;
    tracking = true;
    startX = event.clientX;
    startY = event.clientY;
  };

  const onPointerUp = (event) => {
    if (!tracking) return;
    tracking = false;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) <= Math.abs(dy) * 1.2) return;

    suppressUntil = Date.now() + CLICK_SUPPRESSION_MS;
    if (dx < 0) {
      handlers.onSwipeLeft?.();
    } else {
      handlers.onSwipeRight?.();
    }
  };

  const onPointerCancel = () => {
    tracking = false;
  };

  if (element && typeof element.addEventListener === 'function') {
    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerCancel);
  }

  return {
    consumeSuppression() {
      if (Date.now() >= suppressUntil) return false;
      suppressUntil = 0;
      return true;
    },
    destroy() {
      if (!element || typeof element.removeEventListener !== 'function') return;
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerCancel);
    }
  };
}
