/**
 * Click delegation for cards/buttons carrying data-project-trigger.
 */

export function bindTriggers(doc, openProjectModal) {
  doc.addEventListener('click', (event) => handleTriggerClick(event, openProjectModal));
}

export function handleTriggerClick(event, openProjectModal) {
  if (!event.target || typeof event.target.closest !== 'function') return;

  const trigger = event.target.closest('[data-project-trigger], [data-project-id]');
  if (!trigger) return;

  // Let card anchors (GitHub, Docs, Devpost) navigate normally.
  if (event.target.closest('a:not([data-project-trigger])')) return;

  event.preventDefault();
  const projectId = trigger.getAttribute('data-project-trigger') || trigger.getAttribute('data-project-id');
  if (!projectId) return;

  const focusTarget = trigger.matches('button, a, [tabindex]')
    ? trigger
    : trigger.querySelector('[data-project-trigger]') || trigger;
  openProjectModal(projectId, focusTarget);
}
