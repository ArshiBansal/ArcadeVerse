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
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(stored) && stored.length > 0) {
        return stored;
      }
    } catch {
      // ignore
    }

    // Smart fallback: check player stats distinctGames if available
    try {
      const stats = JSON.parse(localStorage.getItem("arcadeverse_player_stats"));
      if (stats && Array.isArray(stats.distinctGames) && stats.distinctGames.length > 0 && typeof GAMES_REGISTRY !== "undefined") {
        const fallbackList = stats.distinctGames.slice(-MAX_RECENTS).reverse().map((id, index) => {
          const game = GAMES_REGISTRY.find(g => g.id === id);
          return {
            id,
            title: game ? game.title : id,
            category: game ? game.category : "Arcade",
            timestamp: Date.now() - (index * 60000)
          };
        });
        if (fallbackList.length > 0) {
          saveRecents(fallbackList);
          return fallbackList;
        }
      }
    } catch {
      // ignore
    }

    return [];
  }

  function saveRecents(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENTS)));
    } catch {
      // ignore
    }
  }

  function recordPlayed(gameId, title, category) {
    if (!gameId) return;

    // Resolve missing title/category from GAMES_REGISTRY if needed
    if ((!title || title === "Game" || !category || category === "Arcade") && typeof GAMES_REGISTRY !== "undefined") {
      const found = GAMES_REGISTRY.find(g => g.id === gameId);
      if (found) {
        title = found.title;
        category = found.category;
      }
    }

    let list = getRecents().filter(item => item.id !== gameId);
    list.unshift({
      id: gameId,
      title: title || "Arcade Game",
      category: category || "Arcade",
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

    // Backdrop
    const backdrop = document.createElement("div");
    backdrop.id = "recent-drawer-backdrop";
    backdrop.className = "recent-backdrop";
    document.body.appendChild(backdrop);

    if (window.lucide) lucide.createIcons();

    // Event listeners
    trigger.addEventListener("click", () => toggleDrawer(true));
    document.getElementById("recent-drawer-close").addEventListener("click", () => toggleDrawer(false));
    backdrop.addEventListener("click", () => toggleDrawer(false));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("active")) {
        toggleDrawer(false);
      }
    });

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

    if (window.lucide) lucide.createIcons();

    listContainer.querySelectorAll(".recent-play-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-game-id");
        toggleDrawer(false);

        // 1. Try launching directly through ArcadeApp API
        if (window.ArcadeApp && typeof window.ArcadeApp.openGame === "function") {
          if (window.ArcadeApp.openGame(id)) return;
        }

        // 2. Try finding button/card on the current page
        const targetBtn = document.querySelector(`[data-game-id="${id}"] .btn-play-trigger, [data-game-id="${id}"] .btn-play, [data-game-id="${id}"]`);
        if (targetBtn) {
          const actualBtn = targetBtn.querySelector(".btn-play-trigger, .btn-play") || targetBtn;
          actualBtn.click();
        } else {
          // 3. Fallback to index.html with game query parameter
          window.location.href = `index.html?game=${id}`;
        }
      });
    });
  }

  function attachGameWatchers() {
    // 1. Use capture phase click listener to bypass stopPropagation
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest(".btn-play-trigger, .btn-play, [data-action='play'], .game-card");
      if (!trigger) return;

      const card = trigger.closest(".game-card") || trigger;
      const gameId = card.getAttribute("data-game-id") || card.getAttribute("data-id") || card.id;
      if (!gameId) return;

      let title = card.querySelector(".game-card-title")?.textContent?.trim();
      let category = card.querySelector(".game-category-tag, .game-card-tag, .category-badge")?.textContent?.trim();

      if ((!title || !category) && typeof GAMES_REGISTRY !== "undefined") {
        const found = GAMES_REGISTRY.find(g => g.id === gameId);
        if (found) {
          title = title || found.title;
          category = category || found.category;
        }
      }

      recordPlayed(gameId, title || "Arcade Game", category || "Retro");
    }, true);

    // 2. Listen to custom event dispatched by app.js
    window.addEventListener("arcadeverse:game-launched", (e) => {
      if (e.detail && e.detail.id) {
        recordPlayed(e.detail.id, e.detail.title, e.detail.category);
      }
    });

    // 3. Safety net: observe #game-modal when it becomes active
    const gameModal = document.getElementById("game-modal");
    if (gameModal) {
      const observer = new MutationObserver(() => {
        if (gameModal.classList.contains("active")) {
          const title = document.getElementById("modal-game-title")?.textContent?.trim();
          const category = document.getElementById("modal-game-badge")?.textContent?.trim();
          const iframeSrc = document.getElementById("game-iframe")?.src || "";

          let gameId = "";
          if (typeof activeGame !== "undefined" && activeGame && activeGame.id) {
            gameId = activeGame.id;
          } else if (typeof GAMES_REGISTRY !== "undefined") {
            const found = GAMES_REGISTRY.find(g => (g.path && iframeSrc.includes(g.path)) || g.title === title);
            if (found) gameId = found.id;
          }

          if (gameId) {
            recordPlayed(gameId, title || "Arcade Game", category || "Retro");
          }
        }
      });
      observer.observe(gameModal, { attributes: true, attributeFilter: ["class"] });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    createDrawer();
    attachGameWatchers();
  });

  window.ArcadeRecent = { recordPlayed, getRecents };
})();
