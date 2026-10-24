/**
 * ArcadeVerse Deep Link & Social Sharing Router
 * Enables direct URL sharing (?game=id) with clipboard toast and Web Share API fallback
 * Complies with strict isolation rules under deeplink-engine-babin/
 */

(() => {
  const TOAST_ID = "arcade-share-toast";

  function createToast() {
    if (document.getElementById(TOAST_ID)) return;
    const toast = document.createElement("div");
    toast.id = TOAST_ID;
    toast.className = "share-toast";
    toast.innerHTML = `
      <span class="share-toast-icon">🔗</span>
      <span class="share-toast-msg">Direct link copied to clipboard!</span>
    `;
    document.body.appendChild(toast);
  }

  function showToast(msg) {
    createToast();
    const toast = document.getElementById(TOAST_ID);
    if (!toast) return;
    const msgEl = toast.querySelector(".share-toast-msg");
    if (msgEl && msg) msgEl.textContent = msg;

    toast.classList.add("visible");
    setTimeout(() => {
      toast.classList.remove("visible");
    }, 2800);
  }

  function copyGameLink(gameId, gameTitle) {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("game", gameId);

    if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
      navigator.share({
        title: `${gameTitle || "Play on ArcadeVerse"} - ArcadeVerse`,
        text: `Play ${gameTitle || "this retro arcade game"} directly on ArcadeVerse!`,
        url: url.toString()
      }).catch(() => {
        fallbackCopy(url.toString());
      });
    } else {
      fallbackCopy(url.toString());
    }
  }

  function fallbackCopy(urlStr) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(urlStr).then(() => {
        showToast("Game link copied to clipboard!");
      }).catch(() => {
        promptCopy(urlStr);
      });
    } else {
      promptCopy(urlStr);
    }
  }

  function promptCopy(urlStr) {
    window.prompt("Copy link below:", urlStr);
  }

  function handleDirectLinks() {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get("game");

    if (gameId) {
      // Wait for games grid to populate
      const checkInterval = setInterval(() => {
        // CSS.escape keeps quotes or brackets in a shared link from breaking the selector.
        const safeId = CSS.escape(gameId);
        const targetCard = document.querySelector(`[data-game-id="${safeId}"], [data-game-id*="${safeId}"], [data-id="${safeId}"]`);
        if (targetCard) {
          clearInterval(checkInterval);
          targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
          targetCard.classList.add("deeplink-highlight");
          setTimeout(() => {
            targetCard.classList.remove("deeplink-highlight");
            const playBtn = targetCard.querySelector(".btn-play-trigger, .btn-play") || targetCard;
            if (playBtn && typeof playBtn.click === "function") {
              playBtn.click();
            }
          }, 600);
        }
      }, 200);

      setTimeout(() => clearInterval(checkInterval), 4000);
    }
  }

  function injectShareButtons() {
    const observer = new MutationObserver(() => {
      document.querySelectorAll(".game-card:not([data-share-injected])").forEach(card => {
        card.setAttribute("data-share-injected", "true");
        const actions = card.querySelector(".game-card-actions, .game-card-footer");
        if (actions) {
          const gameId = card.getAttribute("data-game-id") || card.querySelector(".game-card-title")?.textContent.toLowerCase().replace(/\s+/g, "-") || "game";
          const gameTitle = card.querySelector(".game-card-title")?.textContent || "Game";

          const shareBtn = document.createElement("button");
          shareBtn.className = "btn-icon-share";
          shareBtn.title = "Share direct game link";
          shareBtn.setAttribute("aria-label", `Share link to ${gameTitle}`);
          shareBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          `;

          shareBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            copyGameLink(gameId, gameTitle);
          });

          actions.appendChild(shareBtn);
        }
      });
    });

    const gamesGrid = document.getElementById("games-grid") || document.body;
    observer.observe(gamesGrid, { childList: true, subtree: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    createToast();
    handleDirectLinks();
    injectShareButtons();
  });

  window.ArcadeDeepLink = { copyGameLink, showToast };
})();
