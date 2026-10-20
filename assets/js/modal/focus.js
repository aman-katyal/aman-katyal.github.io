/**
 * Focus management for modal and lightbox dialogs: inert backgrounds, focus
 * containment checks, and focus restoration after transitions.
 */

export function setInert(el, inert) {
  if (!el) return;
  if (inert) {
    el.setAttribute('inert', '');
  } else {
    el.removeAttribute('inert');
  }
}

export function setPageInert(doc, inert) {
  if (typeof doc.querySelectorAll !== 'function') return;
  doc.querySelectorAll('.navbar, .content-wrapper, .footer, .scroll-to-top-btn').forEach((el) => {
    setInert(el, inert);
  });
}

export function isWithin(container, node) {
  if (!container || !node) return false;
  if (typeof container.contains === 'function') return container.contains(node);

  let current = node;
  while (current) {
    if (current === container) return true;
    current = current.parentElement;
  }
  return false;
}

export function focusDialogControl(doc, container, target, isOpen) {
  if (!target) return;

  const attempt = () => {
    if (isOpen() && !isWithin(container, doc.activeElement)) {
      target.focus();
    }
  };

  target.focus();

  // The dialog's visibility transition can still be in flight on the first
  // frame, so retry shortly after the trigger loses focus to <body>.
  if (typeof setTimeout === 'function') {
    setTimeout(attempt, 50);
    setTimeout(attempt, 300);
  }
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(attempt);
  }
}
