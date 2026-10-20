# Project modal modules

`assets/js/project-modal.js` is a 12-line browser entry point. It imports the
controller factory and exposes one documented global:

```js
window.PortfolioModal.openProjectModal(projectId);
window.PortfolioModal.closeProjectModal();
```

Card and button triggers continue to work through event delegation on
`[data-project-trigger]`, so no inline handlers are required.

## Modules

| Module              | Responsibility                                           |
| ------------------- | -------------------------------------------------------- |
| `modal/state.js`    | Per-controller state and project-data loading.           |
| `modal/dom.js`      | Cached element references and HTML escaping.             |
| `modal/focus.js`    | Inert backgrounds, focus containment, focus restoration. |
| `modal/render.js`   | Header, links, summary, highlights, and skill pills.     |
| `modal/gallery.js`  | Media switching, thumbnails, image stepping.             |
| `modal/lightbox.js` | Full-screen lightbox open/close.                         |
| `modal/keyboard.js` | Escape, arrows, trigger activation, Tab trap.            |
| `modal/triggers.js` | Click delegation for project triggers.                   |
| `modal/events.js`   | Wires close, backdrop, gallery, swipe, and nav controls. |
| `modal/history.js`  | Shareable `#project-<id>` hash helpers.                  |
| `modal/swipe.js`    | Horizontal touch/pen swipes for gallery and lightbox.    |
| `modal/index.js`    | Controller factory and public API.                       |

## Deep links and touch

Opening a project writes `#project-<id>` with `history.replaceState`; the hash
updates when moving between projects and is removed on close. Loading a URL
with that hash opens the matching project after initialization.

Gallery and lightbox images support horizontal touch/pen swipes. A swipe
suppresses the follow-up click so it does not open the lightbox accidentally.
The modal shows a desktop-only keyboard hint, and multi-image projects show a
`current / total` counter in both the gallery and lightbox.

## No-JS fallback

The primary card action is an anchor pointing at the project’s case study (or
the external Devpost entry for Posture Pet). JavaScript intercepts the click
and opens the modal; without JavaScript the same control navigates normally.

`assets/js/modal/package.json` marks the directory as native ES modules so Node
can import the same files in tests. The site needs no bundler.
