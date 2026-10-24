/**
 * ArcadeVerse Accessibility & Focus Management Engine
 * Provides WCAG 2.1 AA keyboard navigation, focus trapping, and ARIA announcements
 * Complies with strict isolation rules under accessibility-engine-babin/
 */

(() => {
  function injectSkipLink() {
    if (document.getElementById("skip-to-content")) return;
    const skipLink = document.createElement("a");
    skipLink.id = "skip-to-content";
    skipLink.href = "#main-content";
    skipLink.className = "skip-link";
    skipLink.textContent = "Skip to main content";
    document.body.prepend(skipLink);

    const mainEl = document.querySelector("main");
    if (mainEl && !mainEl.id) {
      mainEl.id = "main-content";
      mainEl.setAttribute("tabindex", "-1");
    }
  }

  function injectLiveAnnouncer() {
    if (document.getElementById("a11y-announcer")) return;
    const announcer = document.createElement("div");
    announcer.id = "a11y-announcer";
    announcer.className = "sr-only";
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    document.body.appendChild(announcer);
  }

  function announce(message) {
    const announcer = document.getElementById("a11y-announcer");
    if (announcer) {
      announcer.textContent = "";
      setTimeout(() => {
        announcer.textContent = message;
      }, 50);
    }
  }

  function setupModalFocusTrap() {
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;

      const activeModal = document.querySelector(".game-modal.active, .modal.active");
      if (!activeModal) return;

      const focusableElements = activeModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  function setupGridArrowNavigation() {
    document.addEventListener("keydown", (e) => {
      if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;

      const activeElement = document.activeElement;
      if (!activeElement || !activeElement.classList.contains("game-card")) return;

      const grid = activeElement.parentElement;
      if (!grid) return;

      const cards = Array.from(grid.querySelectorAll(".game-card"));
      const currentIndex = cards.indexOf(activeElement);
      if (currentIndex === -1) return;

      e.preventDefault();
      let nextIndex = currentIndex;

      if (e.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % cards.length;
      } else if (e.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + cards.length) % cards.length;
      } else if (e.key === "ArrowDown") {
        nextIndex = Math.min(cards.length - 1, currentIndex + 3);
      } else if (e.key === "ArrowUp") {
        nextIndex = Math.max(0, currentIndex - 3);
      }

      if (cards[nextIndex]) {
        cards[nextIndex].focus();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectSkipLink();
    injectLiveAnnouncer();
    setupModalFocusTrap();
    setupGridArrowNavigation();

    // Make game cards focusable with keyboard
    const observer = new MutationObserver(() => {
      document.querySelectorAll(".game-card").forEach(card => {
        if (!card.hasAttribute("tabindex")) {
          card.setAttribute("tabindex", "0");
          card.setAttribute("role", "button");
          card.setAttribute("aria-label", `Play ${card.querySelector(".game-card-title")?.textContent || "Game"}`);
        }
      });
    });

    const gamesGrid = document.getElementById("games-grid");
    if (gamesGrid) {
      observer.observe(gamesGrid, { childList: true });
    }
  });

  window.ArcadeA11y = { announce };
})();
