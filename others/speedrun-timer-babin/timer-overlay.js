/**
 * ArcadeVerse Speedrun & Challenge Timer - LiveSplit Floating Overlay
 * Compact on-screen HUD with real-time delta badges and hotkey listener.
 */
(function(window) {
  'use strict';

  class TimerOverlay {
    constructor() {
      this.engine = new window.ArcadeSpeedrunEngine();
      this.storage = window.ArcadeSplitStorage;
      this.containerEl = null;
      this.mainTimerEl = null;
      this.splitsListEl = null;
      this.currentGame = 'cyber-snake';
      this.init();
    }

    init() {
      if (document.getElementById('arcade-speedrun-hud')) return;

      const hud = document.createElement('div');
      hud.id = 'arcade-speedrun-hud';
      hud.className = 'speedrun-hud';
      hud.innerHTML = `
        <div class="hud-header">
          <span class="hud-game-name" id="hud-cat-title">Speedrun Timer</span>
          <span class="hud-hotkey-badge">Space: Split | R: Reset</span>
        </div>
        <div class="hud-splits-body" id="hud-splits-body"></div>
        <div class="hud-timer-footer">
          <span class="hud-main-time" id="hud-main-time">00:00.00</span>
        </div>
      `;

      document.body.appendChild(hud);
      this.containerEl = hud;
      this.mainTimerEl = hud.querySelector('#hud-main-time');
      this.splitsListEl = hud.querySelector('#hud-splits-body');
      this.catTitleEl = hud.querySelector('#hud-cat-title');

      this.loadCategory(this.currentGame);
      this.bindEngine();
      this.bindHotkeys();
    }

    loadCategory(gameId) {
      this.currentGame = gameId;
      const cat = this.storage.getCategory(gameId);
      this.catTitleEl.textContent = cat.title;

      const splitNames = cat.splits.map(s => s.name);
      this.engine.setCategory(gameId, splitNames);
      this.renderSplits();
    }

    renderSplits() {
      const cat = this.storage.getCategory(this.currentGame);
      this.splitsListEl.innerHTML = '';

      this.engine.splits.forEach((split, idx) => {
        const row = document.createElement('div');
        row.className = `split-row ${idx === this.engine.currentSplitIndex ? 'split-row-active' : ''}`;
        row.id = `split-row-${idx}`;

        const pbTime = cat.splits[idx] && cat.splits[idx].time ? window.ArcadeSpeedrunEngine.formatTime(cat.splits[idx].time) : '-';
        row.innerHTML = `
          <span class="split-name">${split.name}</span>
          <span class="split-delta" id="split-delta-${idx}"></span>
          <span class="split-pb">${pbTime}</span>
        `;
        this.splitsListEl.appendChild(row);
      });
    }

    bindEngine() {
      this.engine.onTick = (ms) => {
        if (this.mainTimerEl) {
          this.mainTimerEl.textContent = window.ArcadeSpeedrunEngine.formatTime(ms);
        }
      };

      this.engine.onSplit = (split, idx) => {
        const deltaEl = document.getElementById(`split-delta-${idx}`);
        const row = document.getElementById(`split-row-${idx}`);
        if (row) row.classList.remove('split-row-active');

        const nextRow = document.getElementById(`split-row-${idx + 1}`);
        if (nextRow) nextRow.classList.add('split-row-active');

        if (deltaEl && split.delta !== null) {
          const isAhead = split.delta < 0;
          const deltaStr = (isAhead ? '-' : '+') + (Math.abs(split.delta) / 1000).toFixed(2) + 's';
          deltaEl.textContent = deltaStr;
          deltaEl.className = 'split-delta ' + (isAhead ? 'delta-ahead' : 'delta-behind');
        }
      };

      this.engine.onFinish = (finalTime, splits) => {
        this.storage.saveRun(this.currentGame, splits, finalTime);
        this.mainTimerEl.classList.add('timer-finished');
      };
    }

    bindHotkeys() {
      window.addEventListener('keydown', (e) => {
        // Space or NumPad1: Start / Split
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          if (this.engine.state === 'IDLE') {
            this.engine.start();
          } else if (this.engine.state === 'RUNNING') {
            const cat = this.storage.getCategory(this.currentGame);
            this.engine.split(cat.splits);
          }
        }
        // 'R' key: Reset
        if ((e.key === 'r' || e.key === 'R') && e.target.tagName !== 'INPUT') {
          this.engine.reset();
          this.mainTimerEl.classList.remove('timer-finished');
          this.renderSplits();
        }
      });
    }
  }

  window.ArcadeTimerOverlay = TimerOverlay;
})(window);
