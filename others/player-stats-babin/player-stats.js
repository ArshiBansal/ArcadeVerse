/**
 * ArcadeVerse Player Stats & Achievement Telemetry Engine
 * Complies with strict isolation rules under player-stats-babin/
 */

(() => {
  const ACHIEVEMENTS = [
    {
      id: "first_coin",
      title: "Insert Coin",
      description: "Launch your first web arcade game inside the player modal.",
      icon: "coins",
      condition: (stats) => stats.gamesLaunched >= 1
    },
    {
      id: "arcade_explorer",
      title: "Arcade Explorer",
      description: "Play at least 3 distinct community games.",
      icon: "gamepad-2",
      condition: (stats) => stats.distinctGames && stats.distinctGames.length >= 3
    },
    {
      id: "contributor_reader",
      title: "Open Source Scholar",
      description: "Read the official ArcadeVerse Contributor Guide (CONTRIBUTING.md).",
      icon: "book-open",
      condition: (stats) => stats.visitedContributing === true
    },
    {
      id: "fame_scout",
      title: "Hall of Fame Scout",
      description: "Audit the live GitHub Contributor Leaderboard.",
      icon: "trophy",
      condition: (stats) => stats.visitedLeaderboard === true
    },
    {
      id: "veteran_gamer",
      title: "Arcade Veteran",
      description: "Launch 10 game sessions across the platform.",
      icon: "zap",
      condition: (stats) => stats.gamesLaunched >= 10
    }
  ];

  let playerStats = JSON.parse(localStorage.getItem("arcadeverse_player_stats") || JSON.stringify({
    gamesLaunched: 0,
    distinctGames: [],
    visitedContributing: false,
    visitedLeaderboard: false,
    unlockedAchievements: []
  }));

  function saveStats() {
    localStorage.setItem("arcadeverse_player_stats", JSON.stringify(playerStats));
  }

  function showAchievementToast(achievement) {
    const toast = document.createElement("div");
    toast.className = "achievement-toast";
    toast.innerHTML = `
      <div class="toast-icon"><i data-lucide="${achievement.icon}"></i></div>
      <div class="toast-body">
        <span class="toast-tag">ACHIEVEMENT UNLOCKED!</span>
        <strong>${achievement.title}</strong>
        <p>${achievement.description}</p>
      </div>
    `;

    document.body.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  function checkAchievements() {
    let newUnlock = false;

    ACHIEVEMENTS.forEach(ach => {
      if (!playerStats.unlockedAchievements.includes(ach.id)) {
        if (ach.condition(playerStats)) {
          playerStats.unlockedAchievements.push(ach.id);
          showAchievementToast(ach);
          newUnlock = true;
        }
      }
    });

    if (newUnlock) {
      saveStats();
      updateNavbarBadge();
    }
  }

  function trackGameLaunch(gameId) {
    playerStats.gamesLaunched++;
    if (gameId && !playerStats.distinctGames.includes(gameId)) {
      playerStats.distinctGames.push(gameId);
    }
    saveStats();
    checkAchievements();
  }

  function updateNavbarBadge() {
    const badgeCount = document.getElementById("achievement-count-badge");
    if (badgeCount) {
      badgeCount.textContent = playerStats.unlockedAchievements.length;
    }
  }

  function injectAchievementsNavbarButton() {
    const navActions = document.querySelector(".nav-actions");
    if (!navActions || document.getElementById("achievements-nav-btn")) return;

    const btn = document.createElement("button");
    btn.id = "achievements-nav-btn";
    btn.className = "btn btn-icon achievements-nav-btn";
    btn.setAttribute("title", "View Player Achievements");
    btn.setAttribute("aria-label", "View Achievements");
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
        <path d="M4 22h16"></path>
        <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-2.34"></path>
        <path d="M14 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34"></path>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
      </svg>
      <span class="achievement-pill" id="achievement-count-badge">${playerStats.unlockedAchievements.length}</span>
    `;

    const mobileBtn = document.getElementById("mobile-menu-btn");
    if (mobileBtn) {
      navActions.insertBefore(btn, mobileBtn);
    } else {
      navActions.appendChild(btn);
    }

    btn.addEventListener("click", openAchievementsModal);
  }

  function openAchievementsModal() {
    let modal = document.getElementById("achievements-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "achievements-modal";
      modal.className = "modal achievements-modal";
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3>Arcade Achievements</h3>
            <button id="close-achievements-btn" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="achievements-progress-bar">
              <span id="ach-progress-text">0 / 5 Unlocked</span>
              <div class="progress-track"><div class="progress-fill" id="ach-progress-fill" style="width: 0%;"></div></div>
            </div>
            <div class="achievements-list" id="achievements-list"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector("#close-achievements-btn").addEventListener("click", () => {
        modal.classList.remove("active");
      });
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("active");
      });
    }

    // Render list
    const listEl = modal.querySelector("#achievements-list");
    listEl.innerHTML = "";

    const unlockedCount = playerStats.unlockedAchievements.length;
    modal.querySelector("#ach-progress-text").textContent = `${unlockedCount} / ${ACHIEVEMENTS.length} Unlocked`;
    modal.querySelector("#ach-progress-fill").style.width = `${(unlockedCount / ACHIEVEMENTS.length) * 100}%`;

    ACHIEVEMENTS.forEach(ach => {
      const isUnlocked = playerStats.unlockedAchievements.includes(ach.id);
      const item = document.createElement("div");
      item.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
      const statusIcon = isUnlocked 
        ? '<i data-lucide="check" class="ach-status-check"></i>' 
        : '<i data-lucide="lock" class="ach-status-lock"></i>';
      item.innerHTML = `
        <div class="ach-icon"><i data-lucide="${ach.icon}"></i></div>
        <div class="ach-info">
          <h4>${ach.title} ${statusIcon}</h4>
          <p>${ach.description}</p>
        </div>
      `;
      listEl.appendChild(item);
    });

    if (window.lucide) {
      lucide.createIcons();
    }

    modal.classList.add("active");
  }

  // Intercept game launches & page views
  document.addEventListener("DOMContentLoaded", () => {
    injectAchievementsNavbarButton();

    if (window.location.pathname.includes("leaderboard.html")) {
      playerStats.visitedLeaderboard = true;
      saveStats();
      checkAchievements();
    }

    // Listen for contributing guide clicks
    document.addEventListener("click", (e) => {
      if (e.target.closest('a[href*="CONTRIBUTING"]')) {
        playerStats.visitedContributing = true;
        saveStats();
        checkAchievements();
      }
    });

    // Listen for play buttons
    document.addEventListener("click", (e) => {
      const playBtn = e.target.closest(".btn-play-trigger, .game-card");
      if (playBtn) {
        const gameId = playBtn.dataset.id || "game";
        trackGameLaunch(gameId);
      }
    });

    checkAchievements();
  });
})();
