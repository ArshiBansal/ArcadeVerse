/**
 * Hall of Fame Live GitHub Contributors & Ranking Engine
 * Fetches real contributor stats from GitHub API (or seamlessly merges with games-registry)
 * 
 * Architecture:
 * - Admin (Project Lead) has a dedicated separate rank card at the top.
 * - Podium and Leaderboard Table display ONLY Community Contributors.
 * - Cards are static by default, with an elegant corner gradient radiating on hover.
 * - Dual-category highest badges: Displays highest Game Dedicated badge and highest Milestone badge.
 * - Direct GitHub Activity column with clickable links for Issues and PRs.
 */

document.addEventListener("DOMContentLoaded", () => {
  const podiumContainer = document.getElementById("podium-container");
  const tableBody = document.getElementById("leaderboard-table-body");
  const repoInput = document.getElementById("repo-input");
  const fetchBtn = document.getElementById("fetch-github-btn");
  const syncStatusText = document.getElementById("sync-status-text");
  const adminMetaInfo = document.getElementById("admin-meta-info");

  // Leaderboard Switcher (Community Contributors vs Admin View)
  const switchContribBtn = document.getElementById("switch-contributors-btn");
  const switchAdminBtn = document.getElementById("switch-admin-btn");
  const viewContributors = document.getElementById("view-contributors");
  const viewAdmin = document.getElementById("view-admin");

  if (switchContribBtn && switchAdminBtn && viewContributors && viewAdmin) {
    switchContribBtn.addEventListener("click", () => {
      switchContribBtn.classList.add("active");
      switchAdminBtn.classList.remove("active");
      viewContributors.style.display = "block";
      viewAdmin.style.display = "none";
      if (window.lucide) lucide.createIcons();
    });

    switchAdminBtn.addEventListener("click", () => {
      switchAdminBtn.classList.add("active");
      switchContribBtn.classList.remove("active");
      viewAdmin.style.display = "block";
      viewContributors.style.display = "none";
      if (window.lucide) lucide.createIcons();
    });
  }

  const CACHE_KEY = "arcadeverse_contributors_cache";
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  // Initial verified contributors from repository
  let contributorsData = [
    {
      login: "DebasmitaBose0",
      name: "Debasmita Bose",
      role: "Project Admin & Lead",
      avatar_url: "https://avatars.githubusercontent.com/u/144198639?v=4",
      commits: 37,
      gamesCount: 2,
      mechanicsBonus: 2,
      platformPRs: 2,
      qualityPRs: 0,
      bonusPts: 0,
      games: ["Quantum Memory Matrix", "Cyber Neon Pong"]
    },
    {
      login: "Babin123456",
      name: "Babin Bid",
      role: "Arcade Developer",
      avatar_url: "https://avatars.githubusercontent.com/u/265290994?v=4",
      commits: 19,
      gamesCount: 1,
      mechanicsBonus: 1,
      platformPRs: 2,
      qualityPRs: 1,
      bonusPts: 0,
      games: ["Quantum 2048"]
    },
    {
      login: "mistu7debnath",
      name: "mistu7debnath",
      role: "Contributor",
      avatar_url: "https://avatars.githubusercontent.com/u/132514330?v=4",
      commits: 2,
      gamesCount: 1,
      mechanicsBonus: 1,
      platformPRs: 0,
      qualityPRs: 0,
      bonusPts: 0,
      games: ["Flappy Cyber Jet"]
    },
    {
      login: "hrshjswniii",
      name: "Harsh Jaiswani",
      role: "Active Contributor",
      avatar_url: "https://avatars.githubusercontent.com/u/127110189?v=4",
      commits: 2,
      gamesCount: 0,
      mechanicsBonus: 0,
      platformPRs: 0,
      qualityPRs: 1,
      bonusPts: 0,
      games: []
    },
    {
      login: "joitapaul",
      name: "Joita Paul",
      role: "Active Contributor",
      avatar_url: "https://avatars.githubusercontent.com/u/104523098?v=4",
      commits: 1,
      gamesCount: 0,
      mechanicsBonus: 0,
      platformPRs: 0,
      qualityPRs: 1,
      bonusPts: 0,
      games: []
    }
  ];

  // Sync contributors data with local CONTRIBUTORS_REGISTRY and GAMES_REGISTRY
  function loadRegistryContributors() {
    if (typeof CONTRIBUTORS_REGISTRY === "undefined" || !Array.isArray(CONTRIBUTORS_REGISTRY)) return;

    CONTRIBUTORS_REGISTRY.forEach(regUser => {
      const existing = contributorsData.find(c => c.login && c.login.toLowerCase() === regUser.github.toLowerCase());
      
      let userGames = [];
      if (typeof GAMES_REGISTRY !== "undefined" && Array.isArray(GAMES_REGISTRY)) {
        userGames = GAMES_REGISTRY.filter(g => g.github && g.github.toLowerCase() === regUser.github.toLowerCase());
      }
      const gamesCount = userGames.length > 0 ? userGames.length : (regUser.gamesCount || 0);
      const gamesList = userGames.length > 0 ? userGames.map(g => g.title) : (regUser.contributions || []);

      if (existing) {
        if (regUser.name) existing.name = regUser.name;
        existing.gamesCount = Math.max(existing.gamesCount || 0, gamesCount);
        existing.mechanicsBonus = regUser.mechanicsBonus || existing.mechanicsBonus || 0;
        existing.platformPRs = regUser.platformPRs || existing.platformPRs || 0;
        existing.qualityPRs = regUser.qualityPRs || existing.qualityPRs || 0;
        existing.bonusPts = regUser.bonusPts || existing.bonusPts || 0;
        if (gamesList.length > 0) existing.games = gamesList;
      } else {
        contributorsData.push({
          login: regUser.github,
          name: regUser.name,
          role: regUser.role || "Community Contributor",
          avatar_url: `https://github.com/${regUser.github}.png`,
          commits: regUser.commits || 1,
          gamesCount: gamesCount,
          mechanicsBonus: regUser.mechanicsBonus || 0,
          platformPRs: regUser.platformPRs || 0,
          qualityPRs: regUser.qualityPRs || 0,
          bonusPts: regUser.bonusPts || 0,
          games: gamesList
        });
      }
    });
  }

  // Universal In-App Arcade Point System:
  // Completely distinct from the official NSoC 3 / 5 / 10 evaluation labels.
  // - Verified Game: +100 pts per integrated game in 'games/' folder
  // - Mechanics & Physics Bonus: +25 pts per advanced game (Canvas/Audio/Physics/AI)
  // - Platform Feature PR: +50 pts per merged feature/UI PR
  // - Quality & Bug Fixes: +25 pts per merged bug fix / maintenance PR
  // - Merged Git Commits: +5 pts per verified commit (rewards sustained development)
  function calculateScore(item) {
    const gamePts = (item.gamesCount || 0) * 100;
    const mechanicsPts = (item.mechanicsBonus || 0) * 25;
    const featurePts = (item.platformPRs || 0) * 50;
    const fixPts = (item.qualityPRs || 0) * 25;
    const commitPts = (item.commits || 0) * 5;
    const bonus = item.bonusPts || 0;

    return gamePts + mechanicsPts + featurePts + fixPts + commitPts + bonus;
  }

  // Contributor Badges Engine:
  // Evaluates and returns an array of badges strictly and deterministically based on:
  // 1. Leadership Category (Project Admin & Lead)
  // 2. Games Dedicated Category (Count of verified standalone games in 'games/'):
  //    - Master Game Architect (15+ Verified Games)
  //    - Hyper Game Developer (8–14 Verified Games)
  //    - Arcade Developer (4–7 Verified Games)
  //    - Arcade Explorer (1–3 Verified Games)
  // 3. Platform & Universal Engineering Category (Strictly bound to in-app Arcade Score):
  //    - Master Core Architect (750+ Arcade Points)
  //    - Elite Contributor (250–749 Arcade Points)
  //    - Platform Contributor (100–249 Arcade Points)
  //    - Active Contributor (15–99 Arcade Points)
  function getContributorBadges(user) {
    const badges = [];
    const isAdmin = user.login && user.login.toLowerCase() === "debasmitabose0";

    // 1. Leadership Badge (Only for Project Lead)
    if (isAdmin) {
      badges.push({
        role: "Project Admin & Lead",
        tagClass: "role-admin",
        label: "Project Admin & Lead",
        lucideIcon: "crown",
        category: "Leadership"
      });
    }

    // 2. Dedicated Game Developer Tier (Based on Verified Games in 'games/' folder)
    const gamesCount = user.gamesCount || 0;
    if (gamesCount >= 15) {
      badges.push({
        role: "Master Game Architect",
        tagClass: "role-master-architect",
        label: "Master Game Architect",
        lucideIcon: "crown",
        category: "Games Dedicated"
      });
    } else if (gamesCount >= 8) {
      badges.push({
        role: "Hyper Game Developer",
        tagClass: "role-hyper",
        label: "Hyper Game Developer",
        lucideIcon: "zap",
        category: "Games Dedicated"
      });
    } else if (gamesCount >= 4) {
      badges.push({
        role: "Arcade Developer",
        tagClass: "role-arcade",
        label: "Arcade Developer",
        lucideIcon: "gamepad-2",
        category: "Games Dedicated"
      });
    } else if (gamesCount >= 1) {
      badges.push({
        role: "Arcade Explorer",
        tagClass: "role-explorer",
        label: "Arcade Explorer",
        lucideIcon: "compass",
        category: "Games Dedicated"
      });
    }

    // 3. Platform & Universal Engineering Track (Directly bound to In-App Arcade Score)
    const score = calculateScore(user);

    if (score >= 750) {
      badges.push({
        role: "Master Core Architect",
        tagClass: "role-master",
        label: "Master Core Architect",
        lucideIcon: "shield-check",
        category: "Platform & Core"
      });
    } else if (score >= 250) {
      badges.push({
        role: "Elite Contributor",
        tagClass: "role-elite",
        label: "Elite Contributor",
        lucideIcon: "gem",
        category: "Platform & Core"
      });
    } else if (score >= 100) {
      badges.push({
        role: "Platform Contributor",
        tagClass: "role-platform",
        label: "Platform Contributor",
        lucideIcon: "code-2",
        category: "Platform & Core"
      });
    } else if (score >= 15) {
      badges.push({
        role: "Active Contributor",
        tagClass: "role-active",
        label: "Active Contributor",
        lucideIcon: "sprout",
        category: "Getting Started"
      });
    }

    return badges;
  }

  // Get Community Contributors (Excludes Admin who has their separate dedicated rank)
  // Ranked strictly by:
  // 1. Total Arcade Score (primary)
  // 2. Verified Games count (secondary)
  // 3. Merged Commits (tiebreaker)
  function getCommunityContributors() {
    return contributorsData
      .filter(item => item.login && item.login.toLowerCase() !== "debasmitabose0")
      .sort((a, b) => {
        const scoreDiff = calculateScore(b) - calculateScore(a);
        if (scoreDiff !== 0) return scoreDiff;
        if ((b.gamesCount || 0) !== (a.gamesCount || 0)) {
          return (b.gamesCount || 0) - (a.gamesCount || 0);
        }
        return (b.commits || 0) - (a.commits || 0);
      });
  }

  // Format effort & work breakdown label
  function getWorkBreakdown(item) {
    const games = item.gamesCount || 0;
    const feat = item.platformPRs || 0;
    const fix = item.qualityPRs || 0;
    return `Games: ${games} • Feat: ${feat} • Fix: ${fix}`;
  }

  // Render Top Community Contributors Podium
  // Only displays real verified contributors who have contributed to the repository.
  // Never renders dummy "Claim Rank" cards.
  // Keeps card uncluttered since full work breakdown is in the table and category section below.
  function renderPodium() {
    if (!podiumContainer) return;
    podiumContainer.innerHTML = "";

    const communityContributors = getCommunityContributors();

    if (communityContributors.length === 0) {
      podiumContainer.innerHTML = `
        <div class="podium-empty-notice" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); font-size: 0.95rem;">
          <i data-lucide="sparkles" style="margin-right: 0.4rem;"></i> Verified community contributors will appear here automatically as contributions merge.
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    // Determine slots strictly from actual verified contributors
    let orderedContributors = [];

    if (communityContributors.length === 1) {
      // Single contributor: centered solo podium card
      orderedContributors = [
        { rank: 1, user: communityContributors[0], cardClass: "podium-1 podium-gold solo-podium", badgeType: "gold", badgeLabel: "1st Champion", badgeIcon: "crown" }
      ];
    } else if (communityContributors.length === 2) {
      // Two contributors: 1st (Gold) and 2nd (Silver)
      orderedContributors = [
        { rank: 1, user: communityContributors[0], cardClass: "podium-1 podium-gold", badgeType: "gold", badgeLabel: "1st Champion", badgeIcon: "crown" },
        { rank: 2, user: communityContributors[1], cardClass: "podium-2 podium-silver", badgeType: "silver", badgeLabel: "2nd Contributor", badgeIcon: "medal" }
      ];
    } else {
      // 3 or more: Olympic podium layout (2nd, 1st, 3rd)
      orderedContributors = [
        { rank: 2, user: communityContributors[1], cardClass: "podium-2 podium-silver", badgeType: "silver", badgeLabel: "2nd Contributor", badgeIcon: "medal" },
        { rank: 1, user: communityContributors[0], cardClass: "podium-1 podium-gold", badgeType: "gold", badgeLabel: "1st Champion", badgeIcon: "crown" },
        { rank: 3, user: communityContributors[2], cardClass: "podium-3 podium-bronze", badgeType: "bronze", badgeLabel: "3rd Contributor", badgeIcon: "medal" }
      ];
    }

    orderedContributors.forEach(slot => {
      const item = slot.user;
      const score = calculateScore(item);
      const badges = getContributorBadges(item);

      const card = document.createElement("div");
      card.className = `podium-card ${slot.cardClass}`;
      // Clean, uncluttered card: Rank badge, avatar, name, handle, primary badges, score, and profile link.
      card.innerHTML = `
        <div class="podium-badge podium-badge-${slot.badgeType}">
          <i data-lucide="${slot.badgeIcon}"></i> ${slot.badgeLabel}
        </div>
        <img src="${item.avatar_url}" alt="${item.name}" class="podium-avatar" onerror="this.src='https://github.com/identicons/${item.login}.png'">
        <h3 class="podium-name">${item.name}</h3>
        <a href="https://github.com/${item.login}" target="_blank" rel="noopener noreferrer" class="podium-handle">@${item.login}</a>
        
        <div class="podium-badges-container">
          ${badges.map(b => `<span class="role-pill-badge ${b.tagClass}"><i data-lucide="${b.lucideIcon}"></i> ${b.label}</span>`).join("")}
        </div>

        <div class="podium-score-pill">
          <strong>${score}</strong> pts
        </div>
        <div class="podium-sub-stat-text" style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.6rem; display: flex; align-items: center; justify-content: center; gap: 0.35rem;">
          ${item.gamesCount > 0 ? `<span><i data-lucide="gamepad-2" style="width: 0.8rem; height: 0.8rem;"></i> ${item.gamesCount} Game${item.gamesCount === 1 ? '' : 's'}</span> • ` : ''}
          <span><i data-lucide="git-commit" style="width: 0.8rem; height: 0.8rem;"></i> ${item.commits} Commit${item.commits === 1 ? '' : 's'}</span>
        </div>

        <a href="https://github.com/${item.login}" target="_blank" rel="noopener noreferrer" class="podium-gh-btn" title="View GitHub profile">
          <i data-lucide="external-link"></i> View Profile
        </a>
      `;

      podiumContainer.appendChild(card);
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // Render Full Contributor Standings Table (Exclusively Community Contributors)
  function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    const communityContributors = getCommunityContributors();

    if (communityContributors.length === 0) {
      const emptyTr = document.createElement("tr");
      emptyTr.innerHTML = `
        <td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          <i data-lucide="sparkles" style="margin-right: 0.4rem;"></i> Awaiting first community PR merges! Be the first contributor to claim Rank #1.
        </td>
      `;
      tableBody.appendChild(emptyTr);
      if (window.lucide) lucide.createIcons();
      return;
    }

    communityContributors.forEach((item, index) => {
      const rank = index + 1;
      const score = calculateScore(item);
      const badges = getContributorBadges(item);

      let rankBadgeHtml = `<span class="rank-tag">#${rank}</span>`;
      if (rank === 1) {
        rankBadgeHtml = `<span class="rank-tag rank-1"><i data-lucide="trophy"></i> #1</span>`;
      } else if (rank === 2) {
        rankBadgeHtml = `<span class="rank-tag rank-2"><i data-lucide="medal"></i> #2</span>`;
      } else if (rank === 3) {
        rankBadgeHtml = `<span class="rank-tag rank-3"><i data-lucide="medal"></i> #3</span>`;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${rankBadgeHtml}</td>
        <td>
          <div class="table-user-cell">
            <img src="${item.avatar_url}" alt="${item.name}" class="table-user-avatar" onerror="this.src='https://github.com/identicons/${item.login}.png'">
            <div>
              <strong class="user-display-name">${item.name}</strong>
              <span class="user-handle-sub">@${item.login}</span>
            </div>
          </div>
        </td>
        <td>
          <div class="contributor-badges-wrap">
            ${badges.map(b => `<span class="role-pill-badge ${b.tagClass}"><i data-lucide="${b.lucideIcon}"></i> ${b.label}</span>`).join("")}
          </div>
        </td>
        <td>
          <a href="https://github.com/${item.login}" target="_blank" class="github-handle-link">@${item.login}</a>
        </td>
        <td style="text-align: center;">
          <span class="games-count-pill" title="${(item.games || []).join(', ')}"><i data-lucide="gamepad-2"></i> ${item.gamesCount}</span>
        </td>
        <td style="text-align: center;">
          <span class="files-count-pill" title="Universal Score: ${(item.gamesCount || 0) * 100}p (Games) + ${(item.mechanicsBonus || 0) * 25}p (Mechanics) + ${(item.platformPRs || 0) * 50}p (Feat) + ${(item.qualityPRs || 0) * 25}p (Fix) + ${(item.commits || 0) * 5}p (Commits)"><i data-lucide="git-pull-request"></i> ${getWorkBreakdown(item)}</span>
        </td>
        <td style="text-align: center;">
          <span class="commits-count-pill"><i data-lucide="git-commit"></i> ${item.commits}</span>
        </td>
        <td style="text-align: center;">
          <div class="activity-links-group">
            <a href="https://github.com/DebasmitaBose0/ArcadeVerse/issues?q=author%3A${item.login}" target="_blank" rel="noopener noreferrer" class="activity-link-btn" title="View Issues authored by @${item.login}">
              <i data-lucide="circle-dot"></i> Issues
            </a>
            <a href="https://github.com/DebasmitaBose0/ArcadeVerse/pulls?q=author%3A${item.login}" target="_blank" rel="noopener noreferrer" class="activity-link-btn" title="View Pull Requests by @${item.login}">
              <i data-lucide="git-pull-request"></i> PRs
            </a>
          </div>
        </td>
        <td style="text-align: right;">
          <strong class="score-highlight">${score} pts</strong>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // Update Dedicated Admin Card at the top with live metadata
  function updateAdminSpotlight(adminUser) {
    if (!adminUser || !adminMetaInfo) return;
    const score = calculateScore(adminUser);
    adminMetaInfo.textContent = `${adminUser.commits} Commits • ${adminUser.gamesCount} Games • ${score} pts`;

    const adminBadgesContainer = document.getElementById("admin-badges-row");
    if (adminBadgesContainer) {
      const badges = getContributorBadges(adminUser);
      adminBadgesContainer.innerHTML = badges.map(b => `
        <span class="role-pill-badge ${b.tagClass}" title="${b.title}"><i data-lucide="${b.lucideIcon}"></i> ${b.role}</span>
      `).join("");
      if (window.lucide) {
        lucide.createIcons();
      }
    }
  }

  // Resolve display name synchronously without secondary API calls
  function resolveDisplayName(login) {
    if (!login) return "Contributor";
    const lower = login.toLowerCase();

    // Check CONTRIBUTORS_REGISTRY first
    if (typeof CONTRIBUTORS_REGISTRY !== "undefined" && Array.isArray(CONTRIBUTORS_REGISTRY)) {
      const match = CONTRIBUTORS_REGISTRY.find(c => c.github && c.github.toLowerCase() === lower);
      if (match && match.name) return match.name;
    }

    // Check GAMES_REGISTRY
    if (typeof GAMES_REGISTRY !== "undefined" && Array.isArray(GAMES_REGISTRY)) {
      const match = GAMES_REGISTRY.find(g => g.github && g.github.toLowerCase() === lower);
      if (match && match.author) return match.author;
    }

    return login;
  }

  // Live GitHub Contributions with LocalStorage TTL Cache & Zero Secondary Requests
  async function fetchLiveGitHubContributions(repo = "DebasmitaBose0/ArcadeVerse", forceRefresh = false) {
    if (!repo) return;

    // Check LocalStorage Cache first (unless force-refreshed)
    if (!forceRefresh) {
      try {
        const cachedRaw = localStorage.getItem(`${CACHE_KEY}_${repo}`);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const isFresh = (Date.now() - cached.timestamp) < CACHE_TTL;
          if (isFresh && Array.isArray(cached.data) && cached.data.length > 0) {
            contributorsData = cached.data;
            const adminItem = contributorsData.find(c => c.login && c.login.toLowerCase() === "debasmitabose0");
            if (adminItem) updateAdminSpotlight(adminItem);

            renderPodium();
            renderTable();
            if (syncStatusText) {
              const minutesAgo = Math.floor((Date.now() - cached.timestamp) / 60000);
              syncStatusText.textContent = `Cached GitHub data (${minutesAgo}m ago • ${contributorsData.length} contributors)`;
            }
            return;
          }
        }
      } catch (e) {
        console.warn("Could not read from cache:", e);
      }
    }

    if (syncStatusText) syncStatusText.textContent = `Connecting to GitHub API (${repo})...`;

    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/contributors`);

      if (response.status === 403) {
        throw new Error("RATE_LIMIT");
      }

      if (!response.ok) {
        throw new Error(`GitHub returned status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        // Map contributors in O(1) time per item - ZERO secondary network requests!
        const enrichedContributors = data.map((user) => {
          const isAdmin = user.login.toLowerCase() === "debasmitabose0";

          // Check if contributor exists in CONTRIBUTORS_REGISTRY or initial baseline data
          let registryEntry = null;
          if (typeof CONTRIBUTORS_REGISTRY !== "undefined" && Array.isArray(CONTRIBUTORS_REGISTRY)) {
            registryEntry = CONTRIBUTORS_REGISTRY.find(c => c.github && c.github.toLowerCase() === user.login.toLowerCase());
          }
          const localEntry = contributorsData.find(c => c.login && c.login.toLowerCase() === user.login.toLowerCase());

          const displayName = registryEntry ? registryEntry.name : (localEntry ? localEntry.name : resolveDisplayName(user.login));

          // Count registered games from GAMES_REGISTRY
          let userGames = [];
          if (typeof GAMES_REGISTRY !== "undefined" && Array.isArray(GAMES_REGISTRY)) {
            userGames = GAMES_REGISTRY.filter(g => g.github && g.github.toLowerCase() === user.login.toLowerCase());
          }
          const gamesCount = userGames.length > 0 
            ? userGames.length 
            : (registryEntry ? (registryEntry.gamesCount || 0) : (localEntry ? (localEntry.gamesCount || 0) : (isAdmin ? 2 : 0)));

          const mechanicsBonus = registryEntry?.mechanicsBonus ?? localEntry?.mechanicsBonus ?? (isAdmin ? 2 : 0);
          const platformPRs = registryEntry?.platformPRs ?? localEntry?.platformPRs ?? (isAdmin ? 2 : 0);
          const qualityPRs = registryEntry?.qualityPRs ?? localEntry?.qualityPRs ?? (isAdmin ? 0 : 1);
          const bonusPts = registryEntry?.bonusPts ?? localEntry?.bonusPts ?? 0;

          return {
            login: user.login,
            name: displayName,
            avatar_url: user.avatar_url,
            commits: user.contributions,
            gamesCount: gamesCount,
            mechanicsBonus: mechanicsBonus,
            platformPRs: platformPRs,
            qualityPRs: qualityPRs,
            bonusPts: bonusPts,
            games: userGames.length > 0 
              ? userGames.map(g => g.title) 
              : (localEntry?.games && localEntry.games.length > 0 ? localEntry.games : (isAdmin ? ["Quantum Memory Matrix", "Cyber Neon Pong"] : []))
          };
        });

        contributorsData = enrichedContributors;

        try {
          localStorage.setItem(`${CACHE_KEY}_${repo}`, JSON.stringify({
            timestamp: Date.now(),
            data: enrichedContributors
          }));
        } catch (e) {
          console.warn("Could not save to cache:", e);
        }

        const adminUser = contributorsData.find(c => c.login.toLowerCase() === "debasmitabose0");
        if (adminUser) updateAdminSpotlight(adminUser);

        const communityCount = contributorsData.filter(c => c.login.toLowerCase() !== "debasmitabose0").length;
        if (syncStatusText) syncStatusText.textContent = `GitHub Live Sync: 1 Admin Lead • ${communityCount} Community Contributor(s) active`;
      }
    } catch (err) {
      console.warn("GitHub API notice:", err.message);
      if (syncStatusText) {
        syncStatusText.innerHTML = err.message === "RATE_LIMIT"
          ? `<i data-lucide="alert-triangle" style="width: 14px; height: 14px; vertical-align: -2px; margin-right: 4px; color: #f59e0b;"></i> GitHub API rate limit reached (60/hr). Showing cached/local data.`
          : `Offline/Cached state: ${repo} (Rate limit safe)`;
        if (window.lucide) lucide.createIcons();
      }
    }

    // Render Clean Contributor Views
    renderPodium();
    renderTable();
  }

  if (fetchBtn) {
    fetchBtn.addEventListener("click", () => {
      const repo = repoInput ? repoInput.value.trim() : "DebasmitaBose0/ArcadeVerse";
      fetchBtn.disabled = true;
      fetchBtn.innerHTML = `<i data-lucide="loader-2" class="spin" style="width: 14px; height: 14px; vertical-align: -2px; margin-right: 4px;"></i> Syncing...`;
      if (window.lucide) lucide.createIcons();
      fetchLiveGitHubContributions(repo, true).finally(() => {
        setTimeout(() => {
          fetchBtn.disabled = false;
          fetchBtn.innerHTML = `<i data-lucide="refresh-cw" style="width: 14px; height: 14px; vertical-align: -2px; margin-right: 4px;"></i> Refresh Stats`;
          if (window.lucide) lucide.createIcons();
        }, 1000);
      });
    });
  }

  // Initial Run: Sync verified registry data first and render podium/table
  loadRegistryContributors();
  const initialAdmin = contributorsData.find(c => c.login.toLowerCase() === "debasmitabose0");
  if (initialAdmin) updateAdminSpotlight(initialAdmin);
  renderPodium();
  renderTable();
  fetchLiveGitHubContributions("DebasmitaBose0/ArcadeVerse", false);
});
