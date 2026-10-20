/**
 * Custom PDF portfolio builder.
 * Keeps selection state, localStorage persistence, the live counter, and the
 * first-visible print marker in one testable factory.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'pdf_selected_projects';

  function createPrintBuilder(doc, storage) {
    doc = doc || document;

    let store = storage;
    if (store === undefined) {
      try {
        store = window.localStorage;
      } catch (error) {
        store = null;
      }
    }

    const checkboxes = Array.from(doc.querySelectorAll('.project-toggle-checkbox'));
    const counterBadge = doc.getElementById('selected-counter-badge');
    const selectAllBtn = doc.getElementById('btn-select-all');
    const clearAllBtn = doc.getElementById('btn-clear-all');
    const totalCount = checkboxes.length;

    function cardFor(checkbox) {
      return checkbox.closest('.pdf-checkbox-card');
    }

    function slugFor(checkbox) {
      const card = cardFor(checkbox);
      if (card) return card.getAttribute('data-project-slug');
      return (checkbox.getAttribute('data-target') || '').replace(/^proj-sec-/, '');
    }

    function getSelectedSlugs() {
      return checkboxes
        .filter((checkbox) => checkbox.checked)
        .map(slugFor);
    }

    function getState() {
      const sections = Array.from(doc.querySelectorAll('.print-project-section'));
      const firstVisibleSection = sections.find((section) => section.classList.contains('is-first-visible'));
      return {
        selected: checkboxes.filter((checkbox) => checkbox.checked).length,
        total: totalCount,
        slugs: getSelectedSlugs(),
        firstVisible: firstVisibleSection ? firstVisibleSection.getAttribute('data-project-slug') : null,
        excluded: sections.filter((section) => section.classList.contains('is-excluded')).length
      };
    }

    function updateState() {
      let selectedCount = 0;

      checkboxes.forEach((checkbox) => {
        const targetId = checkbox.getAttribute('data-target');
        const section = doc.getElementById(targetId);
        const card = cardFor(checkbox);

        if (checkbox.checked) {
          selectedCount++;
          if (section) section.classList.remove('is-excluded');
          if (card) card.classList.add('selected');
        } else {
          if (section) section.classList.add('is-excluded');
          if (card) card.classList.remove('selected');
        }
      });

      if (counterBadge) {
        counterBadge.textContent = `${selectedCount} of ${totalCount} Selected`;
        counterBadge.classList.toggle('none-selected', selectedCount === 0);
      }

      // Printing starts page 2 from DOM order, so mark the first section that
      // remains visible after exclusions.
      let foundFirstVisible = false;
      Array.from(doc.querySelectorAll('.print-project-section')).forEach((section) => {
        section.classList.remove('is-first-visible');
        if (!foundFirstVisible && !section.classList.contains('is-excluded')) {
          section.classList.add('is-first-visible');
          foundFirstVisible = true;
        }
      });

      if (store) {
        store.setItem(STORAGE_KEY, JSON.stringify(getSelectedSlugs()));
      }

      return getState();
    }

    function applySelection(slugs) {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = Array.isArray(slugs) ? slugs.includes(slugFor(checkbox)) : true;
      });
      return updateState();
    }

    function selectAll() {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
      });
      return updateState();
    }

    function clearAll() {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
      doc.querySelectorAll('.preset-btn').forEach((button) => button.classList.remove('active'));
      return updateState();
    }

    function restore() {
      let saved = null;
      if (store) {
        try {
          saved = JSON.parse(store.getItem(STORAGE_KEY));
        } catch (error) {
          saved = null;
        }
      }

      // An intentionally empty array must restore as "nothing selected".
      if (Array.isArray(saved)) return applySelection(saved);
      return updateState();
    }

    function init() {
      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', updateState);
      });

      if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAll);
      }
      if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAll);
      }

      return restore();
    }

    return {
      init,
      updateState,
      applySelection,
      selectAll,
      clearAll,
      restore,
      getSelectedSlugs,
      getTotalCount: () => totalCount,
      getState
    };
  }

  let initialStore = null;
  try {
    initialStore = window.localStorage;
  } catch (error) {
    initialStore = null;
  }

  const instance = createPrintBuilder(document, initialStore);
  window.PrintBuilder = {
    create: createPrintBuilder,
    instance,
    STORAGE_KEY
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => instance.init());
  } else {
    instance.init();
  }
})();
