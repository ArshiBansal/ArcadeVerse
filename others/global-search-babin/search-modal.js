/**
 * ArcadeVerse Global Omnibar & Command Palette Search Engine
 * Provides instant Ctrl+K / '/' fuzzy search across all games, categories, and blueprints
 * Complies with strict isolation rules under global-search-babin/
 */

(() => {
  const searchableCatalog = [
    { id: "cyber-stacker", title: "Cyber Tower Stacker", category: "Arcade", url: "index.html?game=cyber-stacker", desc: "Precision timing tower stacking game" },
    { id: "space-invaders", title: "Space Invaders: Retro Defense", category: "Action", url: "index.html?game=space-invaders", desc: "Classic alien armada space defense" },
    { id: "synth-says", title: "Synthwave Simon", category: "Retro", url: "index.html?game=synth-says", desc: "80s synth memory audio sequence" },
    { id: "cryptic-wordle", title: "Cryptic Wordle Hack", category: "Puzzle", url: "index.html?game=cryptic-wordle", desc: "Cyber security 5-letter passcode puzzle" },
    { id: "quantum-minesweeper", title: "Quantum Minesweeper", category: "Puzzle", url: "index.html?game=quantum-minesweeper", desc: "Glitch matrix mine sweeper challenge" },
    { id: "whack-a-bug", title: "Whack-A-Bug Arcade", category: "Arcade", url: "index.html?game=whack-a-bug", desc: "Debugging panic reaction reflex game" },
    { id: "tactical-fleet", title: "Tactical Fleet Commander", category: "Strategy", url: "index.html?game=tactical-fleet", desc: "Radar battleship grid tactical combat" },
    { id: "neon-runner", title: "Neon Beat Runner", category: "Rhythm", url: "index.html?game=neon-runner", desc: "4-lane synthwave rhythm reaction test" },
    { id: "cyber-snake", title: "Cyber Snake Matrix", category: "Classic", url: "index.html?game=cyber-snake", desc: "Portal wrap cyber neon snake" },
    { id: "leaderboard", title: "Hall of Fame Leaderboard", category: "Stats", url: "leaderboard.html", desc: "View champion high scores and rankings" },
    { id: "contributing", title: "Contributor Guide", category: "Docs", url: "https://github.com/DebasmitaBose0/ArcadeVerse/blob/main/CONTRIBUTING.md", desc: "Step-by-step game submission rules" }
  ];

  function createSearchModal() {
    if (document.getElementById("arcade-omnibar-modal")) return;

    const modal = document.createElement("div");
    modal.id = "arcade-omnibar-modal";
    modal.className = "omnibar-backdrop";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Search ArcadeVerse");

    modal.innerHTML = `
      <div class="omnibar-card">
        <div class="omnibar-input-row">
          <span class="omnibar-icon"><i data-lucide="search"></i></span>
          <input type="text" id="omnibar-input" class="omnibar-input" placeholder="Type a game, category, or command... (e.g. 'puzzle', 'snake')" autocomplete="off" />
          <kbd class="omnibar-kbd">ESC</kbd>
        </div>
        <div id="omnibar-results" class="omnibar-results"></div>
        <div class="omnibar-footer">
          <span><kbd class="key-hint">↑</kbd> <kbd class="key-hint">↓</kbd> to navigate</span>
          <span><kbd class="key-hint">ENTER</kbd> to select</span>
          <span><kbd class="key-hint">ESC</kbd> to close</span>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    if (window.lucide) lucide.createIcons();

    const input = document.getElementById("omnibar-input");
    const resultsContainer = document.getElementById("omnibar-results");

    input.addEventListener("input", () => {
      renderResults(input.value.trim().toLowerCase());
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeOmnibar();
    });

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openOmnibar();
      } else if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        openOmnibar();
      } else if (e.key === "Escape" && modal.classList.contains("active")) {
        closeOmnibar();
      }
    });
  }

  function openOmnibar() {
    const modal = document.getElementById("arcade-omnibar-modal");
    const input = document.getElementById("omnibar-input");
    if (!modal || !input) return;

    modal.classList.add("active");
    input.value = "";
    renderResults("");
    setTimeout(() => input.focus(), 50);
  }

  function closeOmnibar() {
    const modal = document.getElementById("arcade-omnibar-modal");
    if (modal) modal.classList.remove("active");
  }

  function renderResults(query) {
    const resultsContainer = document.getElementById("omnibar-results");
    if (!resultsContainer) return;

    const filtered = searchableCatalog.filter(item => {
      if (!query) return true;
      return item.title.toLowerCase().includes(query) ||
             item.category.toLowerCase().includes(query) ||
             item.desc.toLowerCase().includes(query);
    });

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div class="omnibar-no-results">
          <p>No games or commands found matching "<strong></strong>"</p>
          <small>Try searching for "Action", "Puzzle", or "Snake"</small>
        </div>
      `;
      // The query is what the user typed, so show it as text, not markup.
      resultsContainer.querySelector(".omnibar-no-results strong").textContent = query;
      return;
    }

    resultsContainer.innerHTML = filtered.map((item, idx) => `
      <div class="omnibar-item ${idx === 0 ? 'selected' : ''}" data-url="${item.url}">
        <div class="omnibar-item-left">
          <span class="omnibar-badge">${item.category}</span>
          <span class="omnibar-item-title">${item.title}</span>
          <span class="omnibar-item-desc">${item.desc}</span>
        </div>
        <span class="omnibar-enter-hint">↵</span>
      </div>
    `).join("");

    resultsContainer.querySelectorAll(".omnibar-item").forEach(item => {
      item.addEventListener("click", () => {
        window.location.href = item.getAttribute("data-url");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    createSearchModal();
  });

  window.ArcadeOmnibar = { open: openOmnibar, close: closeOmnibar };
})();
