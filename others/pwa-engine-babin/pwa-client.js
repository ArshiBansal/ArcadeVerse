/**
 * ArcadeVerse PWA Client & Install Engine
 * Registers service worker and provides install prompt banner
 * Complies with strict isolation rules under pwa-engine-babin/
 */

(() => {
  let deferredPrompt = null;

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("others/pwa-engine-babin/sw.js", { scope: "./" })
          .then((reg) => {
            console.log("ArcadeVerse PWA Service Worker active. Scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("PWA ServiceWorker registration notice:", err);
          });
      });
    }
  }

  function setupInstallBanner() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallPrompt();
    });

    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
      hideInstallPrompt();
      console.log("ArcadeVerse was successfully installed!");
    });
  }

  function showInstallPrompt() {
    if (document.getElementById("pwa-install-banner")) return;

    const banner = document.createElement("div");
    banner.id = "pwa-install-banner";
    banner.className = "pwa-banner";
    banner.innerHTML = `
      <div class="pwa-banner-content">
        <span class="pwa-icon"><i data-lucide="download"></i></span>
        <div class="pwa-text">
          <strong>Install ArcadeVerse</strong>
          <span>Play retro arcade games offline anywhere</span>
        </div>
      </div>
      <div class="pwa-actions">
        <button id="pwa-install-btn" class="pwa-btn-primary">Install</button>
        <button id="pwa-dismiss-btn" class="pwa-btn-close" aria-label="Close">&times;</button>
      </div>
    `;

    document.body.appendChild(banner);
    if (window.lucide) lucide.createIcons();

    document.getElementById("pwa-install-btn").addEventListener("click", () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("User accepted the install prompt");
          }
          deferredPrompt = null;
          hideInstallPrompt();
        });
      }
    });

    document.getElementById("pwa-dismiss-btn").addEventListener("click", () => {
      hideInstallPrompt();
    });
  }

  function hideInstallPrompt() {
    const banner = document.getElementById("pwa-install-banner");
    if (banner) {
      banner.classList.add("hidden");
      setTimeout(() => banner.remove(), 400);
    }
  }

  function checkOnlineStatus() {
    const updateStatus = () => {
      if (!navigator.onLine) {
        showOfflineNotice();
      } else {
        hideOfflineNotice();
      }
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
  }

  function showOfflineNotice() {
    if (document.getElementById("pwa-offline-badge")) return;
    const badge = document.createElement("div");
    badge.id = "pwa-offline-badge";
    badge.className = "pwa-offline-badge";
    badge.innerHTML = `<span><i data-lucide="wifi-off" style="width: 14px; height: 14px; vertical-align: -2px; margin-right: 5px;"></i> Offline Mode — Cached Games Active</span>`;
    document.body.appendChild(badge);
    if (window.lucide) lucide.createIcons();
  }

  function hideOfflineNotice() {
    const badge = document.getElementById("pwa-offline-badge");
    if (badge) badge.remove();
  }

  document.addEventListener("DOMContentLoaded", () => {
    registerServiceWorker();
    setupInstallBanner();
    checkOnlineStatus();
  });
})();
