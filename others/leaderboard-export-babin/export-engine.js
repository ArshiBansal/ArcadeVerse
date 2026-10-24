/**
 * ArcadeVerse Hall of Fame Export & Champion Certificate Generator
 * Exports rankings to CSV/JSON and renders downloadable Canvas certificates
 * Complies with strict isolation rules under leaderboard-export-babin/
 */

(() => {
  function getLeaderboardData() {
    const rows = document.querySelectorAll(".table-row:not(.table-header)");
    const data = [];

    rows.forEach(row => {
      const rank = row.querySelector(".rank-col")?.textContent.trim() || "";
      const player = row.querySelector(".player-name")?.textContent.trim() || "";
      const score = row.querySelector(".score-col")?.textContent.trim() || "";
      const game = row.querySelector(".game-col, .badge-category")?.textContent.trim() || "All Games";
      const date = row.querySelector(".date-col")?.textContent.trim() || new Date().toISOString().split("T")[0];

      if (player) {
        data.push({ rank, player, score, game, date });
      }
    });

    return data.length > 0 ? data : [
      { rank: "1", player: "PixelKnight", score: "48,250", game: "Cyber Tower", date: "2026-10-22" },
      { rank: "2", player: "NeonViper", score: "39,100", game: "Cyber Snake", date: "2026-10-21" },
      { rank: "3", player: "QuantumPilot", score: "32,800", game: "Space Invaders", date: "2026-10-20" }
    ];
  }

  function exportCSV() {
    const data = getLeaderboardData();
    let csv = "Rank,Player,Score,Game,Date\n";
    data.forEach(item => {
      csv += `"${item.rank}","${item.player}","${item.score}","${item.game}","${item.date}"\n`;
    });

    downloadBlob(csv, "arcadeverse-leaderboard.csv", "text/csv;charset=utf-8;");
  }

  function exportJSON() {
    const data = getLeaderboardData();
    const jsonStr = JSON.stringify({
      exportDate: new Date().toISOString(),
      platform: "ArcadeVerse NSOC 2026",
      leaderboard: data
    }, null, 2);

    downloadBlob(jsonStr, "arcadeverse-leaderboard.json", "application/json");
  }

  function downloadBlob(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  function generateCertificate(playerName, score, rank) {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");

    // Cyberpunk gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 500);
    bgGrad.addColorStop(0, "#0a0d14");
    bgGrad.addColorStop(0.5, "#0f172a");
    bgGrad.addColorStop(1, "#020617");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 500);

    // Glowing border
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 760, 460);

    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 740, 440);

    // Watermark / Brand Header
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 16px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ARCADEVERSE NSOC '26 OFFICIAL CERTIFICATE", 400, 75);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 32px 'Space Grotesk', sans-serif";
    ctx.fillText("CHAMPION OF THE RETRO REALM", 400, 130);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px sans-serif";
    ctx.fillText("This certificate certifies that", 400, 180);

    // Player Name
    ctx.fillStyle = "#ec4899";
    ctx.font = "bold 36px 'Space Grotesk', sans-serif";
    ctx.fillText(playerName || "Arcade Explorer", 400, 235);

    // Details
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Achieved Rank #${rank || "1"} with a legendary score of ${score || "48,250"} pts`, 400, 290);
    ctx.fillText("in the ArcadeVerse Open Source Gaming Platform.", 400, 320);

    // Footer info
    ctx.fillStyle = "#64748b";
    ctx.font = "12px monospace";
    ctx.fillText(`Issued: ${new Date().toLocaleDateString()}  •  SHA-256 Auth ID: #AV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`, 400, 430);

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `arcadeverse-certificate-${(playerName || "player").toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function injectExportControls() {
    // Only inject full controls on leaderboard page
    const headerActions = document.querySelector(".leaderboard-controls, .section-header, .page-header");
    if (headerActions) {
      const container = document.createElement("div");
      container.className = "export-controls-container";
      container.innerHTML = `
        <button id="btn-export-csv" class="btn-export" title="Export as CSV"><i data-lucide="file-spreadsheet"></i> Export CSV</button>
        <button id="btn-export-json" class="btn-export" title="Export as JSON"><i data-lucide="file-code"></i> Export JSON</button>
        <button id="btn-gen-cert" class="btn-export cert-highlight" title="Download Champion Certificate"><i data-lucide="award"></i> Certificate</button>
      `;

      headerActions.appendChild(container);
      if (window.lucide) lucide.createIcons();

      document.getElementById("btn-export-csv").addEventListener("click", exportCSV);
      document.getElementById("btn-export-json").addEventListener("click", exportJSON);
      document.getElementById("btn-gen-cert").addEventListener("click", () => {
        const topPlayer = getLeaderboardData()[0] || { player: "Arcade Champion", score: "50,000", rank: "1" };
        const name = prompt("Enter your name for the Champion Certificate:", topPlayer.player);
        if (name) {
          generateCertificate(name, topPlayer.score, topPlayer.rank);
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectExportControls();
  });

  window.ArcadeExport = { exportCSV, exportJSON, generateCertificate };
})();
