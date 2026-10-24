/**
 * ArcadeVerse Recently Played & Quick Resume Drawer
 * Tracks recently played games in localStorage and provides a slide-out drawer
 * Complies with strict isolation rules under recent-games-babin/
 */

(() => {
  const STORAGE_KEY = "arcadeverse_recent_games";
  const MAX_RECENTS = 6;

  function getRecents() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveRecents(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENTS)));
  }

  function recordPlayed(gameId, title, category) {
    if (!gameId) return;
    let list = getRecents().filter(item => item.id !== gameId);
    list.unshift({
      id: gameId,
      title: title || "Arcade Game",
      category: category || "Retro",
      timestamp: Date.now()
    });
    saveRecents(list);
    renderDrawerItems();
    updateBadge();
  }

  function formatTimeAgo(ms) {
    const diff = Math.floor((Date.now() - ms) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function createDrawer() {
    if (document.getElementById("recent-games-drawer")) return;

    // Trigger button
    const trigger = document.createElement("button");
    trigger.id = "recent-games-trigger";
    trigger.className = "recent-trigger-btn";
    trigger.title = "View Recently Played Games";
    trigger.setAttribute("aria-label", "View Recently Played Games");
    trigger.innerHTML = `
      <span class="trigger-icon"><i data-lucide="clock"></i></span>
      <span class="trigger-label">Recent</span>
      <span id="recent-count-badge" class="recent-badge">0</span>
    `;

    document.body.appendChild(trigger);

    // Slide-out Drawer
    const drawer = document.createElement("aside");
    drawer.id = "recent-games-drawer";
    drawer.className = "recent-drawer";
    drawer.setAttribute("aria-label", "Recently played games list");
    drawer.innerHTML = `
      <div class="recent-drawer-header">
        <div class="drawer-title-row">
          <span class="drawer-icon"><i data-lucide="gamepad-2"></i></span>
          <h3>Recently Played</h3>
        </div>
        <button id="recent-drawer-close" class="recent-close-btn" aria-label="Close drawer">&times;</button>
      </div>
      <div id="recent-drawer-list" class="recent-drawer-body"></div>
      <div class="recent-drawer-footer">
        <button id="clear-recent-btn" class="recent-clear-btn">Clear History</button>
      </div>
    `;

    document.body.appendChild(drawer);
    if (window.lucide) lucide.createIcons();

    // Backdrop
    const backdrop = document.createElement("div");
    backdrop.id = "recent-drawer-backdrop";
    backdrop.className = "recent-backdrop";
    document.body.appendChild(backdrop);

    // Event listeners
    trigger.addEventListener("click", () => toggleDrawer(true));
    document.getElementById("recent-drawer-close").addEventListener("click", () => toggleDrawer(false));
    backdrop.addEventListener("click", () => toggleDrawer(false));
    document.getElementById("clear-recent-btn").addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      renderDrawerItems();
      updateBadge();
    });

    renderDrawerItems();
    updateBadge();
  }

  function toggleDrawer(open) {
    const drawer = document.getElementById("recent-games-drawer");
    const backdrop = document.getElementById("recent-drawer-backdrop");
    if (!drawer || !backdrop) return;

    if (open) {
      drawer.classList.add("active");
      backdrop.classList.add("active");
      renderDrawerItems();
    } else {
      drawer.classList.remove("active");
      backdrop.classList.remove("active");
    }
  }

  function updateBadge() {
    const badge = document.getElementById("recent-count-badge");
    const list = getRecents();
    if (badge) {
      badge.textContent = list.length;
      badge.style.display = list.length > 0 ? "inline-block" : "none";
    }
  }

  function renderDrawerItems() {
    const listContainer = document.getElementById("recent-drawer-list");
    if (!listContainer) return;

    const list = getRecents();
    if (list.length === 0) {
      listContainer.innerHTML = `
        <div class="recent-empty">
          <span class="empty-icon"><i data-lucide="gamepad-2"></i></span>
          <p>No recently played games yet.</p>
          <small>Launch any game from the catalog to record your play history!</small>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    listContainer.innerHTML = list.map(item => `
      <div class="recent-item-card" data-id="${item.id}">
        <div class="recent-item-info">
          <span class="recent-item-badge">${item.category}</span>
          <h4 class="recent-item-title">${item.title}</h4>
          <span class="recent-item-time">${formatTimeAgo(item.timestamp)}</span>
        </div>
        <button class="recent-play-btn" data-game-id="${item.id}">Play</button>
      </div>
    `).join("");

    listContainer.querySelectorAll(".recent-play-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-game-id");
        toggleDrawer(false);
        // Find play button on page or redirect to index with deep link
        const targetBtn = document.querySelector(`[data-game-id="${id}"] .btn-play, [data-game-id="${id}"]`);
        if (targetBtn) {
          const actualBtn = targetBtn.querySelector(".btn-play") || targetBtn;
          actualBtn.click();
        } else {
          window.location.href = `index.html?game=${id}`;
        }
      });
    });
  }

  function attachGameWatchers() {
    // Intercept clicks on game play buttons or modal openings
    document.addEventListener("click", (e) => {
      const playBtn = e.target.closest(".btn-play, [data-action='play'], .game-card");
      if (!playBtn) return;

      const card = playBtn.closest(".game-card") || playBtn;
      const gameId = card.getAttribute("data-game-id") || card.id;
      const title = card.querySelector(".game-card-title")?.textContent || "Game";
      const category = card.querySelector(".game-card-tag, .category-badge")?.textContent || "Arcade";

      if (gameId) {
        recordPlayed(gameId, title, category);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    createDrawer();
    attachGameWatchers();
  });

  window.ArcadeRecent = { recordPlayed, getRecents };
})();
