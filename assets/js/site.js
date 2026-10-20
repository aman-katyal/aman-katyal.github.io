/**
 * Site interactions: code copy, scroll-to-top, email copy, and optional math.
 * Loaded with `defer` so the DOM is parsed before this runs.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initCodeCopyButtons();
    initScrollToTop();
    initEmailCopyButtons();
    renderMath();
  });

  function initCodeCopyButtons() {
    const codeBlocks = document.querySelectorAll('div.highlighter-rouge, pre');

    codeBlocks.forEach((block) => {
      // Skip nested pre tags to avoid duplicate buttons.
      if (block.tagName === 'PRE' && block.parentElement.classList.contains('highlighter-rouge')) {
        return;
      }

      let container = block;
      if (block.tagName === 'PRE') {
        container = document.createElement('div');
        container.className = 'code-container-wrapper';
        block.parentNode.insertBefore(container, block);
        container.appendChild(block);
      } else {
        block.classList.add('code-container-wrapper');
      }

      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-code-btn no-print';
      copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
      copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
      container.appendChild(copyBtn);

      copyBtn.addEventListener('click', () => {
        const codeEl = container.querySelector('code') || container.querySelector('pre');
        if (!codeEl) return;

        let text = codeEl.innerText;
        // Remove line-number prefixes from highlighted code.
        text = text.replace(/^\s*\d+:\s/gm, '');

        navigator.clipboard.writeText(text).then(() => {
          copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #22c55e;"></i>';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
          }, 2000);
        }).catch((err) => {
          console.error('Failed to copy text: ', err);
        });
      });
    });
  }

  function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scroll-to-top');
    if (!scrollTopBtn) return;

    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
    });

    scrollTopBtn.addEventListener('click', () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  }

  function initEmailCopyButtons() {
    const emailCopyBtns = document.querySelectorAll('[data-copy-email]');
    const copyToast = document.getElementById('copy-toast');

    const showCopyToast = (message) => {
      if (!copyToast) return;
      copyToast.textContent = message;
      copyToast.classList.add('is-visible');
      clearTimeout(copyToast._hideTimeout);
      copyToast._hideTimeout = setTimeout(() => {
        copyToast.classList.remove('is-visible');
      }, 2200);
    };

    emailCopyBtns.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const email = btn.getAttribute('data-copy-email');
        if (!email) return;

        if (!btn.dataset.originalHtml) {
          btn.dataset.originalHtml = btn.innerHTML;
        }

        const showCopied = () => {
          btn.classList.add('is-copied');
          const label = btn.querySelector('.email-copy-label');
          if (label) {
            label.textContent = 'Copied!';
          } else {
            btn.innerHTML = '<i class="fa-solid fa-check"></i>';
          }
          btn.setAttribute('aria-label', 'Email address copied to clipboard');
          btn.title = email + ' (copied!)';
          showCopyToast('Email copied: ' + email);
          clearTimeout(btn._copyTimeout);
          btn._copyTimeout = setTimeout(() => {
            btn.classList.remove('is-copied');
            btn.innerHTML = btn.dataset.originalHtml;
            btn.setAttribute('aria-label', 'Copy email address to clipboard');
            btn.title = 'Click to copy email';
          }, 2000);
        };

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(email);
            showCopied();
          } else {
            // Fallback for non-secure contexts / older browsers.
            const ta = document.createElement('textarea');
            ta.value = email;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showCopied();
          }
        } catch (err) {
          console.error('Failed to copy email: ', err);
          window.prompt('Copy email address:', email);
        }
      });
    });
  }

  function renderMath() {
    if (typeof renderMathInElement !== 'function') return;

    let targets = document.querySelectorAll('.markdown-body');
    if (!targets.length) targets = [document.body];

    const options = {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    };

    // The PDF builder contains one .markdown-body per selected project.
    targets.forEach((target) => {
      renderMathInElement(target, options);
    });
  }
})();
